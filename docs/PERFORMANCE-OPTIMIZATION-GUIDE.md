# Performance Optimization Guide

## Overview

This guide provides strategies and best practices for optimizing the performance of the Multi-Vendor Pharmacy Platform.

## Table of Contents

1. [Database Optimization](#database-optimization)
2. [API Performance](#api-performance)
3. [Caching Strategy](#caching-strategy)
4. [Frontend Optimization](#frontend-optimization)
5. [Mobile App Optimization](#mobile-app-optimization)
6. [Monitoring & Profiling](#monitoring--profiling)

---

## Database Optimization

### 1. Indexing Strategy

#### Critical Indexes

```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_status ON users(status);

-- Product searches
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_name_gin ON products USING gin(to_tsvector('english', name));

-- Order queries
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_vendor_id ON orders(vendor_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Payment lookups
CREATE INDEX idx_payments_reference ON payments(reference);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

-- Inventory tracking
CREATE INDEX idx_inventory_product_id ON inventory(product_id);
CREATE INDEX idx_inventory_vendor_id ON inventory(vendor_id);
CREATE INDEX idx_inventory_quantity ON inventory(quantity);
```

### 2. Query Optimization

#### Use Proper Relations

```typescript
// Bad - N+1 Query Problem
const users = await userRepository.find();
for (const user of users) {
  user.orders = await orderRepository.find({ where: { userId: user.id } });
}

// Good - Eager Loading
const users = await userRepository.find({
  relations: ['orders'],
});
```

#### Use Query Builder for Complex Queries

```typescript
// Complex query with joins
const products = await productRepository
  .createQueryBuilder('product')
  .leftJoinAndSelect('product.vendor', 'vendor')
  .leftJoinAndSelect('product.inventory', 'inventory')
  .where('product.status = :status', { status: 'active' })
  .andWhere('inventory.quantity > :minQuantity', { minQuantity: 0 })
  .orderBy('product.createdAt', 'DESC')
  .take(20)
  .getMany();
```

#### Use Pagination

```typescript
// Always paginate large datasets
const [products, total] = await productRepository.findAndCount({
  take: pageSize,
  skip: (page - 1) * pageSize,
  order: { createdAt: 'DESC' },
});
```

### 3. Connection Pooling

```typescript
// apps/api/src/config/database.config.ts
export const databaseConfig = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  
  // Connection pool settings
  extra: {
    max: 20,                    // Maximum connections
    min: 5,                     // Minimum connections
    idleTimeoutMillis: 30000,   // Close idle connections after 30s
    connectionTimeoutMillis: 2000, // Timeout for new connections
  },
  
  // Performance settings
  logging: process.env.NODE_ENV === 'development',
  synchronize: false,
  migrationsRun: true,
};
```

### 4. Avoid SELECT *

```typescript
// Bad
const users = await userRepository.find();

// Good - Select only needed columns
const users = await userRepository.find({
  select: ['id', 'email', 'firstName', 'lastName'],
});
```

---

## API Performance

### 1. Response Compression

```typescript
// apps/api/src/main.ts
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable compression
  app.use(compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    level: 6, // Compression level (0-9)
  }));
  
  await app.listen(4000);
}
```

### 2. Rate Limiting

```typescript
// apps/api/src/main.ts
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,      // Time window in seconds
      limit: 100,   // Max requests per window
    }),
  ],
})
export class AppModule {}
```

### 3. Optimize Serialization

```typescript
// Use class-transformer for efficient serialization
import { Exclude, Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  id: string;
  
  @Expose()
  email: string;
  
  @Expose()
  firstName: string;
  
  @Expose()
  lastName: string;
  
  @Exclude()
  passwordHash: string; // Never send passwords
  
  @Exclude()
  refreshToken: string; // Sensitive data
}
```

### 4. Async/Await Best Practices

```typescript
// Bad - Sequential execution
const user = await userService.findOne(id);
const orders = await orderService.findByUser(id);
const payments = await paymentService.findByUser(id);

// Good - Parallel execution
const [user, orders, payments] = await Promise.all([
  userService.findOne(id),
  orderService.findByUser(id),
  paymentService.findByUser(id),
]);
```

---

## Caching Strategy

### 1. Redis Configuration

```typescript
// apps/api/src/config/redis.config.ts
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      ttl: 600, // Default TTL in seconds
      max: 1000, // Maximum number of items in cache
    }),
  ],
})
export class AppModule {}
```

### 2. Cache Decorators

```typescript
import { Injectable, CacheKey, CacheTTL } from '@nestjs/cache-manager';

@Injectable()
export class ProductService {
  // Cache for 5 minutes
  @CacheKey('products_all')
  @CacheTTL(300)
  async findAll(): Promise<Product[]> {
    return this.productRepository.find();
  }
  
  // Cache individual products for 10 minutes
  @CacheKey('product')
  @CacheTTL(600)
  async findOne(id: string): Promise<Product> {
    return this.productRepository.findOne({ where: { id } });
  }
}
```

### 3. Cache Invalidation

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class ProductService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  
  async updateProduct(id: string, data: any): Promise<Product> {
    const product = await this.productRepository.save(data);
    
    // Invalidate caches
    await this.cacheManager.del(`product_${id}`);
    await this.cacheManager.del('products_all');
    
    return product;
  }
}
```

### 4. What to Cache

#### Good Candidates for Caching:
- ✅ Product catalog (changes infrequently)
- ✅ Category lists
- ✅ Configuration settings
- ✅ User permissions
- ✅ Dashboard statistics (with short TTL)
- ✅ Search results (with user-specific keys)

#### Poor Candidates for Caching:
- ❌ Real-time inventory levels
- ❌ Payment transaction status
- ❌ Order statuses
- ❌ User sessions (use Redis for this, not cache)
- ❌ Frequently changing data

---

## Frontend Optimization

### 1. Code Splitting

```typescript
// apps/web-admin/next.config.js
module.exports = {
  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
        },
      },
    };
    return config;
  },
};
```

### 2. Image Optimization

```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src="/product-image.jpg"
  alt="Product"
  width={300}
  height={300}
  loading="lazy"
  quality={75}
/>
```

### 3. API Client Optimization

```typescript
// Use SWR or React Query for efficient data fetching
import useSWR from 'swr';

function ProductList() {
  const { data, error } = useSWR('/api/products', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 60000, // Refresh every minute
  });
  
  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;
  
  return <div>{/* Render products */}</div>;
}
```

### 4. Lazy Loading Components

```typescript
import dynamic from 'next/dynamic';

// Lazy load heavy components
const HeavyChart = dynamic(
  () => import('../components/HeavyChart'),
  { loading: () => <p>Loading chart...</p> }
);
```

---

## Mobile App Optimization

### 1. List Performance

```typescript
// Use FlatList with optimization props
<FlatList
  data={products}
  renderItem={renderProduct}
  keyExtractor={(item) => item.id}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={10}
  removeClippedSubviews={true}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

### 2. Image Optimization

```typescript
// Use FastImage for better performance
import FastImage from 'react-native-fast-image';

<FastImage
  source={{
    uri: imageUrl,
    priority: FastImage.priority.normal,
    cache: FastImage.cacheControl.immutable,
  }}
  resizeMode={FastImage.resizeMode.cover}
  style={styles.image}
/>
```

### 3. Memoization

```typescript
import React, { useMemo, useCallback } from 'react';

function ProductItem({ product, onPress }) {
  // Memoize expensive calculations
  const discountedPrice = useMemo(() => {
    return calculateDiscount(product.price, product.discount);
  }, [product.price, product.discount]);
  
  // Memoize callbacks
  const handlePress = useCallback(() => {
    onPress(product.id);
  }, [product.id, onPress]);
  
  return (
    <TouchableOpacity onPress={handlePress}>
      <Text>{product.name}</Text>
      <Text>{discountedPrice}</Text>
    </TouchableOpacity>
  );
}

// Prevent unnecessary re-renders
export default React.memo(ProductItem);
```

---

## Monitoring & Profiling

### 1. Application Performance Monitoring (APM)

#### Setup New Relic or DataDog

```typescript
// apps/api/src/main.ts
import * as newrelic from 'newrelic';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // New Relic will automatically instrument the app
  await app.listen(4000);
}
```

### 2. Custom Performance Metrics

```typescript
@Injectable()
export class PerformanceService {
  constructor(private readonly logger: Logger) {}
  
  async measurePerformance<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = Date.now();
    
    try {
      const result = await fn();
      const duration = Date.now() - start;
      
      this.logger.log(`${operation} completed in ${duration}ms`);
      
      // Send to metrics service
      this.recordMetric(operation, duration);
      
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.logger.error(`${operation} failed after ${duration}ms`, error);
      throw error;
    }
  }
  
  private recordMetric(operation: string, duration: number): void {
    // Send to Prometheus, StatsD, or similar
  }
}
```

### 3. Database Query Profiling

```typescript
// Enable query logging in development
TypeOrmModule.forRoot({
  // ...
  logging: true,
  maxQueryExecutionTime: 1000, // Log queries taking > 1s
});
```

### 4. Performance Budgets

Create a performance budget:

```json
{
  "budgets": [
    {
      "resource": "bundle",
      "maxSize": "500kb"
    },
    {
      "resource": "api",
      "maxResponseTime": "500ms"
    },
    {
      "resource": "database",
      "maxQueryTime": "100ms"
    }
  ]
}
```

---

## Performance Testing

### Run Performance Tests

```bash
# Load test
artillery run artillery-config.yml

# Stress test
artillery run artillery-stress.yml

# Generate HTML report
artillery run artillery-config.yml --output report.json
artillery report report.json
```

### Performance Metrics to Track

1. **Response Time**
   - p50: 50th percentile (median)
   - p95: 95th percentile
   - p99: 99th percentile

2. **Throughput**
   - Requests per second
   - Concurrent users supported

3. **Error Rate**
   - 4xx errors (client errors)
   - 5xx errors (server errors)

4. **Resource Usage**
   - CPU utilization
   - Memory usage
   - Database connections
   - Cache hit rate

---

## Performance Checklist

### Database
- [ ] Proper indexes on frequently queried columns
- [ ] Connection pooling configured
- [ ] Pagination implemented for large datasets
- [ ] N+1 queries eliminated
- [ ] Query execution time monitored

### API
- [ ] Response compression enabled
- [ ] Rate limiting configured
- [ ] Caching strategy implemented
- [ ] Async operations used appropriately
- [ ] Proper error handling

### Frontend
- [ ] Code splitting implemented
- [ ] Images optimized
- [ ] Lazy loading for heavy components
- [ ] API responses cached
- [ ] Bundle size optimized

### Mobile
- [ ] FlatList optimization props used
- [ ] Images optimized with FastImage
- [ ] Unnecessary re-renders prevented
- [ ] Heavy computations memoized
- [ ] Bundle size minimized

### Monitoring
- [ ] APM tool integrated
- [ ] Custom metrics tracked
- [ ] Alerts configured
- [ ] Performance budgets set
- [ ] Regular performance testing

---

## Resources

- [TypeORM Performance Tips](https://typeorm.io/performance)
- [NestJS Performance](https://docs.nestjs.com/techniques/performance)
- [React Performance](https://react.dev/learn/render-and-commit)
- [React Native Performance](https://reactnative.dev/docs/performance)
- [Artillery Documentation](https://www.artillery.io/docs)
- [Web.dev Performance](https://web.dev/performance/)

---

## Support

For performance questions:
- Email: performance@pharmacy.com
- Slack: #performance
- Documentation: https://docs.pharmacy.com/performance
