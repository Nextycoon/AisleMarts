# Branch Protection Implementation Guide

This guide provides step-by-step instructions for implementing the comprehensive branch protection ruleset for the `main` branch in the AisleMarts repository.

## Overview

The implementation involves:
1. Consolidating existing protection rules into a single ruleset
2. Applying comprehensive protection settings
3. Configuring required status checks
4. Setting up proper bypass access controls

## Prerequisites

- Repository admin access to Nextycoon/AisleMarts
- All required workflows are in place (CI, CodeQL)
- CODEOWNERS file is configured

## Implementation Methods

### Method 1: GitHub Web Interface

#### Step 1: Access Repository Settings
1. Navigate to https://github.com/Nextycoon/AisleMarts
2. Click on **Settings** tab
3. Select **Branches** from the left sidebar

#### Step 2: Review Existing Protection Rules
1. Look for existing rules targeting `main` branch
2. If multiple rules exist (e.g., "Main branch protection" and "main-protection"), identify the most comprehensive one
3. Delete or disable redundant rules, keeping only one active ruleset

#### Step 3: Configure Main Branch Protection Rule

Click **Add rule** or **Edit** existing rule for `main` branch:

**Branch name pattern**: `main`

**Protect matching branches** - Enable all of the following:

1. **Restrict pushes that create files**
   - ✅ Enable

2. **Restrict pushes that update files** 
   - ✅ Enable

3. **Restrict deletions**
   - ✅ Enable

4. **Require a pull request before merging**
   - ✅ Enable
   - Required number of reviewers: `1`
   - ✅ Require review from code owners
   - ✅ Dismiss stale PR approvals when new commits are pushed
   - ✅ Require conversation resolution before merging

5. **Require status checks to pass before merging**
   - ✅ Enable
   - ✅ Require branches to be up to date before merging
   - **Required status checks**:
     - `CI / backend (pull_request)`
     - `CI / mobile (pull_request)` 
     - `CodeQL / Analyze (javascript)`
     - `CodeQL / Analyze (python)`

6. **Require signed commits**
   - ✅ Enable

7. **Require linear history**
   - ✅ Enable

8. **Include administrators**
   - ❌ Disable (allows repository admins to bypass for emergency access)

#### Step 4: Configure Restrictions
Under **Restrict who can push to matching branches**:
- ✅ Enable
- **People and teams**: Leave empty (no individual bypass)
- **Apps**: Add only:
  - `dependabot[bot]`
  - `github-actions[bot]`
  - `vercel[bot]` (if using Vercel for deployment)

#### Step 5: Save Configuration
- Click **Create** or **Save changes**
- Verify the rule appears in the branch protection rules list

### Method 2: GitHub API

Use the following API calls to configure protection programmatically:

#### Update Branch Protection Rule
```bash
curl -X PUT \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.github.com/repos/Nextycoon/AisleMarts/branches/main/protection \
  -d '{
    "required_status_checks": {
      "strict": true,
      "contexts": [
        "CI / backend (pull_request)",
        "CI / mobile (pull_request)",
        "CodeQL / Analyze (javascript)",
        "CodeQL / Analyze (python)"
      ]
    },
    "enforce_admins": false,
    "required_pull_request_reviews": {
      "required_approving_review_count": 1,
      "dismiss_stale_reviews": true,
      "require_code_owner_reviews": true,
      "require_last_push_approval": false
    },
    "restrictions": {
      "users": [],
      "teams": [],
      "apps": ["dependabot", "github-actions", "vercel"]
    },
    "required_linear_history": true,
    "allow_force_pushes": false,
    "allow_deletions": false,
    "block_creations": true,
    "required_conversation_resolution": true,
    "lock_branch": false,
    "allow_fork_syncing": true
  }'
```

#### Enable Signed Commits Requirement
```bash
curl -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.github.com/repos/Nextycoon/AisleMarts/branches/main/protection/required_signatures
```

## Post-Implementation Validation

### Verification Checklist

#### 1. Protection Rule Verification
- [ ] Only one active rule exists for `main` branch
- [ ] Rule targets exactly `main` (not pattern like `main*`)
- [ ] All protection settings are enabled as specified

#### 2. Status Check Verification
- [ ] CI backend check is required
- [ ] CI mobile check is required  
- [ ] CodeQL checks are required for both languages
- [ ] Branches must be up to date before merging

#### 3. Access Control Verification
- [ ] Force pushes are blocked
- [ ] Direct pushes to main are blocked
- [ ] Branch deletion is blocked
- [ ] Only specified apps can bypass restrictions
- [ ] Repository admins can bypass (for emergency access)

#### 4. Pull Request Workflow Testing

Create a test PR to verify:
- [ ] Cannot merge without required approvals
- [ ] Code owner review is requested automatically
- [ ] All status checks must pass
- [ ] Conversations must be resolved
- [ ] Linear history is enforced
- [ ] Signed commits are required

### Common Issues and Solutions

#### Issue: CodeQL Status Checks Not Appearing
**Solution**: 
1. Ensure CodeQL workflow has run at least once
2. Check workflow file syntax and permissions
3. Verify workflow triggers include `pull_request`

#### Issue: Code Owner Reviews Not Required
**Solution**:
1. Verify CODEOWNERS file exists in `.github/CODEOWNERS`
2. Check file syntax and ownership patterns
3. Ensure code owner review option is enabled in protection rule

#### Issue: Apps Cannot Push Despite Bypass
**Solution**:
1. Verify app names match exactly (case-sensitive)
2. Check app has necessary repository permissions
3. Ensure app is properly installed on repository

### Monitoring and Maintenance

#### Regular Review Tasks
- **Monthly**: Review bypass access list for unnecessary permissions
- **Quarterly**: Audit protection rule effectiveness
- **Annually**: Review and update required status checks

#### Metrics to Monitor
- Pull request compliance rate
- Failed status check frequency  
- Bypass usage patterns
- Security scan results

## Rollback Plan

If issues arise after implementation:

1. **Immediate**: Disable specific problematic settings
2. **Temporary**: Reduce required reviewers to 0 (emergency only)
3. **Recovery**: Restore previous protection rule configuration
4. **Investigation**: Review logs and identify root cause

## Support Resources

- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)
- [GitHub API Reference](https://docs.github.com/en/rest/branches/branch-protection)
- [CodeQL Documentation](https://docs.github.com/en/code-security/code-scanning/automatically-scanning-your-code-for-vulnerabilities-and-errors/about-code-scanning-with-codeql)

---

**Important**: Test all changes in a non-production environment first if possible. Always have a rollback plan ready before implementing comprehensive protection rules.