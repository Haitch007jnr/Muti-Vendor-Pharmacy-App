# API Development Guidelines

## Code Structure

### Module Organization
Each feature should be organized as a NestJS module with the following structure:

```
module-name/
├── dto/
│   ├── create-entity.dto.ts
│   ├── update-entity.dto.ts
│   └── query-entity.dto.ts
├── entities/
│   └── entity.entity.ts
├── module-name.controller.ts
├── module-name.service.ts
├── module-name.module.ts
└── tests/
    ├── module-name.controller.spec.ts
    └── module-name.service.spec.ts
```

## API Response Format

### Success Response
```typescript
{
  success: true,
  message: "Operation completed successfully",
  data: {...},
  meta: {
    timestamp: "2025-12-16T10:00:00Z",
    requestId: "uuid"
  }
}
```

### Error Response
```typescript
{
  success: false,
  message: "Error description",
  error: {
    code: "ERROR_CODE",
    details: {...}
  },
  meta: {
    timestamp: "2025-12-16T10:00:00Z",
    requestId: "uuid"
  }
}
```

### Pagination Response
```typescript
{
  success: true,
  data: [...],
  pagination: {
    page: 1,
    limit: 20,
    total: 100,
    totalPages: 5
  }
}
```

## Validation Rules

### DTOs
- Use class-validator decorators
- Validate all input data
- Transform data types appropriately
- Provide meaningful error messages

```typescript
import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'John', required: false })
  @IsString()
  @IsOptional()
  firstName?: string;
}
```

## Error Handling

### Custom Exceptions
```typescript
import { HttpException, HttpStatus } from '@nestjs/common';

export class UserNotFoundException extends HttpException {
  constructor(userId: string) {
    super(
      {
        success: false,
        message: 'User not found',
        error: {
          code: 'USER_NOT_FOUND',
          details: { userId }
        }
      },
      HttpStatus.NOT_FOUND
    );
  }
}
```

## Authentication

### Protecting Routes
```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/modules/auth/decorators/roles.decorator';

@Controller('vendors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VendorsController {
  
  @Get()
  @Roles('admin', 'super_admin')
  findAll() {
    // Only accessible by admin and super_admin
  }
}
```

## Database Operations

### Repository Pattern
```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ 
      where: { id } 
    });
    
    if (!user) {
      throw new UserNotFoundException(id);
    }
    
    return user;
  }
}
```

## Testing

### Unit Tests
```typescript
describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

## Documentation

### Swagger Decorators
```typescript
@ApiTags('Users')
@Controller('users')
export class UsersController {
  
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
```

## Best Practices

1. **Always validate input data**
2. **Use TypeScript types everywhere**
3. **Handle errors gracefully**
4. **Log important operations**
5. **Write tests for critical functionality**
6. **Document all API endpoints**
7. **Use transactions for multi-step operations**
8. **Implement pagination for list endpoints**
9. **Cache frequently accessed data**
10. **Monitor performance metrics**
