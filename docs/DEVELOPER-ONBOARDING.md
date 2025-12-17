# Developer Onboarding Guide

## Welcome! 👋

Welcome to the Multi-Vendor Pharmacy Platform development team. This guide will help you get started.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Getting Started](#getting-started)
3. [Development Environment](#development-environment)
4. [Project Structure](#project-structure)
5. [Development Workflow](#development-workflow)
6. [Testing](#testing)
7. [Code Quality](#code-quality)
8. [Deployment](#deployment)
9. [Resources](#resources)

---

## Prerequisites

### Required Software

| Software | Version | Installation |
|----------|---------|--------------|
| Node.js | ≥ 18.0.0 | [nodejs.org](https://nodejs.org/) |
| npm | ≥ 9.0.0 | Included with Node.js |
| Git | Latest | [git-scm.com](https://git-scm.com/) |
| Docker | Latest | [docker.com](https://www.docker.com/) |
| Docker Compose | Latest | Included with Docker Desktop |

### Optional Tools

- **VS Code**: Recommended IDE with extensions
- **Postman**: For API testing
- **pgAdmin**: PostgreSQL management
- **Redis Commander**: Redis management

### VS Code Extensions

Install these extensions for the best development experience:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "christian-kohler.path-intellisense",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "mikestead.dotenv",
    "usernamehw.errorlens"
  ]
}
```

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Haitch007jnr/Muti-Vendor-Pharmacy-App.git
cd Muti-Vendor-Pharmacy-App
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# This will also install dependencies for all apps and packages (monorepo)
```

### 3. Set Up Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

#### Required Environment Variables

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/pharmacy_dev

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=7d
REFRESH_TOKEN_EXPIRATION=30d

# Payment Gateways (Use test/sandbox keys for development)
PAYSTACK_SECRET_KEY=sk_test_xxxxx
MONNIFY_API_KEY=test_xxxxx
MONNIFY_SECRET_KEY=test_xxxxx

# Email (SendGrid)
SENDGRID_API_KEY=SG.xxxxx

# SMS (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+1234567890

# File Storage (AWS S3)
AWS_ACCESS_KEY_ID=xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
AWS_S3_BUCKET=pharmacy-dev
AWS_REGION=us-east-1

# Firebase (Push Notifications)
FIREBASE_PROJECT_ID=pharmacy-dev
FIREBASE_PRIVATE_KEY=xxxxx
FIREBASE_CLIENT_EMAIL=xxxxx
```

### 4. Start Services with Docker

```bash
# Start PostgreSQL, Redis, and other services
docker-compose up -d

# Check services are running
docker-compose ps
```

### 5. Run Database Migrations

```bash
cd apps/api
npm run migration:run
```

### 6. Seed Database (Optional)

```bash
cd apps/api
npm run seed
```

### 7. Start Development Servers

```bash
# From root directory - starts all apps
npm run dev

# Or start individual apps
npm run dev:api          # API server (port 4000)
npm run dev:web-admin    # Admin portal (port 3000)
npm run dev:web-vendor   # Vendor portal (port 3001)
```

### 8. Verify Installation

- API: http://localhost:4000/health
- Admin Portal: http://localhost:3000
- Vendor Portal: http://localhost:3001
- API Docs: http://localhost:4000/api/docs

---

## Development Environment

### Recommended VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### Debugging Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug API",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "start:debug"],
      "cwd": "${workspaceFolder}/apps/api",
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

---

## Project Structure

```
Muti-Vendor-Pharmacy-App/
├── apps/
│   ├── api/                      # NestJS Backend API
│   │   ├── src/
│   │   │   ├── modules/          # Feature modules
│   │   │   ├── common/           # Shared code
│   │   │   ├── config/           # Configuration
│   │   │   └── main.ts           # Entry point
│   │   ├── test/                 # E2E tests
│   │   └── package.json
│   ├── web-admin/                # Admin Portal (Next.js)
│   ├── web-vendor/               # Vendor Portal (Next.js)
│   ├── mobile-customer/          # Customer App (React Native)
│   ├── mobile-vendor/            # Vendor App (React Native)
│   └── mobile-delivery/          # Delivery App (React Native)
├── packages/
│   ├── shared/                   # Shared utilities
│   ├── ui-components/            # Shared UI components
│   └── config/                   # Shared configuration
├── database/
│   ├── migrations/               # Database migrations
│   └── seeds/                    # Seed data
├── docs/                         # Documentation
├── .github/workflows/            # CI/CD workflows
├── docker-compose.yml
└── package.json
```

### Key Directories

- **apps/api/src/modules/**: Feature modules (auth, products, orders, etc.)
- **apps/api/src/common/**: Shared code (guards, decorators, pipes)
- **apps/api/test/**: E2E and integration tests
- **docs/**: All project documentation

---

## Development Workflow

### 1. Pick a Task

- Check the project board or assigned issues
- Move task to "In Progress"
- Assign yourself to the issue

### 2. Create a Branch

```bash
# Feature branch
git checkout -b feature/your-feature-name

# Bug fix branch
git checkout -b bugfix/issue-description

# Pull latest changes first
git pull origin develop
```

### 3. Make Changes

- Write code following [Code Quality Standards](./CODE-QUALITY-STANDARDS.md)
- Write tests for new code
- Update documentation if needed

### 4. Test Your Changes

```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Run linter
npm run lint

# Check types
npm run type-check

# Run specific module tests
npm test -- --testPathPattern=auth
```

### 5. Commit Changes

```bash
# Stage changes
git add .

# Commit with conventional commit message
git commit -m "feat(auth): add password reset functionality"

# Or use interactive commit
npm run commit  # If commitizen is set up
```

### 6. Push and Create PR

```bash
# Push to remote
git push origin feature/your-feature-name

# Create Pull Request on GitHub
# - Use PR template
# - Link related issues
# - Request reviewers
```

### 7. Code Review

- Address review comments
- Push updates to the same branch
- Request re-review when ready

### 8. Merge

- Squash and merge when approved
- Delete feature branch
- Move task to "Done"

---

## Testing

### Running Tests

```bash
# Unit tests
npm test                          # All tests
npm test -- --watch              # Watch mode
npm run test:cov                 # With coverage

# E2E tests
npm run test:e2e                 # All E2E tests
npm run test:security            # Security tests

# Performance tests
npm run perf:load                # Load testing
npm run perf:stress              # Stress testing

# Specific tests
npm test -- auth.service.spec.ts
npm test -- --testPathPattern=payment
```

### Writing Tests

See [Testing-QA Guide](./TESTING-QA-GUIDE.md) for comprehensive testing guidelines.

#### Quick Example

```typescript
describe('UserService', () => {
  let service: UserService;
  
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UserService, /* mocks */],
    }).compile();
    
    service = module.get<UserService>(UserService);
  });
  
  it('should create a user', async () => {
    const result = await service.create(createUserDto);
    
    expect(result).toBeDefined();
    expect(result.email).toBe(createUserDto.email);
  });
});
```

---

## Code Quality

### Linting

```bash
# Run linter
npm run lint

# Fix automatically
npm run lint -- --fix

# Check specific files
npm run lint -- apps/api/src/**/*.ts
```

### Formatting

```bash
# Format all files
npm run format

# Format specific files
npx prettier --write "apps/api/src/**/*.ts"
```

### Type Checking

```bash
# Check types
npm run type-check

# Watch mode
npm run type-check -- --watch
```

### Pre-commit Hooks

Pre-commit hooks will automatically:
- Run ESLint and fix issues
- Format code with Prettier
- Run tests on changed files

To skip hooks (not recommended):
```bash
git commit --no-verify
```

---

## Deployment

### Build for Production

```bash
# Build all apps
npm run build

# Build specific app
npm run build:api
npm run build:web-admin
```

### Docker Build

```bash
# Build API Docker image
docker build -t pharmacy-api:latest ./apps/api

# Run container
docker run -p 4000:4000 pharmacy-api:latest
```

### Environment-specific Builds

```bash
# Staging
NODE_ENV=staging npm run build

# Production
NODE_ENV=production npm run build
```

---

## Common Tasks

### Adding a New Module

```bash
cd apps/api

# Generate module
nest generate module modules/my-module
nest generate controller modules/my-module
nest generate service modules/my-module

# Create tests
mkdir src/modules/my-module/__tests__
touch src/modules/my-module/__tests__/my-module.service.spec.ts
```

### Database Migrations

```bash
cd apps/api

# Generate migration
npm run migration:generate -- -n CreateUsersTable

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

### Troubleshooting

#### Port Already in Use

```bash
# Find process using port
lsof -i :4000

# Kill process
kill -9 <PID>
```

#### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart services
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

#### Module Not Found Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
npm run clean
```

---

## Resources

### Documentation

- [API Guidelines](./API-GUIDELINES.md)
- [Testing Guide](./TESTING-QA-GUIDE.md)
- [Security Guide](./SECURITY-TESTING-GUIDE.md)
- [Performance Guide](./PERFORMANCE-OPTIMIZATION-GUIDE.md)
- [Code Quality Standards](./CODE-QUALITY-STANDARDS.md)

### External Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [TypeORM Documentation](https://typeorm.io/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### Communication

- **Slack Channels:**
  - #dev-general: General development discussion
  - #dev-backend: Backend-specific topics
  - #dev-frontend: Frontend-specific topics
  - #dev-mobile: Mobile app topics
  - #code-review: Code review requests

- **Meetings:**
  - Daily Standup: 9:00 AM (15 minutes)
  - Sprint Planning: Every 2 weeks
  - Retrospective: End of each sprint
  - Tech talks: Friday afternoons

---

## Need Help?

- 📧 Email: dev@pharmacy.com
- 💬 Slack: #dev-help
- 📚 Documentation: https://docs.pharmacy.com
- 🐛 Report bugs: GitHub Issues

---

**Welcome aboard! Happy coding! 🚀**
