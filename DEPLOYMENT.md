# AisleMarts Production Deployment Guide

This guide covers deploying AisleMarts to production infrastructure.

## 🎯 Prerequisites

- Domain name (e.g., `aislemarts.com`)
- Production server (VPS/cloud instance)
- Docker and Docker Compose installed
- SSL certificates (Caddy handles this automatically)
- MongoDB Atlas account (or self-hosted MongoDB)
- Required API keys (Stripe, Mapbox, etc.)

## 🔧 Quick Production Setup

### 1. Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create deployment directory
sudo mkdir -p /srv/aislemarts
sudo chown $USER:$USER /srv/aislemarts
```

### 2. Environment Configuration

```bash
# Copy production environment template
cp backend/.env.production backend/.env.prod

# Edit with your actual values
nano backend/.env.prod
```

**Required environment variables to update:**
- `JWT_SECRET` - Generate with: `openssl rand -base64 64`
- `HMAC_SECRET` - Generate with: `openssl rand -base64 64`
- `MONGO_URL` - Your MongoDB Atlas connection string
- `STRIPE_SECRET_KEY` - Your production Stripe secret key
- `S3_ACCESS_KEY` & `S3_SECRET_KEY` - AWS S3 credentials
- `SENTRY_DSN` - Your Sentry project DSN
- All `CHANGE_ME` placeholders

### 3. Domain & DNS Setup

Point your domain to your server:

```dns
A     @                    YOUR_SERVER_IP
A     api                  YOUR_SERVER_IP
A     www                  YOUR_SERVER_IP
CNAME status               YOUR_DOMAIN
```

### 4. SSL & Reverse Proxy (Caddy)

Create `/etc/caddy/Caddyfile`:

```caddy
# Import from the provided configuration
import /srv/aislemarts/Caddyfile.production
```

Start Caddy:
```bash
sudo systemctl enable caddy
sudo systemctl start caddy
```

### 5. Deploy Application

```bash
# Clone or copy files to server
cd /srv/aislemarts

# Deploy with Docker Compose
docker-compose -f docker-compose.production.yml up -d

# Initialize database
docker-compose -f docker-compose.production.yml exec api python scripts/production_setup.py

# Check health
curl https://api.aislemarts.com/api/health
```

## 📱 Mobile App Production Builds

### 1. Configure EAS

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure
```

### 2. Update app.json for Production

Ensure production domains are set in `app.json`:

```json
{
  "expo": {
    "ios": {
      "associatedDomains": [
        "applinks:aislemarts.com",
        "applinks:api.aislemarts.com"
      ]
    },
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "category": ["BROWSABLE", "DEFAULT"],
          "data": {
            "scheme": "https",
            "host": "aislemarts.com"
          }
        }
      ]
    }
  }
}
```

### 3. Build & Submit

```bash
# Build for both platforms
eas build -p all --profile production

# Submit to app stores
eas submit -p ios --latest --profile production
eas submit -p android --latest --profile production
```

## 🔍 Monitoring & Maintenance

### Health Checks

```bash
# API Health
curl https://api.aislemarts.com/api/health

# Legal Endpoints
curl https://api.aislemarts.com/api/legal/privacy-policy
curl https://api.aislemarts.com/api/legal/terms-of-service

# Database Connection
docker-compose exec api python -c "from pymongo import MongoClient; print('✅ MongoDB OK' if MongoClient(os.environ['MONGO_URL']).admin.command('ping') else '❌ MongoDB Failed')"
```

### Logs

```bash
# Application logs
docker-compose logs -f api

# System logs
journalctl -u caddy -f

# MongoDB logs (if self-hosted)
docker-compose logs -f mongodb
```

### Backups

```bash
# Database backup
docker-compose exec mongodb mongodump --out /backup --db aislemarts

# File backup
rsync -av /srv/aislemarts/ backup@backup-server:/backups/aislemarts/
```

## 🚀 CI/CD with GitHub Actions

### Repository Secrets

Add these secrets to your GitHub repository:

- `PROD_HOST` - Your production server IP
- `PROD_USER` - SSH username
- `PROD_SSH_KEY` - SSH private key
- `EXPO_TOKEN` - Expo access token
- `APPLE_ID` - Apple ID for App Store submissions
- `GOOGLE_SERVICE_ACCOUNT_JSON` - Google Play service account

### Automatic Deployments

Deployments trigger automatically on:
- Push to `main` branch
- Manual workflow dispatch

### Manual Deployment

```bash
# Trigger deployment manually
gh workflow run deploy-production.yml
```

## 🔒 Security Checklist

- [ ] Firewall configured (only ports 80, 443, 22 open)
- [ ] SSH key authentication (password disabled)
- [ ] SSL certificates auto-renewing
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] Application logs monitored
- [ ] Regular security updates scheduled
- [ ] Backup strategy implemented

## 📊 Performance Optimization

### Backend Optimization

- Use MongoDB Atlas for better performance
- Enable Redis caching
- Configure Gunicorn workers based on CPU cores
- Set up CDN for static assets

### Frontend Optimization

- Enable bundle splitting in Expo
- Optimize images and assets
- Configure proper caching headers
- Use production builds only

## 🆘 Troubleshooting

### Common Issues

**SSL Certificate Issues:**
```bash
sudo caddy reload --config /etc/caddy/Caddyfile
```

**Database Connection Failed:**
```bash
# Check MongoDB Atlas IP whitelist
# Verify connection string format
# Test with MongoDB Compass
```

**API Not Responding:**
```bash
# Check container status
docker-compose ps

# Check logs
docker-compose logs api

# Restart services
docker-compose restart api
```

### Recovery Procedures

**Rollback Deployment:**
```bash
# Stop current version
docker-compose down

# Deploy previous version
git checkout PREVIOUS_COMMIT
docker-compose up -d --build
```

**Database Recovery:**
```bash
# Restore from backup
mongorestore --uri="MONGO_URL" --db aislemarts /path/to/backup
```

## 📞 Support

For deployment issues:
1. Check logs first: `docker-compose logs -f`
2. Verify health endpoints
3. Check GitHub Actions for CI/CD issues
4. Contact DevOps team with error details

---

**Next Steps:** After successful deployment, proceed with app store submissions and marketing launch.