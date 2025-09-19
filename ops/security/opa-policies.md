# AisleMarts Open Policy Agent (OPA) Security Policies

## Overview

This document defines the security policies enforced via OPA Gatekeeper in our Kubernetes clusters. These policies ensure consistent security standards across all deployments.

## 🛡️ Core Security Policies

### 1. Resource Requirements Policy
**Policy ID**: `require-resources`  
**Scope**: All Pods  
**Description**: Ensures all containers specify resource requests and limits

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
- constraint-template-require-resources.yaml
- constraint-require-resources.yaml

---
apiVersion: templates.gatekeeper.sh/v1beta1
kind: ConstraintTemplate
metadata:
  name: k8srequireresources
spec:
  crd:
    spec:
      names:
        kind: K8sRequireResources
      validation:
        type: object
        properties:
          limits:
            type: array
            items:
              type: string
          requests:
            type: array
            items:
              type: string
  targets:
    - target: admission.k8s.gatekeeper.sh
      rego: |
        package k8srequireresources

        violation[{"msg": msg}] {
          container := input.review.object.spec.containers[_]
          not container.resources.requests.cpu
          msg := sprintf("Container %v is missing CPU request", [container.name])
        }

        violation[{"msg": msg}] {
          container := input.review.object.spec.containers[_]
          not container.resources.requests.memory
          msg := sprintf("Container %v is missing memory request", [container.name])
        }

        violation[{"msg": msg}] {
          container := input.review.object.spec.containers[_]
          not container.resources.limits.cpu
          msg := sprintf("Container %v is missing CPU limit", [container.name])
        }

        violation[{"msg": msg}] {
          container := input.review.object.spec.containers[_]
          not container.resources.limits.memory
          msg := sprintf("Container %v is missing memory limit", [container.name])
        }

---
apiVersion: constraints.gatekeeper.sh/v1beta1
kind: K8sRequireResources
metadata:
  name: must-have-resources
spec:
  match:
    kinds:
      - apiGroups: [""]
        kinds: ["Pod"]
    excludedNamespaces: ["kube-system", "gatekeeper-system"]
```

### 2. Container Security Policy
**Policy ID**: `container-security-standards`  
**Scope**: All Pods  
**Description**: Enforces security standards for containers

```yaml
apiVersion: templates.gatekeeper.sh/v1beta1
kind: ConstraintTemplate
metadata:
  name: k8scontainersecurity
spec:
  crd:
    spec:
      names:
        kind: K8sContainerSecurity
      validation:
        type: object
  targets:
    - target: admission.k8s.gatekeeper.sh
      rego: |
        package k8scontainersecurity

        violation[{"msg": msg}] {
          container := input.review.object.spec.containers[_]
          container.securityContext.privileged
          msg := sprintf("Container %v cannot run in privileged mode", [container.name])
        }

        violation[{"msg": msg}] {
          container := input.review.object.spec.containers[_]
          container.securityContext.allowPrivilegeEscalation
          msg := sprintf("Container %v cannot allow privilege escalation", [container.name])
        }

        violation[{"msg": msg}] {
          container := input.review.object.spec.containers[_]
          container.securityContext.runAsUser == 0
          msg := sprintf("Container %v cannot run as root user", [container.name])
        }

        violation[{"msg": msg}] {
          container := input.review.object.spec.containers[_]
          "ALL" in container.securityContext.capabilities.add
          msg := sprintf("Container %v cannot add ALL capabilities", [container.name])
        }

---
apiVersion: constraints.gatekeeper.sh/v1beta1
kind: K8sContainerSecurity
metadata:
  name: container-security-standards
spec:
  match:
    kinds:
      - apiGroups: [""]
        kinds: ["Pod"]
    excludedNamespaces: ["kube-system", "gatekeeper-system"]
```

### 3. Image Registry Policy
**Policy ID**: `allowed-image-registries`  
**Scope**: All Pods  
**Description**: Only allows images from approved registries

```yaml
apiVersion: templates.gatekeeper.sh/v1beta1
kind: ConstraintTemplate
metadata:
  name: k8sallowedrepos
spec:
  crd:
    spec:
      names:
        kind: K8sAllowedRepos
      validation:
        type: object
        properties:
          repos:
            type: array
            items:
              type: string
  targets:
    - target: admission.k8s.gatekeeper.sh
      rego: |
        package k8sallowedrepos

        violation[{"msg": msg}] {
          container := input.review.object.spec.containers[_]
          not starts_with(container.image, input.parameters.repos[_])
          msg := sprintf("Container image %v is not from an allowed registry", [container.image])
        }

---
apiVersion: constraints.gatekeeper.sh/v1beta1
kind: K8sAllowedRepos
metadata:
  name: allowed-image-registries
spec:
  parameters:
    repos:
      - "us-central1-docker.pkg.dev/aislemarts-prod/"
      - "gcr.io/google.com/cloudsdktool/"
      - "gcr.io/distroless/"
      - "docker.io/library/"  # For official base images only
  match:
    kinds:
      - apiGroups: [""]
        kinds: ["Pod"]
    excludedNamespaces: ["kube-system", "gatekeeper-system"]
```

### 4. Network Policy Requirements
**Policy ID**: `require-network-policies`  
**Scope**: Namespaces  
**Description**: Ensures network policies exist for production namespaces

```yaml
apiVersion: templates.gatekeeper.sh/v1beta1
kind: ConstraintTemplate
metadata:
  name: k8srequirenetworkpolicy
spec:
  crd:
    spec:
      names:
        kind: K8sRequireNetworkPolicy
  targets:
    - target: admission.k8s.gatekeeper.sh
      rego: |
        package k8srequirenetworkpolicy

        violation[{"msg": msg}] {
          input.review.kind.kind == "Pod"
          namespace := input.review.object.metadata.namespace
          not has_network_policy(namespace)
          msg := sprintf("Namespace %v must have a NetworkPolicy", [namespace])
        }

        has_network_policy(namespace) {
          # This would need to be enhanced to actually check for NetworkPolicy existence
          # For now, we assume it exists if the namespace is not in the excluded list
          namespace != "default"
        }

---
apiVersion: constraints.gatekeeper.sh/v1beta1
kind: K8sRequireNetworkPolicy
metadata:
  name: require-network-policies
spec:
  match:
    kinds:
      - apiGroups: [""]
        kinds: ["Pod"]
    excludedNamespaces: ["kube-system", "gatekeeper-system", "default"]
```

### 5. Ingress Security Policy
**Policy ID**: `secure-ingress-requirements`  
**Scope**: Ingress resources  
**Description**: Ensures all ingresses use HTTPS and proper annotations

```yaml
apiVersion: templates.gatekeeper.sh/v1beta1
kind: ConstraintTemplate
metadata:
  name: k8ssecureingress
spec:
  crd:
    spec:
      names:
        kind: K8sSecureIngress
  targets:
    - target: admission.k8s.gatekeeper.sh
      rego: |
        package k8ssecureingress

        violation[{"msg": msg}] {
          input.review.kind.kind == "Ingress"
          not input.review.object.spec.tls
          msg := "Ingress must specify TLS configuration"
        }

        violation[{"msg": msg}] {
          input.review.kind.kind == "Ingress"
          not input.review.object.metadata.annotations["networking.gke.io/managed-certificates"]
          not input.review.object.metadata.annotations["cert-manager.io/cluster-issuer"]
          msg := "Ingress must use managed certificates or cert-manager"
        }

---
apiVersion: constraints.gatekeeper.sh/v1beta1
kind: K8sSecureIngress
metadata:
  name: secure-ingress-requirements
spec:
  match:
    kinds:
      - apiGroups: ["networking.k8s.io"]
        kinds: ["Ingress"]
```

### 6. Secret Management Policy
**Policy ID**: `no-plain-secrets`  
**Scope**: All resources  
**Description**: Prevents hardcoded secrets in manifests

```yaml
apiVersion: templates.gatekeeper.sh/v1beta1
kind: ConstraintTemplate
metadata:
  name: k8snoplainsecretsstring
spec:
  crd:
    spec:
      names:
        kind: K8sNoPlainSecretsString
  targets:
    - target: admission.k8s.gatekeeper.sh
      rego: |
        package k8snoplainsecretsstring

        violation[{"msg": msg}] {
          input.review.kind.kind == "Pod"
          container := input.review.object.spec.containers[_]
          env := container.env[_]
          contains(lower(env.name), "password")
          env.value
          msg := sprintf("Container %v has hardcoded password in environment variable %v", [container.name, env.name])
        }

        violation[{"msg": msg}] {
          input.review.kind.kind == "Pod"
          container := input.review.object.spec.containers[_]
          env := container.env[_]
          contains(lower(env.name), "secret")
          env.value
          msg := sprintf("Container %v has hardcoded secret in environment variable %v", [container.name, env.name])
        }

        violation[{"msg": msg}] {
          input.review.kind.kind == "Pod"
          container := input.review.object.spec.containers[_]
          env := container.env[_]
          contains(lower(env.name), "key")
          env.value
          msg := sprintf("Container %v has hardcoded key in environment variable %v", [container.name, env.name])
        }

---
apiVersion: constraints.gatekeeper.sh/v1beta1
kind: K8sNoPlainSecretsString
metadata:
  name: no-plain-secrets
spec:
  match:
    kinds:
      - apiGroups: [""]
        kinds: ["Pod"]
```

## 🔧 Policy Management

### Installation & Setup

1. **Install OPA Gatekeeper**:
```bash
kubectl apply -f https://raw.githubusercontent.com/open-policy-agent/gatekeeper/release-3.14/deploy/gatekeeper.yaml
```

2. **Apply Policy Templates**:
```bash
kubectl apply -f ops/security/opa-policies/constraint-templates/
```

3. **Apply Constraints**:
```bash
kubectl apply -f ops/security/opa-policies/constraints/
```

### Policy Testing

Before applying policies to production, test them in staging:

```bash
# Test policy with kubectl dry-run
kubectl apply --dry-run=server -f test-deployment.yaml

# Check Gatekeeper violations
kubectl get k8srequireresources -o yaml

# View constraint status
kubectl describe k8srequireresources must-have-resources
```

### Policy Violations Monitoring

Monitor policy violations via Kubernetes events:

```bash
# Check recent policy violations
kubectl get events --field-selector reason=ConstraintViolation --sort-by='.lastTimestamp'

# Monitor specific constraint
kubectl get events --field-selector involvedObject.kind=K8sRequireResources
```

## 📊 Policy Compliance Dashboard

Create Grafana dashboard to monitor policy compliance:

```promql
# Policy violation rate
rate(gatekeeper_violations_total[5m])

# Most violated policies
topk(10, sum by (violation_kind) (gatekeeper_violations_total))

# Violations by namespace
sum by (namespace) (gatekeeper_violations_total)
```

## 🚨 Emergency Policy Override

In case of emergency, policies can be temporarily disabled:

```bash
# Disable specific constraint
kubectl patch k8srequireresources must-have-resources --type='merge' -p='{"spec":{"enforcementAction":"warn"}}'

# Disable all constraints (emergency only)
kubectl patch configs.config.gatekeeper.sh config --type='merge' -p='{"spec":{"validation":{"traces":[{"user":{"name":"admin"},"kind":{"group":"*","version":"*","kind":"*"}}]}}}'
```

## 📋 Policy Review Process

### Monthly Policy Review
- [ ] Review policy violation reports
- [ ] Assess policy effectiveness
- [ ] Update policies based on new security requirements
- [ ] Test policy changes in staging environment

### Policy Exception Process
1. **Request**: Submit exception request with business justification
2. **Review**: Security team reviews and approves/denies
3. **Implementation**: Add exclusion to constraint if approved
4. **Monitoring**: Track exceptions and review quarterly

### Policy Updates
1. **Proposal**: Create proposal for new or updated policy
2. **Testing**: Test in development/staging environments  
3. **Review**: Security and platform teams review
4. **Rollout**: Gradual rollout starting with warning mode
5. **Enforcement**: Enable enforcement after validation period

## 📚 Additional Resources

- **OPA Documentation**: [openpolicyagent.org](https://www.openpolicyagent.org/docs/latest/)
- **Gatekeeper Documentation**: [open-policy-agent.github.io/gatekeeper](https://open-policy-agent.github.io/gatekeeper/website/)
- **Policy Library**: [github.com/open-policy-agent/gatekeeper-library](https://github.com/open-policy-agent/gatekeeper-library)

---

*Last updated: 2024-01 | Version: 1.0 | Owner: Security Team*