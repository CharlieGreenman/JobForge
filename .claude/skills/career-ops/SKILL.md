---
name: job-forge
description: AI job search command center -- evaluate offers, generate CVs, scan portals, track applications
user_invocable: true
args: mode
---

# job-forge -- Router

## Mode Routing

Determine the mode from `{{mode}}`:

| Input | Mode |
|-------|------|
| (empty / no args) | `discovery` -- Show command menu |
| JD text or URL (no sub-command) | **`auto-pipeline`** |
| `offer` | `offer` |
| `compare` | `compare` |
| `contact` | `contact` |
| `deep` | `deep` |
| `pdf` | `pdf` |
| `training` | `training` |
| `project` | `project` |
| `tracker` | `tracker` |
| `pipeline` | `pipeline` |
| `apply` | `apply` |
| `scan` | `scan` |
| `batch` | `batch` |
| `followup` | `followup` |
| `rejection` | `rejection` |
| `negotiation` | `negotiation` |

**Auto-pipeline detection:** If `{{mode}}` is not a known sub-command AND contains JD text (keywords: "responsibilities", "requirements", "qualifications", "about the role", "we're looking for", company name + role) or a URL to a JD, execute `auto-pipeline`.

If `{{mode}}` is not a sub-command AND doesn't look like a JD, show discovery.

---

## Discovery Mode (no arguments)

Show this menu:

```
job-forge -- Command Center

Available commands:
  /job-forge {JD}      → AUTO-PIPELINE: evaluate + report + PDF + tracker (paste text or URL)
  /job-forge pipeline  → Process pending URLs from inbox (data/pipeline.md)
  /job-forge offer     → Evaluation only A-F (no auto PDF)
  /job-forge compare   → Compare and rank multiple offers
  /job-forge contact   → LinkedIn power move: find contacts + draft message
  /job-forge deep      → Deep research prompt about company
  /job-forge pdf       → PDF only, ATS-optimized CV
  /job-forge training  → Evaluate course/cert against North Star
  /job-forge project   → Evaluate portfolio project idea
  /job-forge tracker   → Application status overview
  /job-forge followup  → Follow-up timing and nudges from the tracker
  /job-forge apply     → Live application assistant (reads form + generates answers)
  /job-forge scan      → Scan portals and discover new offers
  /job-forge batch     → Batch processing with parallel workers
  /job-forge negotiation → Negotiate a received offer (comp and terms)
  /job-forge rejection → Log a rejection or review rejection patterns

Inbox: add URLs to data/pipeline.md → /job-forge pipeline
Or paste a JD directly to run the full pipeline.
```

---

## Context Loading by Mode

After determining the mode, load the necessary files before executing:

### Modes that require `_shared.md` + their mode file:
Read `modes/_shared.md` + `modes/{mode}.md`

Applies to: `auto-pipeline`, `offer`, `compare`, `pdf`, `contact`, `apply`, `pipeline`, `scan`, `batch`

### Standalone modes (only their mode file):
Read `modes/{mode}.md`

Applies to: `tracker`, `deep`, `training`, `project`, `followup`, `rejection`, `negotiation`

### Modes delegated to subagent:
For `scan`, `apply` (with Playwright), and `pipeline` (3+ URLs): launch as Agent with the content of `_shared.md` + `modes/{mode}.md` injected into the subagent prompt.

```
Agent(
  subagent_type="general-purpose",
  prompt="[content of modes/_shared.md]\n\n[content of modes/{mode}.md]\n\n[invocation-specific data]",
  description="job-forge {mode}"
)
```

Execute the instructions from the loaded mode file.
