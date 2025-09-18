# 🔒 AisleMarts Phase 2 Unlock Authorization System

## 🎯 Overview

This package provides a production-ready unlock authorization system for AisleMarts Phase 2 (Business Layer). It ensures that Phase 2 features are only activated when the app reaches 1,000,000+ shopper downloads OR through a secure multi-admin manual override process.

**Key Features:**
- ✅ Automatic unlock at 1M+ downloads
- ✅ Multi-admin manual override (2-of-N approval)
- ✅ Complete audit trail in PostgreSQL
- ✅ Redis-based approval queue
- ✅ React admin dashboard
- ✅ Emergent API integration hooks
- ✅ Production-ready security

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- PostgreSQL 13+
- Redis 6+
- Your existing metrics API endpoint

### 1. Environment Setup

Create `.env` file:
```bash
# Core Configuration
PORT=8080
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgres://user:pass@localhost:5432/aislemarts
DOWNLOAD_TARGET=1000000

# Metrics Integration
METRICS_DOWNLOADS_ENDPOINT=https://your-metrics.api/installs/total
METRICS_API_KEY=your_metrics_api_key

# Admin Security
ADMIN_TOKENS=admin-token-1,admin-token-2,admin-token-3
REQUIRED_APPROVALS=2

# Optional: Emergent Integration
EMERGENT_API_URL=https://emergent.api/commands/unlock
EMERGENT_API_KEY=your_emergent_key

# Frontend (for admin dashboard)
REACT_APP_API_BASE=http://localhost:8080/api
REACT_APP_DOWNLOAD_TARGET=1000000
REACT_APP_REQUIRED_APPROVALS=2
```

### 2. Database Setup

Run the migration:
```bash
psql $DATABASE_URL -f db/migrations/2025_09_18_create_phase2_audit.sql
```

### 3. Install Dependencies

```bash
npm init -y
npm install express node-fetch ioredis pg body-parser cors
npm install --save-dev jest supertest
```

### 4. Start the Service

```bash
node server/index.js
```

The service will be available at `http://localhost:8080`

---

## 📊 API Endpoints

### GET /api/phase2/status
Check current unlock status and download count.

**Response:**
```json
{
  "ok": true,
  "unlocked": false,
  "downloads": 750000,
  "required": 1000000
}
```

### POST /api/phase2/unlock
Request unlock (auto or manual).

**Request:**
```json
{
  "adminToken": "admin-token-1",
  "force": false
}
```

**Response (Auto-unlock when downloads >= target):**
```json
{
  "ok": true,
  "method": "auto",
  "downloads": 1500000
}
```

**Response (Manual approval pending):**
```json
{
  "ok": true,
  "method": "pending",
  "approvals": 1,
  "requiredApprovals": 2
}
```

**Response (Manual unlock complete):**
```json
{
  "ok": true,
  "method": "manual",
  "approvals": 2
}
```

### GET /api/phase2/flag
Check current unlock flag status (admin only).

**Response:**
```json
{
  "unlocked": true,
  "flag": {
    "by": "auto",
    "at": 1640995200000,
    "downloads": 1500000
  }
}
```

---

## 🧪 Testing

### Manual Testing with curl

**Check Status:**
```bash
curl -sS http://localhost:8080/api/phase2/status | jq
```

**Request Manual Unlock (First Admin):**
```bash
curl -X POST http://localhost:8080/api/phase2/unlock \
  -H "Content-Type: application/json" \
  -d '{"adminToken":"admin-token-1"}'
```

**Request Manual Unlock (Second Admin - Triggers Unlock):**
```bash
curl -X POST http://localhost:8080/api/phase2/unlock \
  -H "Content-Type: application/json" \
  -d '{"adminToken":"admin-token-2"}'
```

**Force Unlock (Emergency):**
```bash
curl -X POST http://localhost:8080/api/phase2/unlock \
  -H "Content-Type: application/json" \
  -d '{"adminToken":"admin-token-1","force":true}'
```

### Automated Testing

Run Jest test suite:
```bash
npm test
```

The test suite covers:
- Auto-unlock behavior when downloads >= target
- Multi-admin approval flow
- Admin token validation
- Audit logging
- Error handling

---

## 🔐 Security Considerations

### Admin Tokens
- Store in secure secrets manager (AWS Secrets Manager, HashiCorp Vault)
- Use high-entropy tokens (minimum 32 characters)
- Rotate tokens quarterly
- Log all admin actions

### Network Security
- Deploy behind VPN/private network
- Use TLS/HTTPS in production
- Implement rate limiting
- Add WAF protection

### Access Control
- Admin dashboard behind SSO (Auth0, Okta)
- IP allowlisting for admin panel
- 2FA required for admin users
- Audit all unlock attempts

### Database Security
- Encrypt audit logs at rest
- Backup audit table separately
- Restrict database access to compliance team
- Enable query logging

---

## 🏗️ Production Deployment

### Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY server/ ./server/
COPY db/ ./db/
EXPOSE 8080
CMD ["node", "server/index.js"]
```

Build and run:
```bash
docker build -t aislemarts-phase2-unlock .
docker run -p 8080:8080 --env-file .env aislemarts-phase2-unlock
```

### Kubernetes Deployment

Create `k8s-deploy.yaml`:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: phase2-unlock
spec:
  replicas: 2
  selector:
    matchLabels:
      app: phase2-unlock
  template:
    metadata:
      labels:
        app: phase2-unlock
    spec:
      containers:
      - name: phase2-unlock
        image: aislemarts-phase2-unlock:latest
        ports:
        - containerPort: 8080
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: phase2-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: phase2-secrets
              key: redis-url
        - name: ADMIN_TOKENS
          valueFrom:
            secretKeyRef:
              name: phase2-secrets
              key: admin-tokens
---
apiVersion: v1
kind: Service
metadata:
  name: phase2-unlock-service
spec:
  selector:
    app: phase2-unlock
  ports:
  - port: 80
    targetPort: 8080
  type: LoadBalancer
```

Deploy:
```bash
kubectl apply -f k8s-deploy.yaml
```

---

## 🎭 Investor Demo Integration

### Demo Flow

1. **Show Slide 27** - Interactive command terminal with locked features
2. **Open Admin Panel** - Navigate to internal admin dashboard
3. **Display Status** - Show current download count vs. 1M target
4. **Explain Mechanism**:
   - "Auto-unlock when we hit 1 million downloads"
   - "Manual override requires 2 admin approvals for emergency access"
5. **Demonstrate Multi-Admin** (staging only):
   - Admin 1 submits approval → "Pending" status
   - Admin 2 submits approval → "Unlocked" status
6. **Show Audit Trail** - Query audit table to show logged activity
7. **Emphasize Security** - Multi-factor, logged, reversible

### Demo Script

```
"The locked commands you saw aren't just visual effects. Behind them is 
a production-ready authorization system. 

[Open admin panel]

Here's our current download count - 750,000 and growing. When we hit 
1 million, these commands unlock automatically. 

But we also have a secure manual override. Watch this...

[Submit first approval]

One admin approval - status is 'pending'. Now the second admin...

[Submit second approval]

And now Phase 2 is unlocked. Every action is logged, auditable, and 
reversible.

This isn't a demo. This is the actual infrastructure that will govern 
when your Series A investment unlocks the complete AisleMarts Business 
platform."
```

---

## 📋 Integration Checklist

### Before Production Deployment

- [ ] **Metrics API Integration**
  - [ ] Configure `METRICS_DOWNLOADS_ENDPOINT` 
  - [ ] Test API connection and response format
  - [ ] Verify download count accuracy across platforms

- [ ] **Security Setup**
  - [ ] Generate secure admin tokens
  - [ ] Configure secrets manager
  - [ ] Set up SSL/TLS certificates
  - [ ] Configure firewall rules

- [ ] **Database Setup**
  - [ ] Run migration script
  - [ ] Configure backup schedule
  - [ ] Set up monitoring/alerting
  - [ ] Test connection pooling

- [ ] **Redis Setup**
  - [ ] Configure Redis cluster/persistence
  - [ ] Set up backup schedule
  - [ ] Test failover scenarios
  - [ ] Configure memory limits

- [ ] **Admin Dashboard**
  - [ ] Deploy behind SSO
  - [ ] Configure IP allowlisting
  - [ ] Set up monitoring
  - [ ] Test all functionality

- [ ] **Testing**
  - [ ] Run full test suite
  - [ ] Perform manual testing
  - [ ] Load test unlock endpoints
  - [ ] Test disaster recovery

### After Deployment

- [ ] **Monitoring Setup**
  - [ ] Configure health check endpoints
  - [ ] Set up error alerting
  - [ ] Monitor unlock attempts
  - [ ] Track performance metrics

- [ ] **Compliance**
  - [ ] Document audit procedures
  - [ ] Train compliance team
  - [ ] Set up periodic reviews
  - [ ] Configure log retention

---

## 🚨 Troubleshooting

### Common Issues

**Issue: "Metrics API error: 401"**
```
Solution: Verify METRICS_API_KEY is correct and has read permissions
```

**Issue: "Redis connection failed"**
```
Solution: Check REDIS_URL format and network connectivity
curl redis://localhost:6379
```

**Issue: "Database connection refused"**
```
Solution: Verify DATABASE_URL and PostgreSQL service status
pg_isready -d $DATABASE_URL
```

**Issue: "Admin token rejected"**
```
Solution: Verify token is in ADMIN_TOKENS list and properly formatted
echo $ADMIN_TOKENS | tr ',' '\n'
```

### Debug Mode

Enable debug logging:
```bash
DEBUG=aislemarts:unlock node server/index.js
```

### Health Checks

**Service Health:**
```bash
curl http://localhost:8080/health
```

**Database Health:**
```bash
curl http://localhost:8080/api/phase2/status
```

**Redis Health:**
```bash
redis-cli ping
```

---

## 📞 Support

### Emergency Contacts
- **Technical Issues**: DevOps team
- **Security Incidents**: Security team  
- **Admin Access**: Compliance team

### Escalation Procedures
1. Check service health endpoints
2. Review application logs
3. Verify infrastructure status
4. Contact on-call engineer
5. Escalate to security team if needed

---

## 📝 Changelog

### v1.0.0 (2025-09-18)
- Initial release
- Auto-unlock at 1M downloads
- Multi-admin manual override
- Complete audit trail
- React admin dashboard
- Jest test suite
- Production deployment guides

---

**🚀 Phase 2 Unlock Authorization System - Ready for Production Deployment**