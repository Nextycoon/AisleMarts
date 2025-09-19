#!/usr/bin/env bash
set -euo pipefail

# AisleMarts Kubernetes Bootstrap Script
# Usage: ./bootstrap.sh [namespace] [environment]

NAMESPACE=${1:-staging}
ENVIRONMENT=${2:-staging}

echo "🚀 Bootstrapping AisleMarts for namespace: $NAMESPACE (environment: $ENVIRONMENT)"

# Apply namespace
echo "📁 Creating namespace..."
kubectl apply -f ops/k8s/base/namespace.yaml

# Apply security policies
echo "🔒 Applying security policies..."
kubectl -n $NAMESPACE apply -f ops/k8s/security/limitrange.yaml || true
kubectl -n $NAMESPACE apply -f ops/k8s/security/resourcequota.yaml || true

# Apply ConfigMap
echo "⚙️ Applying configuration..."
kubectl -n $NAMESPACE apply -f ops/k8s/base/configmap.yaml

# Apply RBAC and Service Accounts
echo "👤 Setting up service accounts..."
kubectl -n $NAMESPACE apply -f ops/k8s/iam/wif-workload-identity.yaml || true

# Apply Services
echo "🌐 Creating services..."
kubectl -n $NAMESPACE apply -f ops/k8s/base/service.yaml

# Apply Ingress (with managed certificates for GKE)
echo "🔗 Setting up ingress..."
kubectl -n $NAMESPACE apply -f ops/k8s/base/ingress.yaml

# Apply HPA
echo "📈 Setting up autoscaling..."
kubectl -n $NAMESPACE apply -f ops/k8s/base/hpa.yaml

# Apply Network Policies
echo "🛡️ Applying network policies..."
kubectl -n $NAMESPACE apply -f ops/k8s/base/networkpolicy.yaml

# Set up backup CronJob for production
if [[ "$NAMESPACE" == "prod" ]]; then
    echo "💾 Setting up production backup..."
    kubectl -n $NAMESPACE apply -f ops/k8s/cron/mongo-backup-cronjob.yaml
fi

# Wait for managed certificate to be ready (if GKE)
if kubectl get managedcertificate -n $NAMESPACE >/dev/null 2>&1; then
    echo "🔐 Waiting for managed certificate to be ready..."
    kubectl -n $NAMESPACE wait --for=condition=Active managedcertificate --all --timeout=600s || echo "⚠️ Certificate may take up to 15 minutes to provision"
fi

echo "✅ Bootstrap complete for namespace: $NAMESPACE"

# Display useful information
echo ""
echo "📋 Next steps:"
echo "1. Create secrets: ./ops/scripts/create-secrets.sh $NAMESPACE"
echo "2. Deploy application: helm upgrade --install aislemarts ops/helm/aislemarts -n $NAMESPACE"
echo "3. Check status: kubectl -n $NAMESPACE get all"

# Show current status
echo ""
echo "📊 Current status:"
kubectl -n $NAMESPACE get pods,svc,ingress,hpa --show-labels=false || true