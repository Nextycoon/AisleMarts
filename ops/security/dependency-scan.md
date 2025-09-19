# AisleMarts Security & Dependency Scanning

## Overview

This document outlines the security scanning and dependency management practices for AisleMarts, ensuring our application remains secure against known vulnerabilities.

## 🔍 Dependency Scanning Tools

### Backend (Python)
- **pip-audit**: Scans Python dependencies for known vulnerabilities
- **Bandit**: Static security analysis for Python code
- **Safety**: Checks Python dependencies against security advisory database

### Frontend (Node.js/React Native)
- **npm audit**: Built-in npm vulnerability scanner
- **Snyk**: Comprehensive vulnerability scanning
- **ESLint Security Plugin**: Static analysis for JavaScript security issues

### Container Images
- **Trivy**: Vulnerability scanner for container images
- **Grype**: Alternative container vulnerability scanner

## 🛠️ Implementation in CI/CD

Our GitHub Actions pipeline includes automated security scanning at multiple stages:

### Build Stage Security Checks

```yaml
- name: Backend Security Scan
  run: |
    # Install security tools
    pip install pip-audit bandit safety
    
    # Scan dependencies
    pip-audit -r backend/requirements.txt --format=json --output=pip-audit.json
    
    # Static code analysis
    bandit -r backend/ -f json -o bandit-report.json
    
    # Safety check
    safety check -r backend/requirements.txt --json --output safety-report.json

- name: Frontend Security Scan
  run: |
    cd frontend
    
    # npm audit
    npm audit --audit-level=high --json > npm-audit.json
    
    # Additional Snyk scan (if token available)
    if [ ! -z "$SNYK_TOKEN" ]; then
      npx snyk test --json > snyk-report.json
    fi

- name: Container Image Scan
  uses: aquasecurity/trivy-action@0.20.0
  with:
    image-ref: ${{ env.IMAGE_BACKEND }}:${{ env.IMAGE_TAG }}
    format: 'sarif'
    output: 'trivy-results.sarif'
    severity: 'CRITICAL,HIGH'
    exit-code: '1'  # Fail build on critical/high vulnerabilities
```

## 📊 Vulnerability Management Process

### 1. Detection
- **Automated**: CI/CD pipeline scans on every commit
- **Scheduled**: Weekly dependency scans on main branch
- **Manual**: Ad-hoc scans before major releases

### 2. Triage & Assessment
- **Critical**: Immediate patching required (within 24h)
- **High**: Patch within 1 week
- **Medium**: Patch within 1 month
- **Low**: Patch with next regular update cycle

### 3. Remediation
1. **Update dependency** to patched version
2. **Apply patches** if available
3. **Replace library** if no fix available
4. **Add workaround** or mitigation controls
5. **Accept risk** if impact is minimal (documented)

### 4. Verification
- **Rescan** after applying fixes
- **Test** application functionality
- **Deploy** to staging first
- **Monitor** for any regressions

## 🔧 Configuration Files

### pip-audit Configuration
Create `.pip-audit.toml` in backend/:

```toml
[tool.pip-audit]
desc = "AisleMarts Backend Security Audit"
format = "json"
output = "pip-audit-report.json"

# Ignore specific vulnerabilities (with justification)
ignore-vulns = [
    # "PYSEC-2024-1234",  # Example: false positive or accepted risk
]

# Only audit production dependencies
index-url = "https://pypi.org/simple"
```

### npm audit Configuration
Add to `frontend/package.json`:

```json
{
  "audit": {
    "level": "high",
    "audit-level": "high",
    "production": true
  }
}
```

### Trivy Configuration
Create `.trivyignore` in repository root:

```yaml
# Ignore specific CVEs with justification
# CVE-2024-1234  # Fixed in next release, workaround implemented
```

## 📋 Security Scanning Checklist

### Pre-Release Security Review
- [ ] All dependencies scanned and vulnerabilities addressed
- [ ] Container images scanned with no critical/high vulnerabilities
- [ ] Static code analysis passed
- [ ] Security headers configured properly
- [ ] Secrets scanning completed (no hardcoded secrets)
- [ ] Authentication and authorization flows reviewed

### Monthly Security Tasks
- [ ] Review and update security scanning tools
- [ ] Analyze security scan reports and trends
- [ ] Update vulnerability databases
- [ ] Review ignored vulnerabilities for relevance
- [ ] Security training for development team

### Quarterly Security Tasks
- [ ] Penetration testing (external)
- [ ] Security architecture review
- [ ] Incident response plan testing
- [ ] Security metrics analysis
- [ ] Third-party security audit

## 🚨 Emergency Response

### Critical Vulnerability Response
1. **Immediate Assessment** (0-2 hours)
   - Verify vulnerability affects our codebase
   - Assess potential impact and exploitability
   - Check if already being exploited

2. **Emergency Patching** (2-24 hours)
   - Create hotfix branch
   - Apply security patch
   - Test critical functionality
   - Deploy to production immediately

3. **Post-Incident** (24-72 hours)
   - Full regression testing
   - Security audit of related components
   - Documentation update
   - Post-mortem analysis

## 📈 Security Metrics & Reporting

### Key Performance Indicators
- **Mean Time to Detect (MTTD)**: Time from vulnerability disclosure to detection
- **Mean Time to Patch (MTTP)**: Time from detection to patch deployment
- **Vulnerability Backlog**: Number of unresolved vulnerabilities by severity
- **False Positive Rate**: Percentage of flagged issues that are false positives

### Monthly Security Report Template
```markdown
# Security Report - [Month Year]

## Summary
- New vulnerabilities detected: X
- Vulnerabilities resolved: X
- Critical vulnerabilities: X (avg resolution time: X hours)
- High vulnerabilities: X (avg resolution time: X days)

## Top Vulnerability Categories
1. Category A (X occurrences)
2. Category B (X occurrences)
3. Category C (X occurrences)

## Actions Taken
- [List of major security improvements]

## Recommendations
- [Security improvements for next month]
```

## 🔒 Secure Development Practices

### Code Review Security Checklist
- [ ] No hardcoded secrets or credentials
- [ ] Input validation implemented
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (output encoding)
- [ ] Authentication checks in place
- [ ] Authorization properly implemented
- [ ] Error messages don't expose sensitive information
- [ ] Logging doesn't capture sensitive data

### Dependency Management Best Practices
1. **Pin versions** in requirements.txt and package.json
2. **Regular updates** but test thoroughly
3. **Minimal dependencies** - only include what's needed
4. **Trusted sources** - use official package repositories
5. **License compliance** - verify licenses are compatible

## 🛡️ Additional Security Tools

### Recommended Tools for Local Development
```bash
# Backend security tools
pip install pip-audit bandit safety pre-commit

# Frontend security tools
npm install -g @snyk/cli eslint-plugin-security

# Git hooks for security
pre-commit install
```

### IDE Security Extensions
- **VS Code**: 
  - Snyk Vulnerability Scanner
  - SonarLint
  - GitLens (for commit history security)
- **PyCharm**: 
  - SonarLint Plugin
  - Security Hotspots

## 📚 Security Resources

### Internal Resources
- **Security Wiki**: [wiki.AisleMarts.com/security](https://wiki.AisleMarts.com/security)
- **Incident Response Plan**: [docs.AisleMarts.com/security/incident-response](https://docs.AisleMarts.com/security/incident-response)
- **Security Training**: Monthly security awareness sessions

### External Resources
- **OWASP Top 10**: Latest web application security risks
- **CVE Database**: [cve.mitre.org](https://cve.mitre.org)
- **Security Advisories**: 
  - [Python Security](https://python-security.org)
  - [Node.js Security](https://nodejs.org/en/security/)
  - [GitHub Advisory Database](https://github.com/advisories)

---

*Last updated: 2024-01 | Version: 1.0 | Owner: Security Team*