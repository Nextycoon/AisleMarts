# Branch Protection Rules for AisleMarts

## Main Branch Protection Configuration

### Overview
This document defines the comprehensive branch protection rules for the `main` branch according to security best practices. Only one active ruleset should exist for the main branch.

### Protected Branches
- **main**: Fully Protected with Comprehensive Ruleset

### Core Protection Settings

#### Access Restrictions
- **Restrict creations**: ✅ Enabled
- **Restrict updates**: ✅ Enabled  
- **Restrict deletions**: ✅ Enabled
- **Block force pushes**: ✅ Enabled for all users

#### Pull Request Requirements
- **Require pull request before merging**: ✅ Enabled
- **Required approving reviews**: ✅ Minimum 1 approval
- **Require review from Code Owners**: ✅ Enabled
- **Require conversation resolution**: ✅ Enabled
- **Require linear history**: ✅ Enabled

#### Commit Requirements
- **Require signed commits**: ✅ Enabled

#### Status Check Requirements
- **Require status checks to pass**: ✅ Enabled
- **Required status checks**:
  - `CI / backend (pull_request)`: ✅ Required
  - `CI / mobile (pull_request)`: ✅ Required
  - `CodeQL / Analyze`: ✅ Required (High severity or higher, Errors only)

#### Deployment Requirements
- **Require deployments to succeed**: ✅ Enabled (if deployment checks exist)

#### AI and Automation
- **Automatically request Copilot review**: ✅ Enabled
- **Code scanning requirements**: ✅ CodeQL with High+ severity, Errors only

### Bypass Access Control

#### Allowed Bypass Actors
- **Repository Admin**: ✅ Allowed (emergency access only)
- **GitHub Apps**: ✅ Limited to:
  - Vercel (deployment)
  - Dependabot (dependency updates)
  - GitHub Actions (CI/CD workflows)

#### Restricted Bypass
- **Individual users**: ❌ Not allowed (including current user)
- **Teams**: ❌ Not allowed
- **Organization admins**: ❌ Not allowed unless Repository Admin

### Implementation Status

#### Current Status
- [x] Basic branch protection enabled
- [x] CI status checks configured
- [ ] Enhanced protection settings applied
- [ ] Code scanning workflow configured
- [ ] Copilot review automation enabled
- [ ] Bypass list properly configured

#### Required Actions
1. **Consolidate Rulesets**: Remove any overlapping or duplicate protection rules
2. **Apply Enhanced Settings**: Configure all protection settings listed above
3. **Enable Code Scanning**: Set up CodeQL workflow with High+ severity filtering
4. **Configure Bypass List**: Limit to Repository Admin and approved GitHub Apps only
5. **Validate Configuration**: Test with sample PR to ensure all checks work properly

### Validation Checklist

#### Pre-merge Requirements Verification
- [ ] Pull request created and cannot be merged directly
- [ ] At least 1 approval required and obtained
- [ ] Code Owner review completed (if CODEOWNERS file exists)
- [ ] All conversations resolved
- [ ] CI backend tests passing
- [ ] CI mobile tests passing  
- [ ] CodeQL scan completed with no High+ severity errors
- [ ] Commits are signed
- [ ] Linear history maintained (no merge commits)
- [ ] Copilot review requested automatically

#### Protection Verification
- [ ] Force push attempts blocked
- [ ] Direct pushes to main blocked
- [ ] Branch deletion blocked
- [ ] Bypass access limited to authorized actors only

---

**Important**: This configuration represents a comprehensive security-first approach to branch protection. All settings should be applied as a single, consolidated ruleset targeting only the `main` branch.