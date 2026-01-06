# Render.com Deployment Guide

This guide provides instructions for deploying the Multi-Vendor Pharmacy Store Platform to Render.com using the included `render.yaml` blueprint configuration.

## Overview

The `render.yaml` file defines the complete infrastructure needed to run the platform on Render.com, including:

- **PostgreSQL Database**: Primary data store
- **Redis Cache**: Caching and session management
- **API Service**: NestJS backend (Node.js)
- **Admin Portal**: Next.js web application
- **Vendor Portal**: Next.js web application

## Prerequisites

1. A Render.com account ([Sign up here](https://render.com))
2. GitHub repository access
3. Production API keys for third-party services:
   - Paystack (Payment gateway)
   - Monnify (Payment gateway)
   - SendGrid (Email service)
   - Twilio (SMS service)
   - Firebase (Push notifications)
   - AWS S3 (File storage)
   - Sentry (Error tracking - optional)

## Deployment Steps

### 1. Connect Your Repository

1. Log in to your Render dashboard
2. Click **"New +"** → **"Blueprint"**
3. Select your GitHub repository
4. Render will automatically detect the `render.yaml` file

### 2. Review Blueprint Configuration

Render will parse the `render.yaml` and show you:
- 1 PostgreSQL database (`pharmacy-postgres`)
- 1 Redis instance (`pharmacy-redis`)
- 3 Web services:
  - `pharmacy-api` (Backend API)
  - `pharmacy-admin` (Admin Portal)
  - `pharmacy-vendor` (Vendor Portal)

### 3. Configure Environment Variables

The following environment variables are marked as `sync: false` and must be configured manually in the Render dashboard:

#### Payment Gateway Variables
```
PAYSTACK_SECRET_KEY
PAYSTACK_PUBLIC_KEY
PAYSTACK_WEBHOOK_SECRET
MONNIFY_API_KEY
MONNIFY_SECRET_KEY
MONNIFY_CONTRACT_CODE
MONNIFY_WEBHOOK_SECRET
```

#### Notification Services
```
SENDGRID_API_KEY
SENDGRID_FROM_EMAIL
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER
```

#### Push Notifications
```
FIREBASE_PROJECT_ID
FIREBASE_PRIVATE_KEY
FIREBASE_CLIENT_EMAIL
```

#### File Storage
```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_S3_BUCKET
```

#### Monitoring (Optional)
```
SENTRY_DSN
```

**To add these variables:**
1. Go to each service in your Render dashboard
2. Navigate to **Environment** tab
3. Click **Add Environment Variable**
4. Enter the key and value
5. Click **Save Changes**

### 4. Update Service URLs

After deployment, update the following URLs in your environment variables to match your actual Render URLs:

```yaml
API_URL: https://pharmacy-api.onrender.com
NEXT_PUBLIC_API_URL: https://pharmacy-api.onrender.com
NEXT_PUBLIC_ADMIN_URL: https://pharmacy-admin.onrender.com
NEXT_PUBLIC_VENDOR_URL: https://pharmacy-vendor.onrender.com
```

Replace with your actual service URLs from Render.

### 5. Deploy

1. Review all settings
2. Click **"Apply"** to create all services
3. Render will:
   - Create the PostgreSQL database
   - Create the Redis instance
   - Build and deploy all three web services

### 6. Post-Deployment Steps

#### Run Database Migrations

1. Access the API service shell from Render dashboard
2. Run migrations:
   ```bash
   cd apps/api && npm run migration:run
   ```

#### Seed Initial Data (Optional)

```bash
cd apps/api && npm run seed
```

#### Verify Health Checks

Check that all services are healthy:
- API: `https://pharmacy-api.onrender.com/api/health`
- Admin Portal: `https://pharmacy-admin.onrender.com`
- Vendor Portal: `https://pharmacy-vendor.onrender.com`

### 7. Configure Webhooks

Update your payment gateway webhooks to point to your Render API:

**Paystack Webhook URL:**
```
https://pharmacy-api.onrender.com/api/webhooks/paystack
```

**Monnify Webhook URL:**
```
https://pharmacy-api.onrender.com/api/webhooks/monnify
```

## Service Plans

The `render.yaml` uses **Starter** plans by default. You can upgrade to higher plans as needed:

### Available Plans

| Plan | Description | Price |
|------|-------------|-------|
| Starter | 0.5GB RAM, Shared CPU | $7/month |
| Standard | 2GB RAM, 1 CPU | $25/month |
| Pro | 4GB RAM, 2 CPU | $85/month |

### Recommended Plans for Production

- **Database**: Standard or Pro (depending on data size)
- **Redis**: Starter (upgrade if needed)
- **API Service**: Standard or Pro (handles business logic)
- **Frontend Services**: Starter (static Next.js apps)

To upgrade:
1. Go to service settings
2. Select **"Settings"** → **"Instance Type"**
3. Choose your desired plan
4. Click **Save Changes**

## Monitoring and Logs

### View Logs

1. Go to your service in Render dashboard
2. Click **"Logs"** tab
3. View real-time logs

### Set Up Alerts

1. Navigate to service settings
2. Click **"Notifications"**
3. Add email or Slack notifications for:
   - Deploy failures
   - Service crashes
   - Health check failures

## Auto-Deploy

All services are configured with `autoDeploy: true`, meaning:
- Pushes to your main branch trigger automatic deployments
- You can disable this in service settings if needed

## Scaling

### Horizontal Scaling

To add more instances of a service:
1. Go to service settings
2. Navigate to **"Scaling"**
3. Increase the number of instances

### Vertical Scaling

Upgrade to a higher plan for more resources (see Service Plans above).

## Troubleshooting

### Build Failures

**Problem**: Build fails with "command not found" or similar errors

**Solution**: 
- Check that `package.json` scripts are correct
- Ensure all dependencies are in `package.json`
- Review build logs for specific errors

### Database Connection Issues

**Problem**: API can't connect to database

**Solution**:
- Verify database environment variables are set correctly
- Check database is in same region as API service
- Ensure database is fully provisioned (check status)

### Redis Connection Issues

**Problem**: Redis connection timeout

**Solution**:
- Verify Redis environment variables
- Check Redis instance is running
- Ensure Redis and API are in same region

### Environment Variables Not Applied

**Problem**: Changes to environment variables not reflected

**Solution**:
- After changing environment variables, you must **manually trigger a redeploy**
- Go to service → **"Manual Deploy"** → **"Deploy latest commit"**

### Health Check Failures

**Problem**: Service shows as unhealthy

**Solution**:
- Check that `/api/health` endpoint exists in your API
- Verify the endpoint returns 200 status
- Review service logs for errors

## Security Best Practices

1. **Use Strong Secrets**: Never use default or example values for:
   - `JWT_SECRET`
   - Database passwords
   - API keys

2. **Enable IP Allowlisting** (Optional):
   - For Redis, you can restrict access to specific IPs
   - Edit `render.yaml` and update `ipAllowList`

3. **Webhook Verification**:
   - Always verify webhook signatures from payment gateways
   - Use dedicated webhook secrets

4. **HTTPS Only**:
   - Render provides free SSL certificates
   - Never accept HTTP traffic for sensitive operations

5. **Environment Variables**:
   - Keep sensitive values in Render's environment variables
   - Never commit secrets to your repository

## Cost Estimation

### Minimum Configuration (Starter Plans)

- PostgreSQL Starter: $7/month
- Redis Starter: $10/month
- API Service Starter: $7/month
- Admin Portal Starter: $7/month
- Vendor Portal Starter: $7/month

**Total**: ~$38/month

### Recommended Production Configuration

- PostgreSQL Standard: $20/month
- Redis Starter: $10/month
- API Service Pro: $85/month
- Admin Portal Starter: $7/month
- Vendor Portal Starter: $7/month

**Total**: ~$129/month

*Prices are approximate and subject to change. Check Render.com for current pricing.*

## Backup and Disaster Recovery

### Database Backups

Render automatically backs up PostgreSQL databases:
- **Starter Plan**: Daily backups, 7-day retention
- **Standard/Pro Plans**: Daily backups, 30-day retention
- Point-in-time recovery available on Pro plans

### Restore from Backup

1. Go to database in Render dashboard
2. Click **"Backups"** tab
3. Select backup to restore
4. Follow restoration prompts

## CI/CD Integration

The `render.yaml` configuration enables automatic deployments from your GitHub repository. Every push to your main branch will:

1. Trigger a new build
2. Run tests (if configured)
3. Deploy to production

### Disable Auto-Deploy

To manually control deployments:
1. Edit service settings
2. Toggle **"Auto-Deploy"** to OFF
3. Use **"Manual Deploy"** when ready

## Support and Resources

- **Render Documentation**: https://render.com/docs
- **Render Community**: https://community.render.com
- **Support**: support@render.com
- **Status Page**: https://status.render.com

## Additional Notes

### Monorepo Considerations

This project uses Turborepo for monorepo management. The build commands are configured to:
1. Install all dependencies at root level
2. Build specific apps using Turborepo or direct commands
3. Run apps from their respective directories

### Node.js Version

Render uses Node.js 18 by default. To specify a different version, add to your `package.json`:

```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Region Selection

The default region is `ohio`. You can change this to:
- `oregon`
- `frankfurt`
- `singapore`

Choose a region close to your users for better performance.

## Next Steps

After successful deployment:

1. ✅ Test all API endpoints
2. ✅ Verify database connectivity
3. ✅ Test payment integrations
4. ✅ Verify notification services
5. ✅ Set up monitoring and alerts
6. ✅ Configure custom domains (optional)
7. ✅ Run load tests
8. ✅ Document deployment process for team

---

**Last Updated**: January 2026

For questions or issues, please refer to the project documentation or contact the development team.
