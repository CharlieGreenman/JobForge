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

## Modes (`modes/`)

Markdown mode files in `modes/` define how the Claude Code workflow behaves together with the root `CLAUDE.md`. **`_shared.md`** is the shared layer (archetypes, scoring dimensions, negotiation scaffolding); the rest align with `/job-forge` command entry points listed in `CLAUDE.md`.

| File | Focus |
|------|--------|
| `_shared.md` | Archetypes, evaluation axes, shared prompts |
| `auto-pipeline.md` | Default path: evaluate, report, PDF, tracker |
| `offer.md` | Single-offer analysis |
| `compare.md` | Comparing multiple offers |
| `contact.md` | Outreach (e.g. LinkedIn) |
| `deep.md` | Company research |
| `pdf.md` | CV / PDF generation |
| `training.md` | Courses and certifications |
| `project.md` | Portfolio projects |
| `tracker.md` | Application tracker review |
| `apply.md` | Application forms |
| `scan.md` | Portal / job-board scanning |
| `pipeline.md` | Pending URL inbox |
| `batch.md` | Parallel batch runs (`batch/batch-runner.sh`) |
| `followup.md` | Follow-up triage |
| `rejection.md` | Rejection handling |
| `negotiation.md` | Offer negotiation |

For customization (archetypes, weights, tone), start with `_shared.md` and [CUSTOMIZATION.md](CUSTOMIZATION.md).

## Evaluation Flow (Single Offer)

1. **Input**: User pastes JD text or URL
2. **Extract**: Playwright/WebFetch extracts JD from URL
3. **Classify**: Detect archetype (one row from the archetype table in `modes/_shared.md`)
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
8. **Track**: Write one TSV per evaluation under `batch/tracker-additions/` (see [CLAUDE.md](../CLAUDE.md) TSV layout); fold rows into `data/applications.md` with `npm run merge` / `merge-tracker.mjs` when you are ready (not automatic in every workflow)

## Batch Processing

The batch system processes multiple offers in parallel:

```
batch-input.tsv    →  batch-runner.sh  →  N × claude -p workers
(id, url, source, notes) (orchestrator)   (self-contained prompt)
                           │
                    batch-state.tsv
                    (tracks progress)
```

Each worker is a headless Claude instance (`claude -p`) that receives the full `batch-prompt.md` as context. Workers produce:
- Report .md
- PDF
- Tracker TSV line

The orchestrator manages parallelism, state, retries, and resume.

**Local batch artifacts:** `batch/batch-input.tsv`, `batch/batch-state.tsv`, `batch/logs/`, and `batch/tracker-additions/*.tsv` are created when you run the runner; they are gitignored (with `.gitkeep` where needed). A fresh clone ships `batch/batch-runner.sh` and `batch/batch-prompt.md` only until you add an input file — see [`batch/README.md`](../batch/README.md) and `batch/batch-runner.sh --help` for the TSV layout and workflow.

## Data Flow

```
cv.md                    →  Evaluation context
article-digest.md        →  Proof points for matching
config/profile.yml       →  Candidate identity
portals.yml              →  Scanner configuration
data/pipeline.md        →  Pending URLs and `local:jds/...` inbox (see modes/pipeline.md)
jds/*.md                 →  Saved job descriptions referenced from the pipeline (`local:jds/{file}`)
templates/states.yml     →  Canonical status values
templates/cv-template.html → PDF generation template
examples/*.md            →  Fictional layouts only (not read by scripts; see examples/README.md)
```

Create `data/pipeline.md` when you start using the URL inbox (`/job-forge pipeline`); format and `local:jds/...` lines are described in [`modes/pipeline.md`](../modes/pipeline.md).

## File Naming Conventions

- Reports: `{###}-{company-slug}-{YYYY-MM-DD}.md` (3-digit zero-padded)
- PDFs: `cv-candidate-{company-slug}-{YYYY-MM-DD}.pdf`
- Tracker TSVs: `batch/tracker-additions/{num}-{company-slug}.tsv` (one file per evaluation; merged files move under `batch/tracker-additions/merged/`)

## Pipeline Integrity

From the repo root, `npm run verify` runs `verify-pipeline.mjs`. When a tracker file exists, it validates canonical statuses (using `templates/states.yml` when that file is present and parseable), warns on probable duplicate company/role rows, checks that report column markdown links resolve to files in the repo, validates score column format (`X.X/5`, `N/A`, or `DUP`), rejects table rows with too few columns, flags markdown bold inside the score column, and warns if any `batch/tracker-additions/*.tsv` files are still waiting to be merged. It also compares state ids from `templates/states.yml` to an internal fallback list and warns when the two sets drift. **Fresh clone:** the command exits successfully when neither `data/applications.md` nor root `applications.md` exists yet; pending-TSV and states-drift checks still run so contributors see unmerged batch output early. Optional setup validation after you add `cv.md` and `config/profile.yml`: `npm run sync-check` (`cv-sync-check.mjs`).

**`verify-pipeline.mjs` checks (same order as the script header):**

1. Status column uses canonical ids (from `templates/states.yml` when parseable, else built-in ids and aliases), with no markdown bold and no dates embedded in the status cell.
2. Warn when multiple rows share the same normalized company + role (possible duplicates).
3. Report column markdown links resolve to files under the repo root.
4. Score column matches `X.X/5`, `N/A`, or `DUP`.
5. Table data rows have enough pipe-delimited columns.
6. No unmerged `batch/tracker-additions/*.tsv` files (warns if any remain).
7. Score column has no markdown bold.
8. Warn when state ids in `templates/states.yml` drift from the script’s built-in fallback list (or when the file exists but ids could not be parsed).

When the tracker file is missing, checks 1–5 and 7 are skipped; checks 6 and 8 still run.

## Contributing touchpoints

Prefer one focused change per pull request: a single mode under `modes/`, one repository-root `.mjs` utility, documentation under `docs/`, fictional samples under [`examples/`](../examples/README.md), templates such as [`templates/portals.example.yml`](../templates/portals.example.yml), the batch flow described in [`batch/README.md`](../batch/README.md), or the Go TUI under `dashboard/` — not a repo-wide refactor across several of those at once. Branch workflow, the verify + dashboard build gate, and starter ideas are in [CONTRIBUTING.md](../CONTRIBUTING.md) (**What to Contribute** and **Development**). To look for in-repo `TODO`, `FIXME`, or `HACK` markers before choosing a task, use the `rg` one-liner in [CONTRIBUTING.md — Optional: scripted agent iterations](../CONTRIBUTING.md#optional-scripted-agent-iterations). Upstream PRs should stay generic: do not commit real candidate data (`cv.md`, `config/profile.yml`, personalized `portals.yml`, `data/applications.md`, `reports/`, or similar paths called out in CONTRIBUTING and `.gitignore`).

**PR / maintainer gate:** Before opening a pull request, run `npm run verify` and `npm run build:dashboard` (or `(cd dashboard && go build .)`) from the repo root (same as [CONTRIBUTING.md](../CONTRIBUTING.md#development)). For optional scripted iterations that repeat that gate and commit one small change per pass, see [`scripts/cursor-agent-loop.sh`](../scripts/cursor-agent-loop.sh) (environment variables and usage in the script header; overview in [CONTRIBUTING.md](../CONTRIBUTING.md#optional-scripted-agent-iterations)).

Scripts maintain data consistency:

| Script | Purpose |
|--------|---------|
| `merge-tracker.mjs` | Merges TSV rows from `batch/tracker-additions/` into `data/applications.md`, or root `applications.md` when the `data/` file is absent |
| `verify-pipeline.mjs` | Health check — see the `npm run verify` paragraph above |
| `dedup-tracker.mjs` | Removes duplicate entries by company+role |
| `normalize-statuses.mjs` | Maps status aliases to canonical values |
| `generate-pdf.mjs` | Renders HTML to PDF with Playwright/Chromium (`npm run pdf -- <input.html> <output.pdf>`); requires `npx playwright install chromium` |
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
