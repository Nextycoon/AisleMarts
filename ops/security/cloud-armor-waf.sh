#!/usr/bin/env bash
set -euo pipefail

# AisleMarts Cloud Armor WAF Security Policy Setup
# Usage: ./cloud-armor-waf.sh [create|delete|status]

POLICY_NAME="aislemarts-waf"
PROJECT_ID=${PROJECT_ID:-aislemarts-prod}

echo "🛡️ AisleMarts Cloud Armor WAF Management"
echo "Policy: $POLICY_NAME"
echo "Project: $PROJECT_ID"

case "${1:-create}" in
  create)
    echo "Creating Cloud Armor WAF security policy..."
    
    # Create the base security policy
    gcloud compute security-policies create $POLICY_NAME \
      --description="AisleMarts Enterprise WAF - L7 DDoS and Application Protection" \
      --project=$PROJECT_ID

    # Rule 1000: Block high-risk CVE signatures (OWASP CRS)
    echo "Adding OWASP preconfigured WAF rules..."
    gcloud compute security-policies rules create 1000 \
      --security-policy=$POLICY_NAME \
      --description="Block OWASP Top 10 - SQL Injection, XSS, LFI, RFI, RCE" \
      --expression="evaluatePreconfiguredWaf('sqli-v33-stable', {'sensitivity':1}) || evaluatePreconfiguredWaf('xss-v33-stable', {'sensitivity':1}) || evaluatePreconfiguredWaf('lfi-v33-stable', {'sensitivity':1}) || evaluatePreconfiguredWaf('rfi-v33-stable', {'sensitivity':1}) || evaluatePreconfiguredWaf('rce-v33-stable', {'sensitivity':1})" \
      --action=deny-403 \
      --project=$PROJECT_ID

    # Rule 1100: Rate limiting per IP
    echo "Adding rate limiting rules..."
    gcloud compute security-policies rules create 1100 \
      --security-policy=$POLICY_NAME \
      --description="Rate limit: max 600 requests/minute per IP, ban for 10 minutes" \
      --expression="true" \
      --action=rate-based-ban \
      --rate-limit-threshold-count=600 \
      --rate-limit-threshold-interval-sec=60 \
      --conform-action=allow \
      --exceed-action=deny-429 \
      --ban-duration-sec=600 \
      --enforce-on-key=IP \
      --project=$PROJECT_ID

    # Rule 1200: Block common attack patterns
    echo "Adding threat intelligence rules..."
    gcloud compute security-policies rules create 1200 \
      --security-policy=$POLICY_NAME \
      --description="Block common bot patterns and scanners" \
      --expression="request.headers['user-agent'].matches('(?i)(bot|crawler|spider|scraper|curl|wget)') && !request.headers['user-agent'].matches('(?i)(googlebot|bingbot|slurp)')" \
      --action=deny-403 \
      --project=$PROJECT_ID

    # Rule 1300: Geographic restrictions (optional - customize as needed)
    echo "Adding geographic access controls..."
    gcloud compute security-policies rules create 1300 \
      --security-policy=$POLICY_NAME \
      --description="Allow primary markets - adjust countries as needed" \
      --expression="origin.region_code == 'US' || origin.region_code == 'CA' || origin.region_code == 'TR' || origin.region_code == 'DE' || origin.region_code == 'GB' || origin.region_code == 'AU'" \
      --action=allow \
      --project=$PROJECT_ID

    # Rule 1400: Block suspicious file extensions
    echo "Adding file extension protection..."
    gcloud compute security-policies rules create 1400 \
      --security-policy=$POLICY_NAME \
      --description="Block access to sensitive file extensions" \
      --expression="request.path.matches('.*\\.(env|log|bak|sql|config|ini|conf)$')" \
      --action=deny-403 \
      --project=$PROJECT_ID

    echo "✅ Cloud Armor WAF policy created successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Apply to Kubernetes Ingress:"
    echo "   kubectl -n prod patch ingress aislemarts-ing --type=json -p='[{\"op\":\"add\",\"path\":\"/metadata/annotations/networking.gke.io~1security-policy\",\"value\":\"aislemarts-waf\"}]'"
    echo "2. Apply to staging:"
    echo "   kubectl -n staging patch ingress aislemarts-ing --type=json -p='[{\"op\":\"add\",\"path\":\"/metadata/annotations/networking.gke.io~1security-policy\",\"value\":\"aislemarts-waf\"}]'"
    echo "3. Monitor via Cloud Console: https://console.cloud.google.com/net-security/securitypolicies/details/aislemarts-waf"
    ;;

  delete)
    echo "Deleting Cloud Armor WAF security policy..."
    gcloud compute security-policies delete $POLICY_NAME --quiet --project=$PROJECT_ID
    echo "✅ WAF policy deleted"
    ;;

  status)
    echo "📊 Cloud Armor WAF Status:"
    gcloud compute security-policies describe $POLICY_NAME --project=$PROJECT_ID --format="table(
      name,
      description,
      rules.priority,
      rules.description,
      rules.action
    )"
    ;;

  rules)
    echo "📋 WAF Rules Detail:"
    gcloud compute security-policies describe $POLICY_NAME --project=$PROJECT_ID --format="yaml"
    ;;

  *)
    echo "Usage: $0 [create|delete|status|rules]"
    echo ""
    echo "Commands:"
    echo "  create  - Create the WAF security policy with all rules"
    echo "  delete  - Delete the WAF security policy"
    echo "  status  - Show current policy status"
    echo "  rules   - Show detailed rules configuration"
    exit 1
    ;;
esac