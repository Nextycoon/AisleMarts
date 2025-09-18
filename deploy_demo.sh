#!/bin/bash

# AisleMarts Demo Deployment Script
# Usage: ./deploy_demo.sh [staging|production]

set -e  # Exit on any error

ENV=${1:-staging}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="deploy_${ENV}_${TIMESTAMP}.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    command -v docker >/dev/null 2>&1 || error "Docker is not installed"
    command -v docker-compose >/dev/null 2>&1 || error "Docker Compose is not installed"
    command -v curl >/dev/null 2>&1 || error "curl is not installed"
    
    # Check if Docker daemon is running
    docker info >/dev/null 2>&1 || error "Docker daemon is not running"
    
    success "Prerequisites check passed"
}

# Create necessary directories and files
setup_environment() {
    log "Setting up environment for $ENV..."
    
    # Create backend Dockerfile if it doesn't exist
    if [ ! -f "backend/Dockerfile" ]; then
        log "Creating backend Dockerfile..."
        cat > backend/Dockerfile << 'EOF'
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Set Python path
ENV PYTHONPATH=/app

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start server
CMD ["python", "-m", "uvicorn", "v1_main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
EOF
        success "Created backend Dockerfile"
    fi
    
    # Create requirements.txt if it doesn't exist
    if [ ! -f "backend/requirements.txt" ]; then
        log "Creating requirements.txt..."
        cat > backend/requirements.txt << 'EOF'
fastapi==0.111.0
uvicorn[standard]==0.30.0
motor==3.3.2
pydantic==2.7.4
python-dotenv==1.0.1
pymongo==4.5.0
dnspython==2.8.0
EOF
        success "Created requirements.txt"
    fi
}

# Build and start services
deploy_services() {
    log "Building and deploying services..."
    
    # Stop existing services
    log "Stopping existing services..."
    docker-compose -f docker-compose.${ENV}.yml down --remove-orphans || warning "No existing services to stop"
    
    # Build services
    log "Building Docker images..."
    docker-compose -f docker-compose.${ENV}.yml build --pull --no-cache
    
    # Start services
    log "Starting services..."
    docker-compose -f docker-compose.${ENV}.yml up -d
    
    success "Services started successfully"
}

# Wait for services to be healthy
wait_for_services() {
    log "Waiting for services to be healthy..."
    
    # Wait for MongoDB
    log "Waiting for MongoDB..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if docker-compose -f docker-compose.${ENV}.yml exec -T mongo mongosh --eval "db.runCommand('ping')" >/dev/null 2>&1; then
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        error "MongoDB failed to start within 60 seconds"
    fi
    success "MongoDB is healthy"
    
    # Wait for API
    log "Waiting for API..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if curl -f http://localhost:8000/health >/dev/null 2>&1; then
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        error "API failed to start within 60 seconds"
    fi
    success "API is healthy"
}

# Seed database
seed_database() {
    log "Seeding database..."
    
    # Copy seed script to API container and run it
    docker-compose -f docker-compose.${ENV}.yml exec -T api python seed_products.py || error "Database seeding failed"
    
    success "Database seeded successfully"
}

# Run health checks
run_health_checks() {
    log "Running health checks..."
    
    # API health check
    response=$(curl -s http://localhost:8000/health)
    if echo "$response" | grep -q '"ok":true'; then
        success "API health check passed"
    else
        error "API health check failed: $response"
    fi
    
    # Test collections endpoint
    response=$(curl -s http://localhost:8000/products/collections)
    if echo "$response" | grep -q 'Luxury'; then
        success "Collections endpoint working"
    else
        error "Collections endpoint failed: $response"
    fi
    
    # Test AI recommendations
    response=$(curl -s "http://localhost:8000/ai/recommend?mood=luxury")
    if echo "$response" | grep -q 'items'; then
        success "AI recommendations working"
    else
        error "AI recommendations failed: $response"
    fi
    
    success "All health checks passed"
}

# Display deployment summary
show_summary() {
    log "Deployment Summary"
    echo ""
    echo "🚀 AisleMarts $ENV Deployment Complete!"
    echo ""
    echo "📊 Service Status:"
    docker-compose -f docker-compose.${ENV}.yml ps
    echo ""
    echo "🔗 URLs:"
    echo "  - API Health: http://localhost:8000/health"
    echo "  - API Docs: http://localhost:8000/docs"
    echo "  - Collections: http://localhost:8000/products/collections"
    echo "  - AI Recommend: http://localhost:8000/ai/recommend?mood=luxury"
    echo ""
    echo "📋 Next Steps:"
    echo "  1. Configure your domain in Caddyfile.staging"
    echo "  2. Update DNS to point to this server"
    echo "  3. Build Expo APK with staging URL"
    echo "  4. Test the full demo flow"
    echo ""
    echo "📁 Logs saved to: $LOG_FILE"
}

# Cleanup on exit
cleanup() {
    if [ $? -ne 0 ]; then
        error "Deployment failed. Check logs in $LOG_FILE"
        echo ""
        echo "🔧 Troubleshooting:"
        echo "  - Check Docker logs: docker-compose -f docker-compose.${ENV}.yml logs"
        echo "  - Check service status: docker-compose -f docker-compose.${ENV}.yml ps"
        echo "  - Restart services: docker-compose -f docker-compose.${ENV}.yml restart"
    fi
}

trap cleanup EXIT

# Main execution
main() {
    log "Starting AisleMarts $ENV deployment..."
    
    check_prerequisites
    setup_environment
    deploy_services
    
    log "Waiting 10 seconds for services to initialize..."
    sleep 10
    
    wait_for_services
    seed_database
    run_health_checks
    show_summary
    
    success "AisleMarts $ENV deployment completed successfully!"
}

# Run main function
main "$@"