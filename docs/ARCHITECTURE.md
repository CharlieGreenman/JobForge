# Architecture

## System Overview

```
                    ┌─────────────────────────────────┐
                    │         Claude Code Agent        │
                    │   (reads CLAUDE.md + modes/*.md) │
                    └──────────┬──────────────────────┘
                               │
            ┌──────────────────┼──────────────────────┐
            │                  │                       │
     ┌──────▼──────┐   ┌──────▼──────┐   ┌───────────▼────────┐
     │ Single Eval  │   │ Portal Scan │   │   Batch Process    │
     │ (auto-pipe)  │   │  (scan.md)  │   │   (batch-runner)   │
     └──────┬──────┘   └──────┬──────┘   └───────────┬────────┘
            │                  │                       │
            │           ┌──────▼──────┐          ┌────▼─────┐
            │           │ pipeline.md │          │ N workers│
            │           │ (URL inbox) │          │ (claude -p)
            │           └─────────────┘          └────┬─────┘
            │                                          │
     ┌──────▼──────────────────────────────────────────▼──────┐
     │                    Output Pipeline                      │
     │  ┌──────────┐  ┌────────────┐  ┌───────────────────┐  │
     │  │ Report.md│  │  PDF (HTML  │  │ Tracker TSV       │  │
     │  │ (A-F eval)│  │  → Puppeteer)│  │ (merge-tracker)  │  │
     │  └──────────┘  └────────────┘  └───────────────────┘  │
     └────────────────────────────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │  data/applications.md │
                    │  (canonical tracker)  │
                    └──────────────────────┘
```

## Evaluation Flow (Single Offer)

1. **Input**: User pastes JD text or URL
2. **Extract**: Playwright/WebFetch extracts JD from URL
3. **Classify**: Detect archetype (1 of 6 types)
4. **Evaluate**: 6 blocks (A-F):
   - A: Role summary
   - B: CV match (gaps + mitigation)
   - C: Level strategy
   - D: Comp research (WebSearch)
   - E: CV personalization plan
   - F: Interview prep (STAR stories)
5. **Score**: Weighted average across 10 dimensions (1-5)
6. **Report**: Save as `reports/{num}-{company}-{date}.md`
7. **PDF**: Generate ATS-optimized CV (`generate-pdf.mjs`)
8. **Track**: Write TSV to `batch/tracker-additions/`, auto-merged

## Batch Processing

The batch system processes multiple offers in parallel:

```
batch-input.tsv    →  batch-runner.sh  →  N × claude -p workers
(id, url, source)     (orchestrator)       (self-contained prompt)
                           │
                    batch-state.tsv
                    (tracks progress)
```

Each worker is a headless Claude instance (`claude -p`) that receives the full `batch-prompt.md` as context. Workers produce:
- Report .md
- PDF
- Tracker TSV line

The orchestrator manages parallelism, state, retries, and resume.

**Local batch artifacts:** `batch/batch-input.tsv`, `batch/batch-state.tsv`, `batch/logs/`, and `batch/tracker-additions/*.tsv` are created when you run the runner; they are gitignored (with `.gitkeep` where needed). A fresh clone ships `batch/batch-runner.sh` and `batch/batch-prompt.md` only until you add an input file — see `batch/batch-runner.sh --help` for the TSV column layout.

## Data Flow

```
cv.md                    →  Evaluation context
article-digest.md        →  Proof points for matching
config/profile.yml       →  Candidate identity
portals.yml              →  Scanner configuration
templates/states.yml     →  Canonical status values
templates/cv-template.html → PDF generation template
```

## File Naming Conventions

- Reports: `{###}-{company-slug}-{YYYY-MM-DD}.md` (3-digit zero-padded)
- PDFs: `cv-candidate-{company-slug}-{YYYY-MM-DD}.pdf`
- Tracker TSVs: `batch/tracker-additions/{num}-{company-slug}.tsv` (one file per evaluation; merged files move under `batch/tracker-additions/merged/`)

## Pipeline Integrity

From the repo root, `npm run verify` runs `verify-pipeline.mjs`. That check exits successfully when neither `data/applications.md` nor root `applications.md` exists yet (normal for a new clone). Optional setup validation after you add `cv.md` and `config/profile.yml`: `npm run sync-check` (`cv-sync-check.mjs`).

**PR / maintainer gate:** Before opening a pull request, run `npm run verify` and `npm run build:dashboard` (or `(cd dashboard && go build .)`) from the repo root (same as [CONTRIBUTING.md](../CONTRIBUTING.md#development)). For optional scripted iterations that repeat that gate and commit one small change per pass, see [`scripts/cursor-agent-loop.sh`](../scripts/cursor-agent-loop.sh) (environment variables and usage in the script header; overview in [CONTRIBUTING.md](../CONTRIBUTING.md#optional-scripted-agent-iterations)).

Scripts maintain data consistency:

| Script | Purpose |
|--------|---------|
| `merge-tracker.mjs` | Merges TSV rows from `batch/tracker-additions/` into `data/applications.md`, or root `applications.md` when the `data/` file is absent |
| `verify-pipeline.mjs` | Health check: statuses, duplicates, report links, pending TSVs |
| `dedup-tracker.mjs` | Removes duplicate entries by company+role |
| `normalize-statuses.mjs` | Maps status aliases to canonical values |
| `cv-sync-check.mjs` | Setup lint: `cv.md` + `config/profile.yml`, hardcoded-metric scan on `modes/_shared.md` and `batch/batch-prompt.md`, optional `article-digest.md` freshness |

## Dashboard TUI

The `dashboard/` directory contains a standalone Go TUI application that visualizes the pipeline.

**Repo root:** The program needs the path to the JobForge checkout (the directory that contains `modes/`, `reports/`, and the tracker). Flag `-path` sets that directory (default `.`, i.e. the process working directory). If you run the binary from inside `dashboard/` after `go build`, use `-path ..` so the tracker is found.

**Tracker file:** Same resolution as the Node scripts: `{path}/data/applications.md` when that file exists, otherwise `{path}/applications.md`.

**Build / run** (see also [SETUP.md](SETUP.md#build-dashboard-optional)):

```bash
cd dashboard && go build -o job-forge-dashboard .
./job-forge-dashboard -path ..
```

**UI:**

- Filter tabs: All, Evaluated, Applied, Interview, Top ≥4, SKIP
- Sort modes: Score, Date, Company, Status
- Grouped/flat view
- Lazy-loaded report previews
- Inline status picker; on-screen key hints at the bottom of the pipeline view
