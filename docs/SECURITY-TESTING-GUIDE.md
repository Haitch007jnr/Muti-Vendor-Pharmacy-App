# Security Testing Guide

## Overview

This guide outlines the security testing procedures for the Multi-Vendor Pharmacy Platform.

## Security Testing Tools

### 1. OWASP ZAP (Zed Attack Proxy)

#### Installation
```bash
# Install via Docker
docker pull owasp/zap2docker-stable

# Or download from https://www.zaproxy.org/download/
```

#### Running Security Scan
```bash
# Basic scan
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t http://localhost:4000 \
  -r zap-report.html

# Full scan (more thorough)
docker run -t owasp/zap2docker-stable zap-full-scan.py \
  -t http://localhost:4000 \
  -r zap-full-report.html
```

### 2. npm audit

#### Check for Vulnerabilities
```bash
# Run audit
npm audit

# Fix automatically (if possible)
npm audit fix

# Force fix (may introduce breaking changes)
npm audit fix --force

# Get detailed report
npm audit --json > audit-report.json
```

### 3. Snyk

#### Setup
```bash
# Install Snyk CLI
npm install -g snyk

# Authenticate
snyk auth

# Test for vulnerabilities
snyk test

# Monitor project
snyk monitor
```

### 4. Dependency-Check

#### Using OWASP Dependency-Check
```bash
# Install
npm install -g @cyclonedx/cyclonedx-npm

# Generate Software Bill of Materials (SBOM)
cyclonedx-npm --output-file bom.xml

# Run dependency check
dependency-check --project "Pharmacy App" --scan ./
```

## Security Test Checklist

### Authentication & Authorization

- [x] Test password strength requirements
- [x] Test account lockout after failed attempts
- [x] Test session timeout
- [x] Test JWT token expiration
- [x] Test refresh token rotation
- [x] Test authorization bypass attempts
- [x] Test role-based access control (RBAC)
- [x] Test permission checks on all protected endpoints
- [x] Test concurrent session management
- [x] Test password reset functionality

### Input Validation

- [x] Test SQL injection on all inputs
- [x] Test NoSQL injection
- [x] Test XSS (Cross-Site Scripting)
- [x] Test command injection
- [x] Test XML/XXE injection
- [x] Test file upload vulnerabilities
- [x] Test path traversal
- [x] Test buffer overflow
- [x] Test input length limits
- [x] Test special character handling

### API Security

- [x] Test rate limiting
- [x] Test CORS configuration
- [x] Test API versioning
- [x] Test error message information disclosure
- [x] Test API documentation exposure
- [x] Test HTTP methods (PUT, DELETE, etc.)
- [x] Test content-type validation
- [x] Test request size limits
- [x] Test GraphQL introspection (if applicable)
- [x] Test API key exposure

### Data Security

- [x] Test encryption at rest
- [x] Test encryption in transit (TLS)
- [x] Test sensitive data in logs
- [x] Test database connection security
- [x] Test Redis connection security
- [x] Test backup security
- [x] Test data masking in responses
- [x] Test PII (Personally Identifiable Information) handling
- [x] Test payment data security (PCI DSS)
- [x] Test GDPR compliance

### Session Management

- [x] Test session fixation
- [x] Test session hijacking
- [x] Test CSRF (Cross-Site Request Forgery)
- [x] Test secure cookie flags
- [x] Test SameSite cookie attribute
- [x] Test session invalidation on logout
- [x] Test concurrent session handling
- [x] Test session storage security

### Infrastructure Security

- [x] Test Docker container security
- [x] Test environment variable exposure
- [x] Test secrets management
- [x] Test database access controls
- [x] Test API gateway security
- [x] Test load balancer configuration
- [x] Test firewall rules
- [x] Test DDoS protection
- [x] Test SSL/TLS configuration
- [x] Test security headers

## Automated Security Tests

### 1. SQL Injection Tests

```typescript
// apps/api/test/security/sql-injection.e2e-spec.ts
describe('SQL Injection Prevention (E2E)', () => {
  const sqlInjectionPayloads = [
    "' OR '1'='1",
    "1' OR '1' = '1",
    "' OR 1=1--",
    "admin'--",
    "' UNION SELECT NULL--",
    "1; DROP TABLE users--",
  ];

  it('should prevent SQL injection in login', async () => {
    for (const payload of sqlInjectionPayloads) {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: payload,
          password: 'test',
        })
        .expect((res) => {
          expect(res.status).not.toBe(500);
          expect(res.body).not.toHaveProperty('sqlMessage');
        });
    }
  });
});
```

### 2. XSS Protection Tests

```typescript
// apps/api/test/security/xss.e2e-spec.ts
describe('XSS Prevention (E2E)', () => {
  const xssPayloads = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    '<svg onload=alert("XSS")>',
    'javascript:alert("XSS")',
    '<iframe src="javascript:alert(\'XSS\')">',
  ];

  it('should sanitize XSS in product creation', async () => {
    for (const payload of xssPayloads) {
      const response = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: payload,
          sku: 'TEST-SKU',
          price: 100,
        });

      if (response.status === 201) {
        expect(response.body.data.name).not.toContain('<script>');
        expect(response.body.data.name).not.toContain('javascript:');
      }
    }
  });
});
```

### 3. Authentication Bypass Tests

```typescript
// apps/api/test/security/auth-bypass.e2e-spec.ts
describe('Authentication Bypass Prevention (E2E)', () => {
  it('should prevent access without token', () => {
    return request(app.getHttpServer())
      .get('/users/profile')
      .expect(401);
  });

  it('should prevent access with invalid token', () => {
    return request(app.getHttpServer())
      .get('/users/profile')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });

  it('should prevent access with expired token', async () => {
    const expiredToken = 'expired.jwt.token';
    return request(app.getHttpServer())
      .get('/users/profile')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);
  });
});
```

### 4. Rate Limiting Tests

```typescript
// apps/api/test/security/rate-limiting.e2e-spec.ts
describe('Rate Limiting (E2E)', () => {
  it('should enforce rate limits on login endpoint', async () => {
    const requests = Array(101).fill(null).map(() =>
      request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrong',
        })
    );

    const responses = await Promise.all(requests);
    const tooManyRequests = responses.filter(r => r.status === 429);

    expect(tooManyRequests.length).toBeGreaterThan(0);
  });
});
```

## Security Headers Configuration

### Required Headers

```typescript
// apps/api/src/main.ts
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));
```

## Penetration Testing

### Internal Penetration Testing

1. **Preparation**
   - Define scope
   - Set up test environment
   - Gather information

2. **Vulnerability Assessment**
   - Run automated scans
   - Manual testing
   - Document findings

3. **Exploitation**
   - Attempt to exploit vulnerabilities
   - Document successful exploits
   - Assess impact

4. **Reporting**
   - Create detailed report
   - Prioritize findings
   - Provide remediation recommendations

### External Penetration Testing

Hire professional penetration testers for:
- Annual comprehensive security audit
- Pre-launch security assessment
- Post-major-update security review

## Compliance Checks

### PCI DSS Compliance (Payment Card Industry Data Security Standard)

- [ ] Never store full card details
- [ ] Use tokenization for payments
- [ ] Encrypt sensitive data
- [ ] Maintain secure network
- [ ] Implement access controls
- [ ] Regular security monitoring
- [ ] Maintain security policies

### GDPR Compliance (General Data Protection Regulation)

- [ ] Data minimization
- [ ] Consent management
- [ ] Right to be forgotten
- [ ] Data portability
- [ ] Breach notification
- [ ] Privacy by design
- [ ] Data protection impact assessment

### HIPAA Compliance (Health Insurance Portability and Accountability Act)

- [ ] Secure health information
- [ ] Access controls
- [ ] Audit trails
- [ ] Encryption
- [ ] Business associate agreements
- [ ] Breach notification procedures

## Security Incident Response

### Incident Response Plan

1. **Detection**
   - Monitor logs
   - Set up alerts
   - User reports

2. **Analysis**
   - Assess severity
   - Identify affected systems
   - Determine scope

3. **Containment**
   - Isolate affected systems
   - Prevent further damage
   - Preserve evidence

4. **Eradication**
   - Remove threat
   - Patch vulnerabilities
   - Update security controls

5. **Recovery**
   - Restore systems
   - Verify functionality
   - Monitor for recurrence

6. **Lessons Learned**
   - Document incident
   - Update procedures
   - Train team

## Security Monitoring

### Logging Strategy

```typescript
// Log security events
logger.warn('Failed login attempt', {
  email: email,
  ip: req.ip,
  userAgent: req.headers['user-agent'],
  timestamp: new Date(),
});

logger.error('Unauthorized access attempt', {
  userId: user?.id,
  endpoint: req.url,
  method: req.method,
  ip: req.ip,
});
```

### Monitoring Checklist

- [ ] Failed authentication attempts
- [ ] Authorization failures
- [ ] Unusual API access patterns
- [ ] Database query anomalies
- [ ] File access violations
- [ ] Configuration changes
- [ ] Payment transaction anomalies
- [ ] Data export activities

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [PCI DSS Requirements](https://www.pcisecuritystandards.org/)

## Support

For security concerns:
- Email: security@pharmacy.com
- Bug Bounty Program: https://bugbounty.pharmacy.com
- Responsible Disclosure: https://pharmacy.com/security
