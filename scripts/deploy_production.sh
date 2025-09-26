#!/bin/bash

# AisleMarts Production Deployment Script
# This script deploys the backend to production infrastructure

set -e

# Configuration
PROD_HOST="${PROD_HOST:-your-server.com}"
PROD_USER="${PROD_USER:-ubuntu}"
DEPLOY_PATH="/srv/aislemarts"

echo "🚀 Starting AisleMarts Production Deployment..."

# Check if SSH connection works
echo "🔍 Testing SSH connection to ${PROD_HOST}..."
if ! ssh -o ConnectTimeout=10 "${PROD_USER}@${PROD_HOST}" "echo 'SSH connection successful'"; then
    echo "❌ SSH connection failed. Check your configuration."
    exit 1
fi

# Create deployment archive
echo "📦 Creating deployment archive..."
TEMP_DIR=$(mktemp -d)
ARCHIVE_NAME="aislemarts-$(date +%Y%m%d-%H%M%S).tar.gz"

# Copy necessary files
cp -r backend/ "$TEMP_DIR/"
cp docker-compose.production.yml "$TEMP_DIR/"
cp Caddyfile.production "$TEMP_DIR/"
cp -r web/ "$TEMP_DIR/" 2>/dev/null || true

# Create archive
cd "$TEMP_DIR"
tar -czf "$ARCHIVE_NAME" .
mv "$ARCHIVE_NAME" /tmp/

echo "📤 Uploading to production server..."
scp "/tmp/$ARCHIVE_NAME" "${PROD_USER}@${PROD_HOST}:/tmp/"

echo "🔧 Deploying on production server..."
ssh "${PROD_USER}@${PROD_HOST}" << EOF
    set -e
    
    # Create backup of current deployment
    if [ -d "${DEPLOY_PATH}" ]; then
        sudo cp -r "${DEPLOY_PATH}" "${DEPLOY_PATH}.backup.$(date +%Y%m%d-%H%M%S)"
    fi
    
    # Create deployment directory
    sudo mkdir -p "${DEPLOY_PATH}"
    sudo chown ${PROD_USER}:${PROD_USER} "${DEPLOY_PATH}"
    
    # Extract new deployment
    cd "${DEPLOY_PATH}"
    tar -xzf "/tmp/$ARCHIVE_NAME"
    
    # Set up environment
    if [ ! -f "backend/.env.prod" ]; then
        cp "backend/.env.production" "backend/.env.prod"
        echo "⚠️  Please edit backend/.env.prod with production values"
    fi
    
    # Stop existing containers
    docker-compose -f docker-compose.production.yml down || true
    
    # Pull latest images and start
    docker-compose -f docker-compose.production.yml pull
    docker-compose -f docker-compose.production.yml up -d --build
    
    # Wait for services to start
    echo "⏳ Waiting for services to start..."
    sleep 30
    
    # Health check
    echo "🏥 Performing health check..."
    curl -f http://localhost:8000/api/health || {
        echo "❌ Health check failed"
        exit 1
    }
    
    # Clean up
    rm "/tmp/$ARCHIVE_NAME"
    
    echo "✅ Deployment completed successfully!"
EOF

# Clean up local files
rm -rf "$TEMP_DIR"
rm "/tmp/$ARCHIVE_NAME"

echo "🎉 Production deployment completed!"
echo ""
echo "📋 Post-deployment checklist:"
echo "1. Verify API health: curl https://api.aislemarts.com/api/health"
echo "2. Check legal endpoints: curl https://api.aislemarts.com/api/legal/privacy-policy"
echo "3. Test mobile app connectivity"
echo "4. Monitor logs: ssh ${PROD_USER}@${PROD_HOST} 'cd ${DEPLOY_PATH} && docker-compose logs -f'"