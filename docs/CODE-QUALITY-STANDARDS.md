# Code Quality Standards

## Overview

This document defines the code quality standards and best practices for the Multi-Vendor Pharmacy Platform.

## Table of Contents

1. [TypeScript Standards](#typescript-standards)
2. [Testing Standards](#testing-standards)
3. [Code Review Checklist](#code-review-checklist)
4. [Git Workflow](#git-workflow)
5. [Documentation Standards](#documentation-standards)

---

## TypeScript Standards

### 1. Type Safety

#### Always Use Explicit Types

```typescript
// Bad
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Good
function calculateTotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

#### Use Interfaces for Object Shapes

```typescript
// Good
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

function getUser(id: string): Promise<User> {
  // ...
}
```

#### Avoid `any` Type

```typescript
// Bad
const data: any = await fetch('/api/users');

// Good
interface UserResponse {
  data: User[];
  total: number;
}

const response: UserResponse = await fetch('/api/users');
```

### 2. Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Class | PascalCase | `UserService`, `OrderController` |
| Interface | PascalCase | `IUser`, `OrderItem` |
| Type | PascalCase | `UserId`, `OrderStatus` |
| Function | camelCase | `calculateTotal`, `findUser` |
| Variable | camelCase | `userName`, `orderTotal` |
| Constant | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`, `API_BASE_URL` |
| Enum | PascalCase | `UserRole`, `OrderStatus` |
| Enum Values | UPPER_SNAKE_CASE | `ADMIN`, `PENDING` |

### 3. Code Organization

#### File Structure

```
src/
├── modules/
│   ├── users/
│   │   ├── __tests__/
│   │   │   └── users.service.spec.ts
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   └── update-user.dto.ts
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   └── ...
├── common/
│   ├── decorators/
│   ├── guards/
│   ├── interceptors/
│   └── pipes/
└── config/
```

#### Import Order

```typescript
// 1. External dependencies
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// 2. Internal modules
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

// 3. Type imports
import type { UserRole } from './types';
```

---

## Testing Standards

### 1. Test Structure

#### AAA Pattern (Arrange, Act, Assert)

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };
      
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.save.mockResolvedValue(mockUser);
      
      // Act
      const result = await service.createUser(createUserDto);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.email).toBe(createUserDto.email);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });
  });
});
```

### 2. Test Naming

```typescript
// Good test names
it('should return user when valid ID is provided')
it('should throw NotFoundException when user does not exist')
it('should hash password before saving user')

// Bad test names
it('works')
it('test user creation')
it('returns data')
```

### 3. Test Coverage Goals

| Category | Coverage | Priority |
|----------|----------|----------|
| Critical Business Logic | 100% | High |
| API Controllers | 90% | High |
| Services | 85% | High |
| Utilities | 80% | Medium |
| DTOs/Entities | 60% | Low |

### 4. What to Test

#### ✅ Do Test:
- Business logic
- Edge cases
- Error handling
- Input validation
- State changes
- Integration points

#### ❌ Don't Test:
- Third-party libraries
- Framework internals
- Trivial getters/setters
- Configuration files

---

## Code Review Checklist

### General

- [ ] Code follows project style guidelines
- [ ] No TypeScript errors or warnings
- [ ] No console.log() statements in production code
- [ ] No commented-out code
- [ ] Variable names are descriptive
- [ ] Functions are small and focused (< 50 lines)
- [ ] Complex logic is documented

### Functionality

- [ ] Code works as intended
- [ ] Edge cases are handled
- [ ] Error handling is comprehensive
- [ ] Input validation is present
- [ ] No hardcoded values (use environment variables)

### Security

- [ ] No sensitive data in logs
- [ ] Input is sanitized
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection where needed
- [ ] Authentication/authorization checks

### Performance

- [ ] No N+1 query problems
- [ ] Proper indexing for database queries
- [ ] Caching used where appropriate
- [ ] Async/await used correctly
- [ ] No memory leaks

### Testing

- [ ] Unit tests added for new code
- [ ] Tests are meaningful
- [ ] Tests pass locally
- [ ] Test coverage meets minimum (80%)
- [ ] E2E tests added for critical flows

### Documentation

- [ ] README updated if needed
- [ ] API documentation updated
- [ ] Complex logic is commented
- [ ] JSDoc comments for public APIs

---

## Git Workflow

### 1. Branch Naming

```bash
# Feature branches
feature/user-authentication
feature/payment-integration

# Bug fix branches
bugfix/fix-login-error
bugfix/payment-timeout

# Hotfix branches
hotfix/critical-security-fix

# Release branches
release/v1.2.0
```

### 2. Commit Messages

#### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build/tooling changes

#### Examples

```bash
# Good commit messages
feat(auth): add JWT token refresh mechanism
fix(payments): handle timeout error in Paystack integration
docs(api): update authentication endpoint documentation
test(users): add unit tests for user service

# Bad commit messages
update code
fix bug
changes
wip
```

### 3. Pull Request Guidelines

#### PR Title

```
[TYPE] Brief description

Examples:
[FEATURE] Add user authentication
[BUGFIX] Fix payment processing error
[DOCS] Update API documentation
```

#### PR Description Template

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
- [ ] No new warnings
- [ ] Tests added/updated
```

---

## Documentation Standards

### 1. Code Comments

#### JSDoc for Public APIs

```typescript
/**
 * Creates a new user in the system
 * 
 * @param createUserDto - The user data to create
 * @returns The created user object
 * @throws {ConflictException} If email already exists
 * @throws {BadRequestException} If validation fails
 * 
 * @example
 * ```typescript
 * const user = await userService.createUser({
 *   email: 'user@example.com',
 *   password: 'securePassword123',
 *   firstName: 'John',
 *   lastName: 'Doe'
 * });
 * ```
 */
async createUser(createUserDto: CreateUserDto): Promise<User> {
  // Implementation
}
```

#### Inline Comments for Complex Logic

```typescript
// Calculate compound interest using formula: A = P(1 + r/n)^(nt)
// where A is final amount, P is principal, r is rate, n is compounds per year, t is years
const finalAmount = principal * Math.pow(1 + rate / compoundsPerYear, compoundsPerYear * years);
```

### 2. README Files

Each module should have a README with:

1. **Purpose**: What the module does
2. **Usage**: How to use the module
3. **API**: Public interfaces and methods
4. **Examples**: Code examples
5. **Testing**: How to test the module

---

## Code Quality Tools

### 1. ESLint Configuration

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "no-console": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "max-lines-per-function": ["warn", 50],
    "complexity": ["warn", 10]
  }
}
```

### 2. Prettier Configuration

```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always"
}
```

### 3. Pre-commit Hooks

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm test"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "git add"
    ]
  }
}
```

---

## Metrics

### Code Quality Metrics to Track

1. **Test Coverage**: ≥ 80%
2. **Code Complexity**: Cyclomatic complexity < 10
3. **Code Duplication**: < 5%
4. **Technical Debt Ratio**: < 5%
5. **Bug Density**: < 1 bug per 100 lines of code

### Performance Metrics

1. **API Response Time**: < 200ms (p95)
2. **Database Query Time**: < 100ms
3. **Build Time**: < 5 minutes
4. **Test Execution Time**: < 30 seconds (unit tests)

---

## Resources

- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [NestJS Style Guide](https://docs.nestjs.com/)
- [Clean Code Principles](https://github.com/ryanmcdermott/clean-code-javascript)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## Enforcement

Code quality is enforced through:

1. **Automated checks**: ESLint, Prettier, TypeScript compiler
2. **CI/CD pipeline**: Automated tests and builds
3. **Code reviews**: Required for all pull requests
4. **Pre-commit hooks**: Prevent committing code that doesn't meet standards

---

## Questions & Support

For questions about code quality standards:
- Email: dev@pharmacy.com
- Slack: #code-quality
- Documentation: https://docs.pharmacy.com/code-quality
