# Security Policy

## Reporting Security Vulnerabilities

We take the security of AisleMarts seriously. If you discover a security vulnerability, please follow these steps:

### Reporting Process

1. **Do NOT** open a public issue for security vulnerabilities
2. Email security concerns privately to the repository owner
3. Include detailed information about the vulnerability
4. Allow reasonable time for the issue to be addressed before disclosure

### Security Measures

This repository implements several security measures:

#### Branch Protection
- **Main branch**: Fully protected with comprehensive rules
- **Required reviews**: Minimum 1 approval + code owner review
- **Status checks**: All CI tests and security scans must pass
- **Signed commits**: Required for all changes
- **Linear history**: Enforced to maintain clean commit history

#### Automated Security Scanning
- **CodeQL**: Automated code analysis for security vulnerabilities
- **Dependabot**: Automated dependency vulnerability scanning and updates
- **CI/CD Security**: All changes validated through automated testing

#### Access Controls
- **Force push protection**: Blocked on main branch
- **Direct push protection**: All changes must go through pull requests
- **Limited bypass access**: Only repository admins and approved GitHub Apps

### Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| main    | ✅ Active support |
| feature branches | ❌ Not supported |

### Security Best Practices

When contributing to this repository:

1. **Never commit secrets** or credentials
2. **Use signed commits** for all changes
3. **Keep dependencies updated** via Dependabot PRs
4. **Follow secure coding practices** in all code changes
5. **Review security scan results** before merging

### Incident Response

In case of a security incident:

1. **Immediate containment**: Affected systems will be isolated
2. **Assessment**: Security team will evaluate impact and scope
3. **Remediation**: Fixes will be prioritized and implemented
4. **Communication**: Stakeholders will be notified as appropriate
5. **Post-incident review**: Process improvements will be identified

## Contact

For security-related questions or concerns, please contact the repository maintainers through appropriate private channels.

---

This security policy is reviewed regularly and updated as needed to reflect current best practices and threats.