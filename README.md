# Multi-Vendor Pharmacy Store Platform

A comprehensive pharmacy e-commerce platform with multi-vendor support, featuring responsive web portals and mobile applications for customers, vendors, and delivery personnel.

## 🏗️ Architecture

This is a monorepo project using **Turborepo** for efficient build management across multiple applications and shared packages.

### Technology Stack

- **Backend**: Node.js with NestJS (TypeScript)
- **Frontend**: Next.js 14 (React, TypeScript)
- **Mobile**: React Native (iOS & Android)
- **Database**: PostgreSQL
- **Cache**: Redis
- **Payment**: Paystack & Monnify
- **Notifications**: SendGrid (Email), Twilio (SMS), Firebase (Push)
- **File Storage**: AWS S3
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest, React Testing Library, Supertest
- **CI/CD**: GitHub Actions
- **Container**: Docker & Docker Compose

## 📁 Project Structure

```
Muti-Vendor-Pharmacy-App/
├── apps/
│   ├── api/                    # NestJS API Backend
│   ├── web-admin/              # Admin Portal (Next.js)
│   ├── web-vendor/             # Vendor Portal (Next.js)
│   ├── mobile-customer/        # Customer Mobile App (React Native)
│   ├── mobile-vendor/          # Vendor Mobile App (React Native)
│   └── mobile-delivery/        # Delivery Personnel App (React Native)
├── packages/
│   ├── shared/                 # Shared utilities and types
│   ├── ui-components/          # Shared React components
│   ├── database/               # Database schemas and migrations
│   └── config/                 # Shared configurations
├── database/
│   ├── migrations/             # Database migration files
│   ├── seeds/                  # Database seed files
│   └── init/                   # Initial database setup scripts
├── docs/                       # Documentation
│   ├── api/                    # API documentation
│   ├── architecture/           # Architecture diagrams
│   └── guides/                 # User and developer guides
├── scripts/                    # Utility scripts
├── docker-compose.yml
├── turbo.json
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker & Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Haitch007jnr/Muti-Vendor-Pharmacy-App.git
   cd Muti-Vendor-Pharmacy-App
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development environment**
   ```bash
   # Using Docker Compose (Recommended)
   docker-compose up -d
   
   # Or run services individually
   npm run dev
   ```

5. **Access the applications**
   - API: http://localhost:4000
   - Admin Portal: http://localhost:3000
   - Vendor Portal: http://localhost:3001
   - API Documentation: http://localhost:4000/api/docs

## 📋 Implementation Roadmap

### Phase 1: Core Infrastructure & Architecture ✅
- [x] System architecture and technology stack finalization
- [x] Database schema design for multi-vendor, multi-tenant operations
- [x] Authentication and authorization framework (Dynamic RBAC)
- [x] API gateway and service layer structure
- [x] Payment gateway abstraction layer (Paystack/Monnify)

### Phase 2: Business Management Modules
- [ ] Expense Management
- [ ] Client Management
- [ ] Supplier Management
- [ ] Employee & Department Management

### Phase 3: Financial Operations
- [ ] Purchase Management
- [ ] Sales Management
- [ ] Point of Sale (POS)

### Phase 4: Inventory & Accounting
- [ ] Inventory Management
- [ ] Accounting Management
- [ ] Payroll Management

### Phase 5: Advanced Financial Features
- [ ] Loan Management
- [ ] Asset Management

### Phase 6: Payment Gateway Integration
- [ ] Paystack integration (Web & Mobile)
- [ ] Monnify integration (Web & Mobile)
- [ ] Webhook handling and reconciliation

### Phase 7: Notification System
- [ ] Email service (SendGrid)
- [ ] SMS service (Twilio)
- [ ] Push notifications (Firebase)
- [ ] Template management

### Phase 8: Web Applications
- [ ] Responsive UI/UX design
- [ ] Admin portal
- [ ] Vendor portal
- [ ] Real-time dashboards

### Phase 9: Mobile Applications
- [ ] Customer mobile app
- [ ] Vendor mobile app
- [ ] Delivery personnel app

### Phase 10: Quality Assurance & Documentation
- [ ] Testing (Unit, Integration, E2E)
- [ ] Performance optimization
- [ ] Security audits
- [ ] Complete documentation

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start all apps in development mode
npm run dev:api          # Start API only
npm run dev:web-admin    # Start admin portal only
npm run dev:web-vendor   # Start vendor portal only

# Build
npm run build            # Build all apps
npm run build:api        # Build API only

# Testing
npm run test             # Run all tests
npm run test:coverage    # Run tests with coverage
npm run test:e2e         # Run end-to-end tests

# Database
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database with test data
npm run db:reset         # Reset database

# Code Quality
npm run lint             # Lint all code
npm run format           # Format code with Prettier
npm run type-check       # TypeScript type checking

# Docker
docker-compose up -d     # Start all services
docker-compose down      # Stop all services
docker-compose logs -f   # View logs
```

## 🔐 Authentication & Authorization

The platform implements a **Dynamic Role-Based Access Control (RBAC)** system with the following roles:

- **Super Admin**: Full system access
- **Admin**: Platform management
- **Vendor**: Store management
- **Staff**: Employee operations
- **Customer**: Shopping and orders
- **Delivery**: Order fulfillment

## 💳 Payment Integration

### Paystack
- Card payments
- Bank transfers
- USSD
- Mobile money

### Monnify
- Card payments
- Bank transfers
- Account transfers

## 📱 Mobile Apps

Built with React Native for cross-platform support:

### Customer App
- Product browsing and search
- Prescription upload
- Order tracking
- Payment integration

### Vendor App
- Inventory management
- Order fulfillment
- Sales analytics
- Financial reports

### Delivery App
- Order assignments
- GPS navigation
- Status updates
- Payment confirmation

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📊 Success Metrics

- ✅ Zero critical bugs in production
- ✅ System uptime ≥ 99.5%
- ✅ Sub-second API response times
- ✅ Payment success rate ≥ 99%
- ✅ User satisfaction score ≥ 4.5/5

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is proprietary and confidential.

## 👥 Team

- Project Lead: [Idris Hamisu]
- Backend Team: [Idris Hamisu]
- Frontend Team: [Idris Hamisu]
- Mobile Team: [Idris Hamisu]
- DevOps Team: [Idris Hamisu]

## 📞 Support

For support and queries:
- Email: info@mygetwell.app
- Documentation: [Link to docs]
- Issue Tracker: GitHub Issues

---

**Built with ❤️ by Haitch Tech Solutions**
