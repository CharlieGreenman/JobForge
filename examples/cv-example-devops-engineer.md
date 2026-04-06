# CV -- Alex Morgan

**Location:** Amsterdam, Netherlands
**Email:** alex@example.com
**LinkedIn:** linkedin.com/in/alexmorgan-devops
**Portfolio:** alexmorgan.dev
**GitHub:** github.com/alexmorgan

## Professional Summary

Platform engineer with 8 years building and running cloud-native infrastructure for product teams. Shipped self-service deployment pipelines, hardened multi-region Kubernetes estates, and cut mean lead time for changes from weeks to hours. Strong in Terraform, Kubernetes, and observability; comfortable pairing with application teams on reliability and cost.

## Work Experience

### Northwind Digital -- Amsterdam, Netherlands
**Senior Platform Engineer**
2020-2025

- Owned the internal Kubernetes platform (EKS): cluster upgrades, node pools, network policies, and admission controllers (OPA/Gatekeeper) aligned with security baselines
- Built GitOps workflows (Argo CD) and reusable Helm charts; standardized 40+ services on a golden path with guardrails instead of one-off manifests
- Led infrastructure-as-code for AWS (Terraform, Terragrunt): VPC design, IAM least-privilege patterns, and cost allocation tags consumed by FinOps dashboards
- Improved incident response: SLOs per service, on-call playbooks, and blameless postmortems; reduced repeat incidents by tightening runbooks and alert noise (PagerDuty + Grafana)
- Mentored developers on containers, CI secrets, and safe rollouts (canary, feature flags at the edge)

### Streamline Analytics -- Remote
**DevOps Engineer**
2016-2020

- Maintained Jenkins → GitHub Actions migration for build and deploy; introduced reusable workflows and OIDC-based AWS auth (no long-lived keys in CI)
- Operated production on AWS: EC2 → partial EKS adoption, RDS backups, and disaster-recovery drills documented quarterly
- Implemented centralized logging (ELK) and metrics (Prometheus); partnered with backend teams to define RED metrics for critical APIs

## Projects

- **kube-lab-notes** (Open Source) -- Minimal cluster recipes and troubleshooting notes for platform learners
- **tf-snippets** (Personal) -- Opinionated Terraform modules for VPC, EKS, and observability stacks (reference only)

## Education

- BSc Computer Science, University of Twente (2016)

## Skills

- **Platforms:** Kubernetes, Helm, Argo CD, Docker, Linux
- **Cloud & IaC:** AWS (EKS, VPC, IAM, RDS), Terraform, Terragrunt
- **CI/CD:** GitHub Actions, Jenkins (legacy), GitOps patterns
- **Observability:** Prometheus, Grafana, OpenTelemetry, ELK basics
- **Security:** OIDC, secrets management, network policies, baseline hardening
- **Practices:** SRE concepts, capacity planning, incident management, FinOps awareness
