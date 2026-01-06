# Render.com Deployment Checklist

Use this checklist to ensure a smooth deployment to Render.com.

## Pre-Deployment Checklist

### Repository Preparation
- [ ] `render.yaml` file is in repository root
- [ ] All service dependencies are in `package.json`
- [ ] Node.js version is specified in root `package.json` engines field
- [ ] `.gitignore` excludes `node_modules`, `.env`, and build artifacts
- [ ] Code is committed and pushed to main branch

### API Keys & Credentials
- [ ] Paystack production keys obtained
- [ ] Monnify production keys obtained
- [ ] SendGrid API key and verified sender email ready
- [ ] Twilio credentials obtained
- [ ] Firebase project created and credentials downloaded
- [ ] AWS S3 bucket created and credentials ready
- [ ] Sentry project created (optional)

### Configuration Review
- [ ] Review `render.yaml` configuration
- [ ] Verify service names are correct
- [ ] Confirm database and Redis plan selections
- [ ] Check region selection (default: ohio)
- [ ] Review environment variable list

## Deployment Steps

### Step 1: Create Blueprint
- [ ] Log in to Render.com dashboard
- [ ] Click "New +" → "Blueprint"
- [ ] Select GitHub repository
- [ ] Confirm `render.yaml` is detected
- [ ] Review services to be created

### Step 2: Set Environment Variables
- [ ] Go to `pharmacy-api` service settings
- [ ] Add payment gateway keys (Paystack, Monnify)
- [ ] Add notification service keys (SendGrid, Twilio)
- [ ] Add Firebase credentials
- [ ] Add AWS S3 credentials
- [ ] Add Sentry DSN (if using)
- [ ] Save changes

### Step 3: Deploy
- [ ] Click "Apply" to start deployment
- [ ] Wait for database provisioning
- [ ] Wait for Redis provisioning
- [ ] Wait for API build and deployment
- [ ] Wait for admin portal build and deployment
- [ ] Wait for vendor portal build and deployment

### Step 4: Post-Deployment Configuration

#### Update URLs
- [ ] Note actual Render URLs for all services
- [ ] Update `API_URL` in API service settings
- [ ] Update `NEXT_PUBLIC_API_URL` in both frontend services
- [ ] Update `NEXT_PUBLIC_ADMIN_URL` in both frontend services
- [ ] Update `NEXT_PUBLIC_VENDOR_URL` in both frontend services
- [ ] Update `CORS_ORIGIN` in API service settings
- [ ] Trigger manual redeploy after URL updates

#### Database Setup
- [ ] Access API service shell
- [ ] Run database migrations: `cd apps/api && npm run migration:run`
- [ ] Run seed data (if needed): `cd apps/api && npm run seed`
- [ ] Verify database tables created

#### Health Checks
- [ ] Verify API health: `https://[your-api-url]/api/v1`
- [ ] Verify admin portal loads: `https://[your-admin-url]`
- [ ] Verify vendor portal loads: `https://[your-vendor-url]`
- [ ] Check API documentation: `https://[your-api-url]/api/docs`

#### Webhook Configuration
- [ ] Log in to Paystack dashboard
- [ ] Add webhook URL: `https://[your-api-url]/api/webhooks/paystack`
- [ ] Log in to Monnify dashboard
- [ ] Add webhook URL: `https://[your-api-url]/api/webhooks/monnify`
- [ ] Test webhook delivery

## Testing

### Functionality Testing
- [ ] Test user registration
- [ ] Test user login
- [ ] Test API endpoints
- [ ] Test admin portal functionality
- [ ] Test vendor portal functionality
- [ ] Test payment integration (use test mode)
- [ ] Test email notifications
- [ ] Test SMS notifications
- [ ] Test file upload to S3

### Performance Testing
- [ ] Check API response times
- [ ] Monitor memory usage
- [ ] Check database query performance
- [ ] Verify Redis caching working

### Security Testing
- [ ] Verify HTTPS is working
- [ ] Test CORS configuration
- [ ] Verify authentication/authorization
- [ ] Test webhook signature verification
- [ ] Check for exposed secrets in logs

## Monitoring Setup

### Render Dashboard
- [ ] Enable email notifications for deploy failures
- [ ] Enable email notifications for service crashes
- [ ] Set up Slack notifications (optional)

### External Monitoring
- [ ] Configure Sentry error tracking
- [ ] Set up uptime monitoring (e.g., UptimeRobot)
- [ ] Configure log aggregation (if needed)

### Alerts Configuration
- [ ] Set up alerts for high error rates
- [ ] Set up alerts for slow response times
- [ ] Set up alerts for high database connections
- [ ] Set up alerts for disk space usage

## Production Readiness

### Performance Optimization
- [ ] Review and optimize service plans
- [ ] Enable CDN for static assets
- [ ] Configure database connection pooling
- [ ] Optimize API queries
- [ ] Enable response compression

### Security Hardening
- [ ] Review all environment variables
- [ ] Rotate any exposed secrets
- [ ] Configure rate limiting
- [ ] Enable IP allowlisting for Redis (if needed)
- [ ] Review CORS configuration

### Documentation
- [ ] Document actual service URLs
- [ ] Document environment variables
- [ ] Create runbook for common issues
- [ ] Document backup and restore procedures
- [ ] Share credentials with team securely

## Go-Live Checklist

### Final Checks
- [ ] All tests passing
- [ ] No critical errors in logs
- [ ] Performance metrics acceptable
- [ ] All team members notified
- [ ] Rollback plan documented

### Custom Domains (Optional)
- [ ] Purchase domain names
- [ ] Configure DNS records in domain registrar
- [ ] Add custom domains in Render
- [ ] Verify SSL certificates issued
- [ ] Update environment variables with custom domains

### Monitoring Dashboard
- [ ] Bookmark Render services dashboard
- [ ] Set up team access to Render
- [ ] Create status page (optional)
- [ ] Document emergency contacts

## Post-Launch

### Day 1
- [ ] Monitor error logs continuously
- [ ] Check performance metrics
- [ ] Monitor payment transactions
- [ ] Verify notification delivery
- [ ] Respond to critical issues immediately

### Week 1
- [ ] Review error logs daily
- [ ] Monitor user feedback
- [ ] Track key metrics (sign-ups, orders, revenue)
- [ ] Check payment reconciliation
- [ ] Optimize slow queries

### Ongoing
- [ ] Weekly performance reviews
- [ ] Monthly security audits
- [ ] Regular dependency updates
- [ ] Review and update documentation
- [ ] Backup verification

## Troubleshooting Quick Reference

### Build Failures
1. Check build logs in Render dashboard
2. Verify all dependencies in package.json
3. Test build locally: `npm ci && npm run build`
4. Check Node.js version compatibility

### Database Connection Issues
1. Verify database is fully provisioned
2. Check DATABASE_URL environment variable
3. Verify database and API in same region
4. Check connection pool settings

### Redis Connection Issues
1. Verify Redis is running
2. Check REDIS_URL environment variable
3. Test Redis connection from API shell
4. Verify same region deployment

### Deployment Not Triggering
1. Verify `autoDeploy: true` in service settings
2. Check GitHub webhook is active
3. Manually trigger deploy from dashboard
4. Verify branch settings

## Emergency Rollback

If critical issues occur:

1. **Immediate**: Disable problematic service
2. **Quick Fix**: Revert last commit and push
3. **Database**: Restore from latest backup (if needed)
4. **Notify**: Inform team and users
5. **Document**: Log issue and resolution

## Support Resources

- **Render Documentation**: https://render.com/docs
- **Render Community**: https://community.render.com
- **Project Documentation**: `/docs` folder
- **Team Slack/Discord**: [Your team channel]

---

**Deployment Date**: __________  
**Deployed By**: __________  
**Version**: __________  
**Status**: ☐ Success  ☐ Issues  ☐ Rolled Back

**Notes**:
