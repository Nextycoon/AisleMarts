# AisleMarts Operations Runbook

## 🎯 SLA Targets

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| **Availability** | 99.95% | < 99.9% over 5m |
| **Latency (p95)** | < 300ms | > 300ms for 5m |
| **Error Rate** | < 0.05% | > 0.05% for 2m |
| **RPO (Recovery Point)** | ≤ 12h | > 36h since backup |
| **RTO (Recovery Time)** | ≤ 30m | Deployment > 10m |

## 🚨 Alert Response Guide

### CRITICAL: High Error Rate
**Alert:** `AisleMartsHighErrorRate`

**Immediate Actions (0-2 minutes):**
1. Acknowledge alert in PagerDuty/Slack
2. Check Grafana dashboard: [AisleMarts Production](https://grafana.AisleMarts.com/d/aislemarts-prod)
3. Identify error pattern:
   ```bash
   kubectl -n prod logs -l app=aislemarts --tail=100 | grep -i error
   ```

**Investigation (2-5 minutes):**
```bash
# Check pod health
kubectl -n prod get pods -l app=aislemarts

# Check recent deployments
kubectl -n prod rollout history deploy/aislemarts-backend

# Check resource usage
kubectl -n prod top pods -l app=aislemarts
```

**Mitigation:**
- If **deployment-related**: `./ops/scripts/rollback.sh prod`
- If **resource exhaustion**: `kubectl -n prod scale deploy/aislemarts-backend --replicas=10`
- If **database issues**: Check MongoDB Atlas dashboard + connection strings

**Escalation:** If error rate > 1% for > 5m, escalate to CTO + create incident doc

---

### CRITICAL: High Latency
**Alert:** `AisleMartsHighLatency`

**Immediate Actions:**
1. Check database performance (MongoDB Atlas)
2. Scale up immediately:
   ```bash
   kubectl -n prod scale deploy/aislemarts-backend --replicas=10
   ```
3. Check external dependencies (Stripe, OpenAI)

**Investigation:**
```bash
# Check slow queries in logs
kubectl -n prod logs -l app=aislemarts | grep -E "(slow|timeout|[0-9]{4}ms)"

# Check HPA status
kubectl -n prod get hpa aislemarts-hpa
```

**Common Causes:**
- Database connection pool exhaustion
- Memory pressure causing GC pauses
- External API slowness (AI services, payments)
- Cold start issues after scaling

---

### CRITICAL: Pods Down
**Alert:** `AisleMartsPodDown`

**Immediate Actions:**
```bash
# Check pod status
kubectl -n prod get pods -l app=aislemarts -o wide

# Check events
kubectl -n prod get events --sort-by='.lastTimestamp' | tail -10

# Force restart if needed
kubectl -n prod rollout restart deploy/aislemarts-backend
```

**Root Cause Analysis:**
- Resource limits exceeded → Check `kubectl top pods`
- Image pull failures → Check Artifact Registry permissions
- Health check failures → Review `/health` endpoint logs

---

### WARNING: Backup Issues
**Alert:** `AisleMartsBackupStale` or `AisleMartsBackupFailed`

**Investigation:**
```bash
# Check backup job status
kubectl -n prod get jobs -l app=mongo-backup

# Check backup logs
kubectl -n prod logs -l app=mongo-backup --tail=50

# Manual backup trigger
kubectl -n prod create job --from=cronjob/mongo-backup manual-backup-$(date +%s)
```

**Verification:**
```bash
# Check GCS bucket
gsutil ls gs://aislemarts-backups/$(date +%Y)/$(date +%m)/ | tail -5
```

---

## 💳 Payment System Issues

### Stripe Webhook Failures
**Symptoms:** Payment confirmation delays, order status inconsistencies

**Investigation:**
1. Check Stripe Dashboard → Webhooks → View events
2. Review webhook logs:
   ```bash
   kubectl -n prod logs -l app=aislemarts | grep stripe
   ```
3. Verify webhook endpoint accessibility from Stripe

**Resolution:**
- Re-deliver failed events via Stripe Dashboard
- Verify `STRIPE_SECRET_KEY` is current
- Check ingress SSL certificate validity

### Payment Processing Delays
**Common causes:**
- Stripe API rate limiting
- Network connectivity to Stripe
- Database transaction locks

**Mitigation:**
- Implement payment retry logic
- Scale up processing pods
- Check payment queue backlog

---

## 🤖 AI Service Degradation

### Voice Command Failures
**Check points:**
- OpenAI API quota and billing
- `EMERGENT_LLM_KEY` validity
- Audio processing pipeline

### Recommendation Engine Issues
**Symptoms:** No personalized recommendations, fallback to static content

**Debug:**
```bash
kubectl -n prod logs -l app=aislemarts | grep -i "recommendation\|ai"
```

---

## 🔄 Deployment Procedures

### Standard Deployment
```bash
# Via GitHub Actions (recommended)
git push origin main

# Manual deployment
helm upgrade aislemarts ops/helm/aislemarts \
  --namespace prod \
  --set image.tag=$(git rev-parse --short HEAD)
```

### Emergency Rollback
```bash
# Quick rollback
./ops/scripts/rollback.sh prod

# Rollback to specific revision
./ops/scripts/rollback.sh prod 5
```

### Blue/Green Deployment (if needed)
```bash
# Deploy to staging first
git push origin staging

# Run smoke tests
./ops/scripts/smoke.sh https://staging.AisleMarts.com

# Promote to production
git checkout main && git merge staging && git push origin main
```

---

## 💾 Backup & Recovery

### Automated Backups
- **Schedule:** Every 12 hours (02:00 and 14:00 UTC)
- **Location:** `gs://aislemarts-backups/YYYY/MM/`
- **Retention:** 90 days (automated lifecycle)

### Manual Backup
```bash
kubectl -n prod create job --from=cronjob/mongo-backup manual-backup-$(date +%s)
```

### Disaster Recovery
```bash
# Download backup
gsutil cp gs://aislemarts-backups/2024/01/backup-20240115T020000Z.tar.gz ./

# Extract
tar -xzf backup-20240115T020000Z.tar.gz

# Restore (use staging first!)
mongorestore --uri="$MONGO_URI_STAGING" --dir=./backup-20240115T020000Z/
```

### Database Maintenance Windows
- **Preferred:** Saturday 02:00-06:00 UTC (Friday 9PM-1AM EST)
- **Process:** Scale down → Backup → Maintenance → Restore → Scale up
- **Communication:** #aislemarts-ops channel 24h advance notice

---

## 🔐 Security Incidents

### Suspected Breach/Attack
1. **Immediate containment:**
   ```bash
   kubectl -n prod scale deploy/aislemarts-backend --replicas=0
   ```
2. **Notify:** Security team + CTO immediately
3. **Preserve evidence:** Capture logs, network traces
4. **Rotate secrets:** JWT, Stripe keys, database passwords

### API Abuse/Rate Limiting
- Monitor via Grafana for unusual traffic patterns
- Implement additional rate limiting at ingress level if needed
- Block suspicious IPs via Network Policy

---

## 📊 Monitoring & Dashboards

### Primary Dashboards
- **Production Overview:** [Grafana AisleMarts Prod](https://grafana.AisleMarts.com/d/aislemarts-prod)
- **Business Metrics:** Orders, Payments, AI Usage
- **Infrastructure:** Pod health, Resource usage, Ingress metrics

### Key Metrics to Watch
```promql
# Error rate (should be < 0.05%)
sum(rate(http_server_requests_total{status=~"5.."}[5m])) / sum(rate(http_server_requests_total[5m]))

# P95 latency (should be < 300ms)
histogram_quantile(0.95, sum(rate(http_server_request_duration_seconds_bucket[5m])) by (le))

# Business metrics
rate(aisle_orders_total[1h]) * 3600  # Orders per hour
rate(aisle_payments_total[1h]) * 3600  # Payments per hour
```

### Log Analysis
```bash
# Error analysis
kubectl -n prod logs -l app=aislemarts --since=1h | grep -i error | sort | uniq -c

# Performance analysis
kubectl -n prod logs -l app=aislemarts --since=1h | grep -oE '[0-9]+ms' | sort -n | tail -10
```

---

## 📞 Escalation & Contacts

### On-Call Rotation
- **Primary:** SRE Team (PagerDuty escalation policy)
- **Secondary:** Backend Team Lead
- **Emergency:** CTO

### Communication Channels
- **Real-time:** `#aislemarts-ops` (Slack)
- **Incidents:** `#incidents` (Slack)
- **Status page:** [status.AisleMarts.com](https://status.AisleMarts.com)

### Vendor Contacts
- **MongoDB Atlas:** Support via portal
- **GCP:** Premium support
- **Stripe:** Priority support contact
- **Emergent Platform:** Support via platform

---

## 🔧 Maintenance & Updates

### Weekly Tasks
- [ ] Review backup success/failure logs
- [ ] Check certificate expiry dates
- [ ] Review security scan results
- [ ] Update dependencies (staging first)

### Monthly Tasks
- [ ] Rotate non-critical secrets
- [ ] Review and update monitoring thresholds
- [ ] Disaster recovery drill
- [ ] Performance optimization review

### Quarterly Tasks
- [ ] Security audit
- [ ] Capacity planning review
- [ ] Rotate critical secrets (JWT, Stripe)
- [ ] Update runbook based on incidents

---

## 🚀 Performance Optimization

### Database Optimization
- Monitor slow queries via MongoDB Atlas
- Index optimization for frequent queries
- Connection pool tuning

### Application Optimization
- JVM/Python memory tuning
- Cache hit ratio monitoring
- CDN optimization for static assets

### Infrastructure Optimization
- Node pool right-sizing
- HPA tuning based on traffic patterns
- Cost optimization reviews

---

## 📚 Additional Resources

- **Architecture Docs:** [docs.AisleMarts.com/architecture](https://docs.AisleMarts.com/architecture)
- **API Documentation:** [api.AisleMarts.com/docs](https://api.AisleMarts.com/docs)
- **Terraform Docs:** `ops/terraform/gcp/README.md`
- **Kubernetes Manifests:** `ops/k8s/`

---

*Last updated: 2024-01 | Version: 1.0 | Owner: SRE Team*