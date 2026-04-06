# CV -- Jordan Lee

**Location:** Berlin, Germany
**Email:** jordan@example.com
**LinkedIn:** linkedin.com/in/jordanlee-security
**Portfolio:** jordanlee-security.example
**GitHub:** github.com/jordanlee-sec

## Professional Summary

Security engineer with 7 years across application security, cloud hardening, and detection engineering. Led secure SDLC programs for fast-moving product teams, drove threat modeling and code review at scale, and built detection content that cut false positives while improving time-to-triage. Comfortable partnering with developers, SRE, and compliance on pragmatic risk reduction.

## Work Experience

### Meridian Health Tech -- Berlin, Germany
**Staff Application Security Engineer**
2021-2025

- Ran secure design reviews and threat models for new patient-data services; standardized STRIDE-based templates and “security sign-off” criteria tied to release gates
- Built and operated SAST/DAST in CI (GitHub Actions, Semgrep custom rules, OWASP ZAP baselines) with developer-facing fix guidance; reduced critical findings escaping to production by tightening merge checks
- Partnered with platform on Kubernetes and AWS controls: Pod Security Standards, IRSA/OIDC for workloads, Secrets Manager rotation, and guardrails via OPA/Gatekeeper
- Led incident readiness for product security: tabletop exercises, runbooks for credential leaks and supply-chain events, coordination with legal and privacy on breach timelines
- Mentored engineers on OWASP Top 10, SSRF/IDOR patterns, and safe handling of PHI in APIs and logs

### Cobalt Payments -- Remote
**Security Engineer**
2017-2021

- Owned vulnerability management lifecycle: triage from scanners and bug bounty, SLA tracking, and patch verification with owners across microservices
- Implemented WAF and bot-management policies (Cloudflare) tuned with application teams; reduced abuse-driven outages without blocking legitimate traffic spikes
- Wrote detection rules (Sigma, Elastic) for auth anomalies, payment fraud adjacent signals, and cloud audit trails; integrated alerts into on-call with clear escalation paths
- Supported SOC 2 and PCI assessments: evidence collection, control mapping, and remediation for gaps in logging and access reviews

## Projects

- **semgrep-rules-health** (Open Source) -- Example Semgrep rules for common healthcare API mistakes (fictional patterns for learning)
- **cloud-audit-cheatsheet** (Personal) -- Notes on AWS CloudTrail queries and IAM policy pitfalls (reference only)

## Education

- MSc Information Security, TU Berlin (2017)
- BSc Computer Science, University of Cape Town (2015)

## Skills

- **AppSec:** Threat modeling, secure code review, OWASP ASVS, Semgrep, dependency scanning
- **Cloud:** AWS (IAM, KMS, CloudTrail, EKS basics), Kubernetes security baselines
- **Detection:** Elastic/Sigma-style rules, SIEM workflows, log pipeline hygiene
- **Compliance:** SOC 2, PCI-DSS exposure (as engineer supporting audits)
- **Languages:** Python, Go (automation and small services), SQL for analytics queries
