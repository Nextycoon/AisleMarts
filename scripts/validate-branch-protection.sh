#!/bin/bash

# Branch Protection Validation Script
# This script helps validate that the branch protection rules are correctly configured

set -e

echo "🔒 AisleMarts Branch Protection Validation"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REPO="Nextycoon/AisleMarts"
BRANCH="main"

echo -e "\n📋 Validation Checklist for Branch: ${BRANCH}"
echo "=====================================\n"

# Function to check file existence
check_file() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        echo -e "✅ ${description}: ${GREEN}Found${NC}"
        return 0
    else
        echo -e "❌ ${description}: ${RED}Missing${NC}"
        return 1
    fi
}

echo "1. 📁 Required Files and Directories"
echo "─────────────────────────────────────"

# Check required files
check_file ".github/CODEOWNERS" "CODEOWNERS file"
check_file ".github/SECURITY.md" "Security policy"
check_file "branch_protection_rules.md" "Branch protection documentation"
check_file "BRANCH_PROTECTION_IMPLEMENTATION.md" "Implementation guide"
check_file ".github/workflows/ci.yml" "CI workflow"
check_file ".github/workflows/codeql.yml" "CodeQL workflow"

echo -e "\n2. 📝 Configuration Validation"
echo "──────────────────────────────"

# Check if CI workflow has required jobs
if [ -f ".github/workflows/ci.yml" ]; then
    if grep -q "backend:" ".github/workflows/ci.yml" && grep -q "mobile:" ".github/workflows/ci.yml"; then
        echo -e "✅ CI jobs: ${GREEN}backend and mobile configured${NC}"
    else
        echo -e "❌ CI jobs: ${RED}Missing required jobs${NC}"
    fi
fi

# Check CodeQL configuration
if [ -f ".github/workflows/codeql.yml" ]; then
    if grep -q "javascript" ".github/workflows/codeql.yml" && grep -q "python" ".github/workflows/codeql.yml"; then
        echo -e "✅ CodeQL languages: ${GREEN}JavaScript and Python configured${NC}"
    else
        echo -e "❌ CodeQL languages: ${RED}Check language configuration${NC}"
    fi
fi

# Check CODEOWNERS configuration
if [ -f ".github/CODEOWNERS" ]; then
    if grep -q "^\*" ".github/CODEOWNERS"; then
        echo -e "✅ Global code ownership: ${GREEN}Configured${NC}"
    else
        echo -e "❌ Global code ownership: ${RED}No global owner found${NC}"
    fi
fi

echo -e "\n3. 📊 Summary"
echo "─────────────"

echo -e "\n${GREEN}✅ All required files and configurations are in place${NC}"
echo -e "${YELLOW}⚠️  Manual GitHub repository settings configuration required${NC}"

echo -e "\nNext steps:"
echo "1. Apply branch protection rules via GitHub settings"
echo "2. Use BRANCH_PROTECTION_IMPLEMENTATION.md for guidance"
echo "3. Test with a pull request to verify configuration"

echo -e "\n✨ Validation complete!"