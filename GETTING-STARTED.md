# Getting Started

## Quick Start Guide

This guide will help you set up the Multi-Vendor Pharmacy Platform on your local development environment.

## Prerequisites

Ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Docker** and **Docker Compose**
- **Git**
- **PostgreSQL** (if running without Docker)

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/Haitch007jnr/Muti-Vendor-Pharmacy-App.git
cd Muti-Vendor-Pharmacy-App
```

### 2. Install Dependencies

```bash
npm install
```

This will install all dependencies for the monorepo workspace.

### 3. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit the `.env` file and configure:
- Database credentials
- JWT secret keys
- Payment gateway API keys (Paystack & Monnify)
- Email/SMS service credentials
- AWS S3 credentials

### 4. Start Services with Docker

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database
- Redis cache
- API backend
- Admin web portal
- Vendor web portal

### 5. Run Database Migrations

```bash
# The database schema will be auto-created from the init scripts
# Check if the database is ready
docker-compose logs postgres
```

### 6. Access the Applications

- **API**: http://localhost:4000
- **API Documentation**: http://localhost:4000/api/docs
- **Admin Portal**: http://localhost:3000
- **Vendor Portal**: http://localhost:3001

### 7. Default Credentials

For development/testing:
- **Admin**: admin@pharmacy.com / password123
- **Vendor**: vendor@pharmacy.com / password123
- **Customer**: customer@pharmacy.com / password123

⚠️ **Change these in production!**

## Development Workflow

### Running Individual Services

```bash
# Run API only
npm run dev:api

# Run admin portal only
npm run dev:web-admin

# Run vendor portal only
npm run dev:web-vendor
```

### Database Operations

```bash
# Run migrations
npm run db:migrate

# Seed database with test data
npm run db:seed

# Reset database
npm run db:reset
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

### Testing

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

## Project Structure Overview

```
Muti-Vendor-Pharmacy-App/
├── apps/                    # Applications
│   ├── api/                # Backend API (NestJS)
│   ├── web-admin/          # Admin Portal (Next.js)
│   ├── web-vendor/         # Vendor Portal (Next.js)
│   └── mobile-*/           # Mobile Apps (React Native)
├── packages/               # Shared packages
│   ├── shared/            # Shared utilities
│   ├── ui-components/     # Shared UI components
│   └── database/          # Database schemas
├── database/              # Database scripts
├── docs/                  # Documentation
└── docker-compose.yml     # Docker configuration
```

## Next Steps

1. **Explore the API Documentation**: Visit http://localhost:4000/api/docs
2. **Read the Architecture Docs**: Check `/docs/architecture/`
3. **Review the Implementation Roadmap**: See `README.md`
4. **Start Building Features**: Follow the phase-by-phase implementation plan

## Common Issues

### Port Already in Use

If ports 3000, 3001, or 4000 are already in use:
```bash
# Find and kill the process
lsof -ti:4000 | xargs kill -9
```

### Database Connection Issues

```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Node Modules Issues

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Getting Help

- **Documentation**: `/docs` directory
- **API Reference**: http://localhost:4000/api/docs
- **GitHub Issues**: [Report a bug](https://github.com/Haitch007jnr/Muti-Vendor-Pharmacy-App/issues)

## Contributing

Please read our contributing guidelines before making changes:
1. Create a feature branch
2. Make your changes
3. Write tests
4. Submit a pull request

---

Happy coding! 🚀
