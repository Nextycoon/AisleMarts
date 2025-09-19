#!/usr/bin/env bash
set -euo pipefail

# AisleMarts Rollback Script
# Usage: ./rollback.sh [namespace] [revision]

NAMESPACE=${1:-staging}
REVISION=${2:-}

echo "🔄 Rolling back AisleMarts deployment in namespace: $NAMESPACE"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if deployment exists
if ! kubectl -n $NAMESPACE get deployment aislemarts-backend >/dev/null 2>&1; then
    echo -e "${RED}❌ Deployment aislemarts-backend not found in namespace $NAMESPACE${NC}"
    exit 1
fi

# Show current rollout history
echo "📋 Current rollout history:"
kubectl -n $NAMESPACE rollout history deployment/aislemarts-backend

# Show current status
echo ""
echo "📊 Current deployment status:"
kubectl -n $NAMESPACE get deployment aislemarts-backend -o wide

# Perform rollback
if [[ -n "$REVISION" ]]; then
    echo ""
    echo "🔙 Rolling back to revision $REVISION..."
    kubectl -n $NAMESPACE rollout undo deployment/aislemarts-backend --to-revision=$REVISION
else
    echo ""
    echo "🔙 Rolling back to previous revision..."
    kubectl -n $NAMESPACE rollout undo deployment/aislemarts-backend
fi

# Wait for rollout to complete
echo ""
echo "⏳ Waiting for rollback to complete..."
if kubectl -n $NAMESPACE rollout status deployment/aislemarts-backend --timeout=300s; then
    echo -e "${GREEN}✅ Rollback completed successfully!${NC}"
else
    echo -e "${RED}❌ Rollback failed or timed out${NC}"
    echo ""
    echo "📋 Current pod status:"
    kubectl -n $NAMESPACE get pods -l app=aislemarts
    exit 1
fi

# Show final status
echo ""
echo "📊 Final deployment status:"
kubectl -n $NAMESPACE get deployment aislemarts-backend -o wide

echo ""
echo "🏥 Running basic health check..."
sleep 10  # Give pods time to be ready

# Check if we can get pod IPs for health check
POD_IPS=$(kubectl -n $NAMESPACE get pods -l app=aislemarts -o jsonpath='{.items[*].status.podIP}' 2>/dev/null || echo "")

if [[ -n "$POD_IPS" ]]; then
    for ip in $POD_IPS; do
        echo -n "Checking pod $ip... "
        if curl -s --max-time 5 "http://$ip:8000/health" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Healthy${NC}"
        else
            echo -e "${YELLOW}⚠️ Not responding${NC}"
        fi
    done
else
    echo -e "${YELLOW}⚠️ Could not get pod IPs for health check${NC}"
fi

# Show recent events
echo ""
echo "📰 Recent events:"
kubectl -n $NAMESPACE get events --sort-by='.lastTimestamp' --field-selector involvedObject.name=aislemarts-backend | tail -10

echo ""
echo "🎯 Rollback Summary:"
echo "Namespace: $NAMESPACE"
echo "Deployment: aislemarts-backend"
if [[ -n "$REVISION" ]]; then
    echo "Rolled back to: revision $REVISION"
else
    echo "Rolled back to: previous revision"
fi

echo ""
echo "🔍 To check application health:"
echo "kubectl -n $NAMESPACE get pods -l app=aislemarts"
echo "kubectl -n $NAMESPACE logs -l app=aislemarts --tail=50"

# If this is staging, suggest running smoke tests
if [[ "$NAMESPACE" == "staging" ]]; then
    echo ""
    echo "🧪 Recommended: Run smoke tests to verify rollback:"
    echo "./ops/scripts/smoke.sh https://staging.AisleMarts.com"
fi

echo -e "${GREEN}🎉 Rollback operation completed${NC}"