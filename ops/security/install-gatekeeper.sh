#!/usr/bin/env bash
set -euo pipefail

# AisleMarts OPA Gatekeeper Installation and Management
# Usage: ./install-gatekeeper.sh [install|policies|status|uninstall]

GATEKEEPER_VERSION="v3.14.0"
NAMESPACE="gatekeeper-system"

echo "🛡️ AisleMarts OPA Gatekeeper Management"
echo "Version: $GATEKEEPER_VERSION"

case "${1:-install}" in
  install)
    echo "Installing OPA Gatekeeper..."
    
    # Install Gatekeeper
    kubectl apply -f https://raw.githubusercontent.com/open-policy-agent/gatekeeper/release-3.14/deploy/gatekeeper.yaml
    
    # Wait for Gatekeeper to be ready
    echo "Waiting for Gatekeeper to be ready..."
    kubectl -n gatekeeper-system wait --for=condition=Ready pod -l gatekeeper.sh/operation=webhook --timeout=120s
    kubectl -n gatekeeper-system wait --for=condition=Ready pod -l gatekeeper.sh/operation=audit --timeout=120s
    kubectl -n gatekeeper-system wait --for=condition=Ready pod -l control-plane=controller-manager --timeout=120s
    
    # Enable mutation (optional but recommended)
    echo "Enabling mutation feature..."
    kubectl patch configmap config -n gatekeeper-system --type merge -p '{"data":{"mutation":"true"}}'
    
    # Create namespace labels for policy targeting
    kubectl label namespace prod environment=production --overwrite
    kubectl label namespace staging environment=staging --overwrite
    kubectl label namespace kube-system gatekeeper.sh/exempt=true --overwrite
    kubectl label namespace gatekeeper-system gatekeeper.sh/exempt=true --overwrite
    kubectl label namespace cert-manager gatekeeper.sh/exempt=true --overwrite
    
    echo "✅ OPA Gatekeeper installed successfully"
    echo ""
    echo "Next: Run './install-gatekeeper.sh policies' to apply security policies"
    ;;
    
  policies)
    echo "Applying AisleMarts security policies..."
    
    # Apply constraint templates first
    kubectl apply -f ops/security/gatekeeper-policies.yaml
    
    # Wait for templates to be established
    echo "Waiting for constraint templates to be ready..."
    sleep 10
    
    # Check template status
    templates=(
      "k8srequireresources"
      "k8snolatestproduction"
      "k8scontainersecurity"
      "k8sallowedrepos"
      "k8srequiredlabels"
      "k8ssecureingress"
      "k8spodsecuritystandards"
    )
    
    for template in "${templates[@]}"; do
      echo "Checking template: $template"
      kubectl wait --for=condition=Established constrainttemplate/$template --timeout=60s
    done
    
    echo "✅ Security policies applied successfully"
    echo ""
    echo "📋 Policy Summary:"
    echo "  ✅ Resource requests/limits required"
    echo "  ✅ No :latest tags in production"
    echo "  ✅ Container security standards enforced"
    echo "  ✅ Only approved image registries allowed"
    echo "  ✅ Required labels enforced"
    echo "  ✅ Secure Ingress requirements"
    echo "  ✅ Pod Security Standards (restricted)"
    ;;
    
  status)
    echo "📊 OPA Gatekeeper Status:"
    echo ""
    echo "🏃 Gatekeeper Pods:"
    kubectl -n gatekeeper-system get pods
    echo ""
    echo "📋 Constraint Templates:"
    kubectl get constrainttemplates -o custom-columns="NAME:.metadata.name,CREATED:.metadata.creationTimestamp"
    echo ""
    echo "🔒 Active Constraints:"
    kubectl get constraints --all-namespaces -o custom-columns="NAMESPACE:.metadata.namespace,NAME:.metadata.name,KIND:.kind,ENFORCEMENT:.spec.enforcementAction"
    echo ""
    echo "⚠️ Recent Violations (last 10):"
    kubectl get events --all-namespaces --field-selector reason=ConstraintViolation --sort-by='.lastTimestamp' | tail -10
    ;;
    
  violations)
    echo "🚨 Policy Violations Report:"
    echo ""
    
    # Get violations from each constraint type
    constraints=$(kubectl get constraints --all-namespaces -o jsonpath='{.items[*].metadata.name}')
    
    for constraint in $constraints; do
      violations=$(kubectl get constraints --all-namespaces -o jsonpath="{.items[?(@.metadata.name=='$constraint')].status.violations[*].message}" 2>/dev/null || echo "")
      if [[ -n "$violations" ]]; then
        echo "📋 Constraint: $constraint"
        echo "$violations" | tr ' ' '\n' | sed 's/^/  - /'
        echo ""
      fi
    done
    
    # Get recent violation events
    echo "📅 Recent Violation Events:"
    kubectl get events --all-namespaces \
      --field-selector reason=ConstraintViolation \
      --sort-by='.lastTimestamp' \
      -o custom-columns="TIME:.lastTimestamp,NAMESPACE:.namespace,OBJECT:.involvedObject.name,MESSAGE:.message" \
      | tail -20
    ;;
    
  test)
    echo "🧪 Testing policy enforcement..."
    
    # Test 1: Try to create a pod without resource limits
    echo "Test 1: Pod without resource limits (should be blocked)"
    cat <<EOF | kubectl apply --dry-run=server -f - || echo "✅ Correctly blocked"
apiVersion: v1
kind: Pod
metadata:
  name: test-no-resources
  namespace: default
spec:
  containers:
  - name: test
    image: nginx
EOF
    
    # Test 2: Try to create a pod with :latest tag in prod
    echo ""
    echo "Test 2: Pod with :latest tag in production (should be blocked)"
    cat <<EOF | kubectl apply --dry-run=server -f - || echo "✅ Correctly blocked"
apiVersion: v1
kind: Pod
metadata:
  name: test-latest-tag
  namespace: prod
spec:
  containers:
  - name: test
    image: nginx:latest
    resources:
      requests:
        cpu: 100m
        memory: 128Mi
      limits:
        cpu: 200m
        memory: 256Mi
EOF
    
    # Test 3: Try to create a valid pod (should succeed)
    echo ""
    echo "Test 3: Valid pod (should be allowed)"
    cat <<EOF | kubectl apply --dry-run=server -f -
apiVersion: v1
kind: Pod
metadata:
  name: test-valid-pod
  namespace: staging
  labels:
    app.kubernetes.io/name: test
    app.kubernetes.io/version: v1.0.0
    environment: staging
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    seccompProfile:
      type: RuntimeDefault
  containers:
  - name: test
    image: us-central1-docker.pkg.dev/aislemarts-prod/aislemarts/backend:v1.0.0
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop:
        - ALL
    resources:
      requests:
        cpu: 100m
        memory: 128Mi
      limits:
        cpu: 200m
        memory: 256Mi
EOF
    echo "✅ Valid pod allowed"
    ;;
    
  exempt)
    namespace=${2:-}
    if [[ -z "$namespace" ]]; then
      echo "Usage: $0 exempt <namespace>"
      echo "Example: $0 exempt monitoring"
      exit 1
    fi
    
    echo "Adding gatekeeper exemption for namespace: $namespace"
    kubectl label namespace "$namespace" gatekeeper.sh/exempt=true --overwrite
    echo "✅ Namespace $namespace exempted from Gatekeeper policies"
    ;;
    
  uninstall)
    echo "Uninstalling OPA Gatekeeper..."
    
    # Delete all constraints first
    echo "Removing constraints..."
    kubectl delete constraints --all --all-namespaces || true
    
    # Delete constraint templates
    echo "Removing constraint templates..."
    kubectl delete constrainttemplates --all || true
    
    # Uninstall Gatekeeper
    echo "Removing Gatekeeper..."
    kubectl delete -f https://raw.githubusercontent.com/open-policy-agent/gatekeeper/release-3.14/deploy/gatekeeper.yaml || true
    
    # Clean up webhook configurations (if stuck)
    kubectl delete validatingwebhookconfiguration gatekeeper-validating-webhook-configuration || true
    kubectl delete mutatingwebhookconfiguration gatekeeper-mutating-webhook-configuration || true
    
    echo "✅ OPA Gatekeeper uninstalled"
    ;;
    
  *)
    echo "Usage: $0 [install|policies|status|violations|test|exempt|uninstall]"
    echo ""
    echo "Commands:"
    echo "  install     - Install OPA Gatekeeper"
    echo "  policies    - Apply AisleMarts security policies"
    echo "  status      - Show Gatekeeper and policy status"
    echo "  violations  - Show policy violation report"
    echo "  test        - Test policy enforcement"
    echo "  exempt      - Exempt a namespace from policies"
    echo "  uninstall   - Remove Gatekeeper and all policies"
    echo ""
    echo "Examples:"
    echo "  $0 install          # Install Gatekeeper"
    echo "  $0 policies         # Apply security policies"
    echo "  $0 status          # Check status"
    echo "  $0 exempt monitoring # Exempt monitoring namespace"
    exit 1
    ;;
esac