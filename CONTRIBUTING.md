# Contributing to Multi-Vendor Pharmacy Platform

Thank you for your interest in contributing! This document provides guidelines and best practices for contributing to the project.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)

---

## Code of Conduct

### Our Standards
- Be respectful and inclusive
- Welcome constructive feedback
- Focus on what's best for the project
- Show empathy towards other contributors

### Unacceptable Behavior
- Harassment or discriminatory language
- Personal attacks
- Publishing others' private information
- Other unprofessional conduct

---

## Getting Started

### Prerequisites
1. Read the [README.md](README.md)
2. Follow the [GETTING-STARTED.md](GETTING-STARTED.md) guide
3. Set up your development environment
4. Familiarize yourself with the codebase

### Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/Muti-Vendor-Pharmacy-App.git
cd Muti-Vendor-Pharmacy-App

# Add upstream remote
git remote add upstream https://github.com/Haitch007jnr/Muti-Vendor-Pharmacy-App.git

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development environment
docker-compose up -d
```

---

## Development Workflow

### Branch Strategy

```
main (production)
  └── develop (staging)
       ├── feature/feature-name
       ├── bugfix/bug-description
       ├── hotfix/critical-fix
       └── refactor/code-improvement
```

### Creating a New Branch

```bash
# Update your local develop branch
git checkout develop
git pull upstream develop

# Create a feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b bugfix/issue-123-description
```

### Branch Naming Convention

- `feature/` - New features
- `bugfix/` - Bug fixes
- `hotfix/` - Critical production fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates
- `test/` - Test additions or modifications

Examples:
- `feature/user-authentication`
- `bugfix/issue-42-login-error`
- `refactor/payment-service`
- `docs/api-endpoints`

---

## Coding Standards

### TypeScript/JavaScript

#### Style Guide
- Use TypeScript for all new code
- Follow ESLint rules
- Use Prettier for formatting
- Prefer functional programming patterns
- Use meaningful variable names

#### Example

```typescript
// ❌ Bad
const x = async (id) => {
  const data = await db.find(id);
  return data;
};

// ✅ Good
const findUserById = async (userId: string): Promise<User> => {
  const user = await userRepository.findOne({ where: { id: userId } });
  
  if (!user) {
    throw new UserNotFoundException(userId);
  }
  
  return user;
};
```

### NestJS Backend

#### Module Structure
```typescript
// users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

#### Service Pattern
```typescript
// users.service.ts
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return await this.usersRepository.save(user);
  }

  async findAll(queryDto: QueryUserDto): Promise<PaginatedResult<User>> {
    const { page = 1, limit = 20 } = queryDto;
    const [users, total] = await this.usersRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
```

#### Controller Pattern
```typescript
// users.controller.ts
@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  async findAll(@Query() queryDto: QueryUserDto) {
    return this.usersService.findAll(queryDto);
  }
}
```

### Database

#### Entity Definition
```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

#### Migration Best Practices
- Always test migrations locally
- Write reversible migrations
- Use descriptive names
- Include comments for complex changes

---

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
# Feature
git commit -m "feat(auth): implement JWT authentication"

# Bug fix
git commit -m "fix(orders): resolve payment status update issue"

# Documentation
git commit -m "docs(api): add payment gateway integration guide"

# Multiple lines
git commit -m "feat(products): add product search functionality

- Implement full-text search
- Add filters for category and price
- Include pagination support

Closes #123"
```

### Commit Best Practices
- Write clear, concise commit messages
- Use present tense ("add feature" not "added feature")
- Reference issue numbers when applicable
- Keep commits atomic and focused
- Don't commit commented-out code
- Don't commit sensitive information

---

## Pull Request Process

### Before Submitting

1. **Update your branch**
   ```bash
   git checkout develop
   git pull upstream develop
   git checkout your-feature-branch
   git rebase develop
   ```

2. **Run tests**
   ```bash
   npm run test
   npm run test:e2e
   npm run lint
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated

## Screenshots (if applicable)

## Related Issues
Closes #123
```

### PR Guidelines

1. **Title**: Clear and descriptive
2. **Description**: Explain what and why
3. **Size**: Keep PRs small and focused
4. **Tests**: Include relevant tests
5. **Documentation**: Update if needed
6. **Review**: Request review from maintainers

### Review Process

1. Automated checks must pass
2. At least one approval required
3. No merge conflicts
4. All comments addressed
5. Documentation updated

---

## Testing Guidelines

### Unit Tests

```typescript
describe('UsersService', () => {
  let service: UsersService;
  let repository: MockType<Repository<User>>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      const userId = 'uuid-123';
      const expectedUser = { id: userId, email: 'test@example.com' };
      
      repository.findOne.mockReturnValue(expectedUser);

      const result = await service.findOne(userId);
      
      expect(result).toEqual(expectedUser);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
    });

    it('should throw NotFoundException if user not found', async () => {
      repository.findOne.mockReturnValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        UserNotFoundException,
      );
    });
  });
});
```

### Integration Tests

```typescript
describe('Users API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/users (POST)', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({
        email: 'test@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.email).toBe('test@example.com');
      });
  });
});
```

### Test Coverage

- Aim for >80% code coverage
- Cover edge cases
- Test error handling
- Test validation logic
- Mock external dependencies

---

## Documentation

### Code Documentation

```typescript
/**
 * Creates a new user in the system
 * 
 * @param createUserDto - The user data transfer object
 * @returns The created user entity
 * @throws {EmailAlreadyExistsException} If email is already registered
 * @example
 * const user = await usersService.create({
 *   email: 'john@example.com',
 *   password: 'SecurePass123!',
 *   firstName: 'John',
 *   lastName: 'Doe'
 * });
 */
async create(createUserDto: CreateUserDto): Promise<User> {
  // Implementation
}
```

### API Documentation

Use Swagger decorators extensively:

```typescript
@ApiTags('Users')
@Controller('users')
export class UsersController {
  @Post()
  @ApiOperation({ 
    summary: 'Create a new user',
    description: 'Register a new user in the system'
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ 
    status: 201, 
    description: 'User created successfully',
    type: User
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid input data' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Email already exists' 
  })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
```

---

## Questions?

- **Documentation**: Check `/docs` directory
- **Slack**: Join our [Slack channel](#)
- **Email**: dev@pharmacy.com
- **Issues**: [GitHub Issues](https://github.com/Haitch007jnr/Muti-Vendor-Pharmacy-App/issues)

---

Thank you for contributing! 🎉
