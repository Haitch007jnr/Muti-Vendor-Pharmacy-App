# Production Deployment Checklist

This checklist ensures all components are ready for production deployment.

## Pre-Deployment

### Code Quality

- [ ] All unit tests passing (>80% coverage)
- [ ] All integration tests passing
- [ ] All E2E tests passing
- [ ] No critical or high-severity security vulnerabilities
- [ ] Code review completed
- [ ] No TODO or FIXME comments in production code
- [ ] Error handling implemented for all API endpoints
- [ ] Input validation in place
- [ ] Logging configured properly

### Security

- [ ] All secrets moved to environment variables
- [ ] Strong JWT secret configured (not default)
- [ ] Production API keys configured (not test keys)
- [ ] Database password is strong (>12 characters)
- [ ] HTTPS enabled for all endpoints
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled
- [ ] CSRF protection enabled
- [ ] Security headers configured (Helmet.js)
- [ ] File upload validation in place
- [ ] Webhook signature verification enabled

### Infrastructure

- [ ] Database migrations tested
- [ ] Database backup configured
- [ ] Redis configured and tested
- [ ] AWS S3 bucket configured (if using)
- [ ] CDN configured (if using)
- [ ] SSL/TLS certificates installed
- [ ] Domain names configured
- [ ] DNS records updated
- [ ] Load balancer configured (if needed)
- [ ] Auto-scaling configured (if needed)

### Environment Configuration

- [ ] Production `.env` file configured
- [ ] All required environment variables set
- [ ] Environment variables validated
- [ ] Database connection string verified
- [ ] Redis connection string verified
- [ ] Payment gateway keys configured
- [ ] Notification service keys configured
- [ ] Firebase credentials configured
- [ ] AWS credentials configured (if using)

### Payment Integration

- [ ] Paystack production keys configured
- [ ] Monnify production keys configured
- [ ] Payment webhooks configured
- [ ] Webhook URLs added to gateway dashboards
- [ ] Test transactions completed successfully
- [ ] Refund process tested
- [ ] Payment reconciliation tested

### Notifications

- [ ] SendGrid production API key configured
- [ ] SendGrid sender email verified
- [ ] Twilio production credentials configured
- [ ] Twilio phone number verified
- [ ] Firebase Cloud Messaging configured
- [ ] Push notification certificates uploaded (iOS)
- [ ] Test notifications sent successfully

### Monitoring & Logging

- [ ] Application logging configured
- [ ] Error tracking service configured (e.g., Sentry)
- [ ] Performance monitoring configured
- [ ] Uptime monitoring configured
- [ ] Database query logging configured
- [ ] API request logging configured
- [ ] Health check endpoints implemented
- [ ] Alerts configured for critical issues

### Documentation

- [ ] API documentation updated
- [ ] Environment setup guide updated
- [ ] Deployment guide created
- [ ] Troubleshooting guide created
- [ ] Runbook created for common issues
- [ ] Architecture documentation updated
- [ ] Privacy policy published
- [ ] Terms of service published

## Backend Deployment

### Pre-Deployment

- [ ] Code merged to main/production branch
- [ ] Version number updated
- [ ] Changelog updated
- [ ] Database migrations reviewed
- [ ] Database backup created

### Deployment Steps

- [ ] Pull latest code on production server
- [ ] Install/update dependencies (`npm install`)
- [ ] Build application (`npm run build`)
- [ ] Run database migrations (`npm run migration:run`)
- [ ] Seed initial data if needed (`npm run seed`)
- [ ] Start application (`npm run start:prod`)
- [ ] Verify application is running
- [ ] Check health endpoint
- [ ] Monitor logs for errors

### Post-Deployment

- [ ] Smoke tests passed
- [ ] API endpoints responding
- [ ] Database queries working
- [ ] Redis connection verified
- [ ] Payment integration working
- [ ] Notification services working
- [ ] No critical errors in logs
- [ ] Performance metrics acceptable
- [ ] Rollback plan ready

## Frontend Deployment (Web Apps)

### Admin Portal

- [ ] Environment variables configured
- [ ] API URL updated to production
- [ ] Build created (`npm run build`)
- [ ] Static files deployed to hosting
- [ ] CDN cache cleared (if applicable)
- [ ] Domain configured
- [ ] SSL certificate verified
- [ ] Smoke tests passed

### Vendor Portal

- [ ] Environment variables configured
- [ ] API URL updated to production
- [ ] Build created (`npm run build`)
- [ ] Static files deployed to hosting
- [ ] CDN cache cleared (if applicable)
- [ ] Domain configured
- [ ] SSL certificate verified
- [ ] Smoke tests passed

## Mobile App Deployment

### Customer App

#### iOS

- [ ] App version incremented
- [ ] Bundle ID verified: `com.pharmacy.customer`
- [ ] Provisioning profiles updated
- [ ] Apple Developer account active
- [ ] App Store Connect app created
- [ ] App icons uploaded (all sizes)
- [ ] Screenshots uploaded
- [ ] App description updated
- [ ] Privacy policy URL added
- [ ] Support URL added
- [ ] Age rating completed
- [ ] Build uploaded to App Store Connect
- [ ] TestFlight testing completed
- [ ] App Store review information provided
- [ ] Demo account credentials provided
- [ ] Submitted for review

#### Android

- [ ] App version code incremented
- [ ] App version name updated
- [ ] Package name verified: `com.pharmacy.customer`
- [ ] Signing key configured
- [ ] Google Play Console app created
- [ ] App icons uploaded
- [ ] Feature graphic uploaded
- [ ] Screenshots uploaded (all required sizes)
- [ ] App description updated
- [ ] Privacy policy URL added
- [ ] Content rating completed
- [ ] Data safety section completed
- [ ] AAB built and uploaded
- [ ] Internal testing completed
- [ ] Production release created
- [ ] Submitted for review

### Vendor App

- [ ] iOS app store submission completed
- [ ] Android Play Store submission completed
- [ ] All store assets uploaded
- [ ] Testing completed

### Delivery App

- [ ] iOS app store submission completed
- [ ] Android Play Store submission completed
- [ ] All store assets uploaded
- [ ] Testing completed

## Post-Launch

### Immediate (Day 1)

- [ ] Monitor error logs
- [ ] Monitor performance metrics
- [ ] Monitor API response times
- [ ] Check payment transactions
- [ ] Verify notification delivery
- [ ] Monitor user sign-ups
- [ ] Check app store status
- [ ] Respond to critical issues immediately

### First Week

- [ ] Review all error logs daily
- [ ] Monitor user feedback
- [ ] Track key metrics (sign-ups, orders, revenue)
- [ ] Review app store reviews
- [ ] Respond to user support requests
- [ ] Check payment reconciliation
- [ ] Monitor system resources
- [ ] Review security logs
- [ ] Check database performance
- [ ] Optimize slow queries

### Ongoing

- [ ] Weekly performance reviews
- [ ] Monthly security audits
- [ ] Regular dependency updates
- [ ] Monitor app store ratings
- [ ] Collect user feedback
- [ ] Plan feature updates
- [ ] Review and update documentation
- [ ] Backup verification
- [ ] Disaster recovery testing

## Rollback Plan

### Backend Rollback

1. Stop the current application
2. Restore previous version code
3. Rollback database migrations if needed
4. Restart application
5. Verify functionality
6. Monitor for issues

### Frontend Rollback

1. Deploy previous static files
2. Clear CDN cache
3. Verify deployment
4. Test critical paths

### Mobile App Rollback

- **Cannot directly rollback app store releases**
- Can release a new version quickly
- Can disable features via feature flags
- Can redirect to maintenance mode

## Emergency Contacts

- **DevOps Lead:** [Name] - [Phone] - [Email]
- **Backend Lead:** [Name] - [Phone] - [Email]
- **Frontend Lead:** [Name] - [Phone] - [Email]
- **Mobile Lead:** [Name] - [Phone] - [Email]
- **Security Lead:** [Name] - [Phone] - [Email]
- **Product Manager:** [Name] - [Phone] - [Email]

## Service Status

- **API Status:** https://status.pharmacy.com
- **Monitoring Dashboard:** https://monitor.pharmacy.com
- **Error Tracking:** https://sentry.io/pharmacy
- **Analytics:** https://analytics.pharmacy.com

## Critical Thresholds

- **Error Rate:** < 0.1%
- **API Response Time:** < 1 second (p95)
- **Uptime:** > 99.5%
- **Payment Success Rate:** > 99%
- **Notification Delivery:** > 95%

## Maintenance Windows

- **Preferred:** Tuesday/Wednesday 2-4 AM local time
- **Maximum Duration:** 2 hours
- **Notification:** 48 hours advance notice to users

## Success Criteria

- [ ] All services operational
- [ ] No critical errors
- [ ] Performance within thresholds
- [ ] Payment processing working
- [ ] Notifications delivering
- [ ] Users can sign up and place orders
- [ ] Mobile apps approved and available
- [ ] Positive user feedback
- [ ] Team confident in stability

---

**Deployment Date:** _________________

**Deployed By:** _________________

**Sign-off By:** _________________

**Version:** _________________

**Notes:**
