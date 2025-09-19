#!/usr/bin/env bash
set -euo pipefail

# AisleMarts Secrets Creation Script
# Usage: ./create-secrets.sh [namespace]

NAMESPACE=${1:-staging}

echo "🔐 Creating secrets for AisleMarts in namespace: $NAMESPACE"

# Check required environment variables
required_vars=(
    "MONGO_URI"
    "JWT_SECRET"
    "STRIPE_SECRET_KEY"
)

optional_vars=(
    "EMERGENT_LLM_KEY"
    "OPENAI_API_KEY"
    "S3_BACKUP_BUCKET"
    "AWS_REGION"
)

# Validate required variables
for var in "${required_vars[@]}"; do
    if [[ -z "${!var:-}" ]]; then
        echo "❌ Error: Required environment variable $var is not set"
        echo "Please set it and try again:"
        echo "export $var='your-value'"
        exit 1
    fi
done

# Build kubectl command
kubectl_cmd="kubectl -n $NAMESPACE create secret generic aislemarts-secrets"

# Add required secrets
for var in "${required_vars[@]}"; do
    kubectl_cmd="$kubectl_cmd --from-literal=$var=\"${!var}\""
done

# Add optional secrets if they exist
for var in "${optional_vars[@]}"; do
    if [[ -n "${!var:-}" ]]; then
        kubectl_cmd="$kubectl_cmd --from-literal=$var=\"${!var}\""
        echo "✅ Including optional secret: $var"
    else
        echo "⚠️ Optional secret not set: $var"
    fi
done

# Complete the command
kubectl_cmd="$kubectl_cmd --dry-run=client -o yaml"

echo "🔄 Creating/updating secrets..."

# Execute the command and apply
eval "$kubectl_cmd" | kubectl apply -f -

echo "✅ Secrets created/updated successfully in namespace: $NAMESPACE"

# Verify secrets were created
echo "📋 Verifying secrets..."
kubectl -n $NAMESPACE get secret aislemarts-secrets -o jsonpath='{.data}' | jq -r 'keys[]' 2>/dev/null || echo "Secret keys: $(kubectl -n $NAMESPACE get secret aislemarts-secrets -o jsonpath='{.data}' | jq -r 'keys | join(", ")')"

echo ""
echo "🎯 Next steps:"
echo "1. Deploy application: helm upgrade --install aislemarts ops/helm/aislemarts -n $NAMESPACE"
echo "2. Check deployment: kubectl -n $NAMESPACE rollout status deployment/aislemarts-backend"