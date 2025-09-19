#!/usr/bin/env bash
set -euo pipefail

# AisleMarts cert-manager Setup Script
# Usage: ./setup.sh [install|configure|status|uninstall]

PROJECT_ID=${PROJECT_ID:-aislemarts-prod}
DNS_ZONE_NAME=${DNS_ZONE_NAME:-aislemarts-zone}
GSA_NAME="cert-manager-dns01-solver"
KSA_NAMESPACE="cert-manager"
KSA_NAME="cert-manager-dns01-solver"

echo "🔐 AisleMarts cert-manager Setup"
echo "Project: $PROJECT_ID"
echo "DNS Zone: $DNS_ZONE_NAME"

case "${1:-install}" in
  install)
    echo "Installing cert-manager..."
    
    # Create namespace
    kubectl create namespace cert-manager --dry-run=client -o yaml | kubectl apply -f -
    
    # Add Jetstack Helm repository
    helm repo add jetstack https://charts.jetstack.io
    helm repo update
    
    # Install cert-manager with CRDs
    helm upgrade --install cert-manager jetstack/cert-manager \
      --namespace cert-manager \
      --version v1.13.3 \
      --set installCRDs=true \
      --set prometheus.enabled=true \
      --set webhook.timeoutSeconds=4
    
    echo "✅ cert-manager installed successfully"
    echo ""
    echo "Next: Run './setup.sh configure' to set up Google Cloud DNS integration"
    ;;
    
  configure)
    echo "Configuring Google Cloud DNS integration..."
    
    # Create Google Service Account for DNS challenges
    if ! gcloud iam service-accounts describe ${GSA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com --project=$PROJECT_ID >/dev/null 2>&1; then
      echo "Creating Google Service Account: $GSA_NAME"
      gcloud iam service-accounts create $GSA_NAME \
        --display-name="cert-manager DNS01 solver" \
        --description="Service account for cert-manager to perform DNS01 challenges via Cloud DNS" \
        --project=$PROJECT_ID
    else
      echo "Google Service Account $GSA_NAME already exists"
    fi
    
    # Grant DNS admin role
    gcloud projects add-iam-policy-binding $PROJECT_ID \
      --member="serviceAccount:${GSA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
      --role="roles/dns.admin"
    
    # Create Kubernetes Service Account
    kubectl -n $KSA_NAMESPACE create serviceaccount $KSA_NAME --dry-run=client -o yaml | kubectl apply -f -
    
    # Enable Workload Identity binding
    gcloud iam service-accounts add-iam-policy-binding \
      ${GSA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com \
      --role roles/iam.workloadIdentityUser \
      --member "serviceAccount:${PROJECT_ID}.svc.id.goog[${KSA_NAMESPACE}/${KSA_NAME}]" \
      --project=$PROJECT_ID
    
    # Annotate Kubernetes Service Account for Workload Identity
    kubectl -n $KSA_NAMESPACE annotate serviceaccount $KSA_NAME \
      iam.gke.io/gcp-service-account=${GSA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com \
      --overwrite
    
    # Alternative: Create service account key (if not using Workload Identity)
    echo "Creating service account key for DNS01 challenges..."
    gcloud iam service-accounts keys create /tmp/dns01-solver-key.json \
      --iam-account=${GSA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com \
      --project=$PROJECT_ID
    
    # Create Kubernetes secret with service account key
    kubectl -n cert-manager create secret generic clouddns-dns01-solver-svc-acct \
      --from-file=key.json=/tmp/dns01-solver-key.json \
      --dry-run=client -o yaml | kubectl apply -f -
    
    # Clean up temporary key file
    rm -f /tmp/dns01-solver-key.json
    
    # Apply ClusterIssuers
    echo "Applying ClusterIssuers..."
    kubectl apply -f ops/cert-manager/clusterissuers.yaml
    
    echo "✅ cert-manager configured successfully"
    echo ""
    echo "📋 ClusterIssuers created:"
    echo "  - letsencrypt-staging (for testing)"
    echo "  - letsencrypt-prod (for production)"
    echo ""
    echo "🎯 Next steps:"
    echo "1. Wait for ClusterIssuers to be ready: kubectl get clusterissuer"
    echo "2. Update your Ingress resources to use cert-manager"
    echo "3. Test certificate issuance with staging first"
    ;;
    
  status)
    echo "📊 cert-manager Status:"
    echo ""
    echo "🏃 Pods:"
    kubectl -n cert-manager get pods
    echo ""
    echo "🔐 ClusterIssuers:"
    kubectl get clusterissuer -o wide
    echo ""
    echo "📜 Certificates:"
    kubectl get certificates --all-namespaces
    echo ""
    echo "🎫 Certificate Requests:"
    kubectl get certificaterequests --all-namespaces
    echo ""
    echo "🧩 Challenges (if any active):"
    kubectl get challenges --all-namespaces || echo "No active challenges"
    ;;
    
  test)
    echo "🧪 Testing certificate issuance..."
    
    # Create a test certificate
    cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: test-certificate
  namespace: default
spec:
  secretName: test-certificate-tls
  issuerRef:
    name: letsencrypt-staging
    kind: ClusterIssuer
  dnsNames:
  - test.aislemarts.com
EOF
    
    echo "Test certificate created. Monitor with:"
    echo "kubectl describe certificate test-certificate"
    echo "kubectl get certificaterequest"
    echo ""
    echo "To clean up: kubectl delete certificate test-certificate"
    ;;
    
  uninstall)
    echo "Uninstalling cert-manager..."
    
    # Delete all certificates first
    kubectl delete certificates --all --all-namespaces || true
    kubectl delete clusterissuers --all || true
    
    # Uninstall Helm chart
    helm uninstall cert-manager --namespace cert-manager || true
    
    # Delete CRDs
    kubectl delete crd certificates.cert-manager.io || true
    kubectl delete crd certificaterequests.cert-manager.io || true
    kubectl delete crd challenges.acme.cert-manager.io || true
    kubectl delete crd clusterissuers.cert-manager.io || true
    kubectl delete crd issuers.cert-manager.io || true
    kubectl delete crd orders.acme.cert-manager.io || true
    
    # Delete namespace
    kubectl delete namespace cert-manager || true
    
    # Clean up Google Cloud resources
    gcloud projects remove-iam-policy-binding $PROJECT_ID \
      --member="serviceAccount:${GSA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
      --role="roles/dns.admin" || true
    
    gcloud iam service-accounts delete ${GSA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com \
      --project=$PROJECT_ID --quiet || true
    
    echo "✅ cert-manager uninstalled"
    ;;
    
  *)
    echo "Usage: $0 [install|configure|status|test|uninstall]"
    echo ""
    echo "Commands:"
    echo "  install    - Install cert-manager via Helm"
    echo "  configure  - Set up Google Cloud DNS integration"
    echo "  status     - Show cert-manager status and resources"
    echo "  test       - Create a test certificate for validation"
    echo "  uninstall  - Remove cert-manager and clean up resources"
    exit 1
    ;;
esac