#!/bin/bash

# AisleMarts Environment Setup Script
# This script helps set up the production environment

set -e

echo "🛠️  AisleMarts Environment Setup"
echo "This script will help you configure your production environment."
echo ""

# Function to generate random string
generate_secret() {
    openssl rand -base64 64 | tr -d '\n'
}

# Function to prompt for input with default
prompt_with_default() {
    local prompt="$1"
    local default="$2"
    local result
    
    if [ -n "$default" ]; then
        read -p "$prompt [$default]: " result
        echo "${result:-$default}"
    else
        read -p "$prompt: " result
        echo "$result"
    fi
}

# Create production environment file
ENV_FILE="backend/.env.prod"

echo "📝 Creating production environment configuration..."

# Domain configuration
echo ""
echo "🌐 Domain Configuration"
DOMAIN=$(prompt_with_default "Enter your domain name" "aislemarts.com")

# Database configuration  
echo ""
echo "💾 Database Configuration"
echo "Choose your MongoDB option:"
echo "1. MongoDB Atlas (recommended)"
echo "2. Self-hosted MongoDB"
DB_CHOICE=$(prompt_with_default "Enter choice (1 or 2)" "1")

if [ "$DB_CHOICE" = "1" ]; then
    MONGO_URL=$(prompt_with_default "Enter MongoDB Atlas connection string" "")
else
    MONGO_URL="mongodb://localhost:27017/aislemarts"
fi

# Security configuration
echo ""
echo "🔒 Security Configuration"
JWT_SECRET=$(generate_secret)
HMAC_SECRET=$(generate_secret)
API_SECRET=$(generate_secret)

echo "Generated security secrets automatically."

# Payment configuration
echo ""
echo "💳 Payment Configuration"
STRIPE_SECRET=$(prompt_with_default "Enter Stripe secret key (sk_live_...)" "")
STRIPE_PUBLISHABLE=$(prompt_with_default "Enter Stripe publishable key (pk_live_...)" "")

# File storage configuration
echo ""
echo "📁 File Storage Configuration"
S3_BUCKET=$(prompt_with_default "Enter S3 bucket name" "aislemarts-media-prod")
S3_ACCESS_KEY=$(prompt_with_default "Enter S3 access key" "")
S3_SECRET_KEY=$(prompt_with_default "Enter S3 secret key" "")
S3_REGION=$(prompt_with_default "Enter S3 region" "eu-central-1")

# Monitoring configuration
echo ""
echo "📊 Monitoring Configuration (optional)"
SENTRY_DSN=$(prompt_with_default "Enter Sentry DSN (optional)" "")
POSTHOG_KEY=$(prompt_with_default "Enter PostHog key (optional)" "")

# Email configuration
echo ""
echo "📧 Email Configuration"
SMTP_USER=$(prompt_with_default "Enter SMTP username" "")
SMTP_PASS=$(prompt_with_default "Enter SMTP password" "")
SMTP_FROM=$(prompt_with_default "Enter from email address" "noreply@${DOMAIN}")

# Create the environment file
cat > "$ENV_FILE" << EOF
# === AisleMarts Production Environment ===
# Generated on $(date)

# === Core Configuration ===
ENV=production
TZ=Europe/Istanbul
DEBUG=false

# === URLs ===
BACKEND_BASE_URL=https://api.${DOMAIN}
CORS_ORIGINS=["https://${DOMAIN}", "https://www.${DOMAIN}", "https://api.${DOMAIN}"]
ALLOWED_HOSTS=["api.${DOMAIN}", "${DOMAIN}"]

# === Security ===
JWT_SECRET=${JWT_SECRET}
HMAC_SECRET=${HMAC_SECRET}
API_SECRET_KEY=${API_SECRET}

# === Database ===
MONGO_URL=${MONGO_URL}
DB_NAME=aislemarts

# === Payment Processing ===
STRIPE_SECRET_KEY=${STRIPE_SECRET}
STRIPE_PUBLISHABLE_KEY=${STRIPE_PUBLISHABLE}

# === File Storage ===
S3_ENDPOINT=https://s3.amazonaws.com
S3_BUCKET=${S3_BUCKET}
S3_ACCESS_KEY=${S3_ACCESS_KEY}
S3_SECRET_KEY=${S3_SECRET_KEY}
S3_REGION=${S3_REGION}

# === Monitoring ===
SENTRY_DSN=${SENTRY_DSN}
POSTHOG_KEY=${POSTHOG_KEY}
POSTHOG_HOST=https://eu.posthog.com

# === Email ===
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=${SMTP_USER}
SMTP_PASS=${SMTP_PASS}
SMTP_FROM=${SMTP_FROM}

# === Features ===
SHOP_ENABLED=true
LIVE_SHOPPING_ENABLED=true
B2B_RFQ_ENABLED=true
AFFILIATE_ENABLED=true
ZERO_COMMISSION_MODE=true

# === Performance ===
WORKERS=4
MAX_CONNECTIONS=100
TIMEOUT=30
REDIS_URL=redis://localhost:6379/0

# === Legal Compliance ===
PRIVACY_POLICY_URL=https://api.${DOMAIN}/api/legal/privacy-policy
TERMS_SERVICE_URL=https://api.${DOMAIN}/api/legal/terms-of-service
EOF

echo ""
echo "✅ Environment configuration created: $ENV_FILE"
echo ""
echo "📋 Next steps:"
echo "1. Review and edit $ENV_FILE if needed"
echo "2. Set up your domain DNS records:"
echo "   - A    @     YOUR_SERVER_IP"
echo "   - A    api   YOUR_SERVER_IP"
echo "   - A    www   YOUR_SERVER_IP"
echo "3. Run deployment script: ./scripts/deploy_production.sh"
echo "4. Configure SSL with Caddy (automatic)"
echo "5. Build mobile apps: ./scripts/build_production.sh"
echo ""
echo "🔒 Security reminder:"
echo "- Keep your environment file secure and never commit it to version control"
echo "- Regularly rotate your secrets"
echo "- Enable 2FA on all service accounts"
echo ""
echo "📞 Support: If you need help, check the DEPLOYMENT.md guide"