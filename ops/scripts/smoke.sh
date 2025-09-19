#!/usr/bin/env bash
set -euo pipefail

# AisleMarts Smoke Test Script
# Usage: ./smoke.sh [base_url] [timeout]

BASE_URL=${1:-https://staging.AisleMarts.com}
TIMEOUT=${2:-30}

echo "🧪 Running AisleMarts smoke tests against: $BASE_URL"
echo "⏱️ Timeout: ${TIMEOUT}s"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

# Helper functions
pass() {
    echo -e "${GREEN}✅ $1${NC}"
    ((TESTS_PASSED++))
}

fail() {
    echo -e "${RED}❌ $1${NC}"
    ((TESTS_FAILED++))
}

warn() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

test_endpoint() {
    local endpoint=$1
    local description=$2
    local expected_status=${3:-200}
    
    echo -n "Testing $description... "
    
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" --max-time $TIMEOUT "$BASE_URL$endpoint" 2>/dev/null || echo "HTTPSTATUS:000")
    status=$(echo "$response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
    body=$(echo "$response" | sed -E 's/HTTPSTATUS:[0-9]*$//')
    
    if [[ "$status" == "$expected_status" ]]; then
        pass "$description (HTTP $status)"
        return 0
    else
        fail "$description (HTTP $status, expected $expected_status)"
        return 1
    fi
}

test_json_endpoint() {
    local endpoint=$1
    local description=$2
    local json_path=$3
    local expected_value=$4
    
    echo -n "Testing $description... "
    
    response=$(curl -s --max-time $TIMEOUT "$BASE_URL$endpoint" 2>/dev/null || echo "{}")
    
    if command -v jq >/dev/null 2>&1; then
        actual_value=$(echo "$response" | jq -r "$json_path" 2>/dev/null || echo "null")
        if [[ "$actual_value" == "$expected_value" ]]; then
            pass "$description ($json_path = $actual_value)"
            return 0
        else
            fail "$description ($json_path = $actual_value, expected $expected_value)"
            echo "Response: $response"
            return 1
        fi
    else
        warn "$description (jq not available, skipping JSON validation)"
        return 0
    fi
}

echo ""
echo "🏥 Health and Infrastructure Tests"
echo "=================================="

# Basic connectivity
test_endpoint "/health" "Health check"

# Metrics endpoint (may require authentication)
if test_endpoint "/metrics" "Metrics endpoint"; then
    echo -n "Checking metrics format... "
    metrics_response=$(curl -s --max-time $TIMEOUT "$BASE_URL/metrics" 2>/dev/null || echo "")
    if echo "$metrics_response" | grep -q "http_requests_total"; then
        pass "Metrics format valid"
    else
        fail "Metrics format invalid or missing expected metrics"
    fi
fi

echo ""
echo "🛒 API Functionality Tests"
echo "=========================="

# Products API
test_endpoint "/api/products/collections" "Products collections"

# Specific product collection
if test_endpoint "/api/products/collections?tag=luxury" "Luxury products"; then
    test_json_endpoint "/api/products/collections?tag=luxury" "Luxury products count" "length" "5"
fi

# Cart API (basic endpoint check)
test_endpoint "/api/cart" "Cart API" "200"

echo ""
echo "🤖 AI Features Tests"
echo "==================="

# Voice command API (POST test)
echo -n "Testing AI voice command... "
voice_response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{"text":"show luxury items"}' \
    --max-time $TIMEOUT \
    "$BASE_URL/api/ai/voice-command" 2>/dev/null || echo '{"error":"failed"}')

if command -v jq >/dev/null 2>&1; then
    action_type=$(echo "$voice_response" | jq -r '.action.type // "null"' 2>/dev/null)
    if [[ "$action_type" != "null" && "$action_type" != "" ]]; then
        pass "AI voice command (action type: $action_type)"
    else
        fail "AI voice command (no valid action returned)"
        echo "Response: $voice_response"
    fi
else
    if echo "$voice_response" | grep -q "action"; then
        pass "AI voice command (action found in response)"
    else
        fail "AI voice command (no action in response)"
    fi
fi

# AI recommendations
test_endpoint "/api/ai/recommendations" "AI recommendations"

echo ""
echo "💳 Payment Integration Tests"
echo "============================"

# Stripe webhook endpoint (should be accessible)
test_endpoint "/api/payments/stripe/webhook" "Stripe webhook endpoint" "405"

echo ""
echo "📊 Business API Tests"
echo "===================="

# Orders API
test_endpoint "/api/orders" "Orders API"

# Analytics (may require authentication)
test_endpoint "/api/analytics/summary" "Analytics summary" "200"

echo ""
echo "🎯 Performance Tests"
echo "==================="

# Response time test
echo -n "Testing response time... "
start_time=$(date +%s%N)
curl -s --max-time $TIMEOUT "$BASE_URL/health" > /dev/null 2>&1
end_time=$(date +%s%N)
response_time=$(( (end_time - start_time) / 1000000 ))

if [[ $response_time -lt 1000 ]]; then
    pass "Response time (${response_time}ms < 1000ms)"
elif [[ $response_time -lt 2000 ]]; then
    warn "Response time (${response_time}ms, acceptable but could be better)"
else
    fail "Response time (${response_time}ms > 2000ms, too slow)"
fi

echo ""
echo "📈 Summary"
echo "=========="
echo "Tests passed: $TESTS_PASSED"
echo "Tests failed: $TESTS_FAILED"
echo "Total tests: $((TESTS_PASSED + TESTS_FAILED))"

if [[ $TESTS_FAILED -eq 0 ]]; then
    echo -e "${GREEN}🎉 All tests passed! AisleMarts is running smoothly.${NC}"
    exit 0
else
    echo -e "${RED}⚠️ Some tests failed. Please check the issues above.${NC}"
    exit 1
fi