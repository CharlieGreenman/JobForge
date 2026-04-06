# Setup Guide

## Prerequisites

- [Claude Code](https://claude.ai/code) installed and configured
- Node.js 18+ (for PDF generation and utility scripts)
- (Optional) Go 1.21+ (for the dashboard TUI)

## Quick Start (5 steps)

### 1. Clone and install

```bash
git clone https://github.com/CharlieGreenman/JobForge.git
cd JobForge
npm install
npx playwright install chromium   # Required for PDF generation
```

### 2. Configure your profile

```bash
cp config/profile.example.yml config/profile.yml
```

Edit `config/profile.yml` with your personal details: name, email, target roles, narrative, proof points.

### 3. Add your CV

Create `cv.md` in the project root with your full CV in markdown format. This is the source of truth for all evaluations and PDFs.

For structure and section ideas, see the fictional samples in [`examples/`](../examples/) (for example `cv-example.md`, `cv-example-backend-engineer.md`, `cv-example-data-engineer.md`, `cv-example-frontend-engineer.md`, `cv-example-devops-engineer.md`, `cv-example-security-engineer.md`, `cv-example-qa-engineer.md`, and `cv-example-product-manager.md`).

(Optional) Create `article-digest.md` with proof points from your portfolio projects/articles.

### 4. Configure portals

```bash
cp templates/portals.example.yml portals.yml
```

Edit `portals.yml`:
- Update `title_filter.positive` with keywords matching your target roles
- Add companies you want to track in `tracked_companies`
- Customize `search_queries` for your preferred job boards

### 5. Start using

Open Claude Code in this directory:

```bash
claude
```

Then paste a job offer URL or description. JobForge will automatically evaluate it, generate a report, create a tailored PDF, and track it.

When you want to tune archetypes, scanner keywords, or the PDF template, see [Customization](CUSTOMIZATION.md).

## Application tracker (optional until first evaluation)

New rows go to **`data/applications.md`** when that file exists. If it does not exist, utilities and the dashboard fall back to **`applications.md`** in the repo root (same column layout). A fresh clone often has neither file yet; that is normal, and `npm run verify` still exits successfully.

To start with an empty tracker (for example before you paste your first URL), create `data/applications.md` with this header:

```markdown
# Applications Tracker

| # | Date | Company | Role | Score | Status | PDF | Report | Notes |
|---|------|---------|------|-------|--------|-----|--------|-------|
```

Status values should match [templates/states.yml](../templates/states.yml); see the **States** section in [Customization](CUSTOMIZATION.md). After batch evaluations, run `npm run merge` to pull in `batch/tracker-additions/*.tsv` when your workflow uses those files. For the parallel batch runner that produces those additions, see [batch/README.md](../batch/README.md). If the status column has typos, old labels, or bold markers, run `npm run normalize` to rewrite rows toward the canonical set (use `npm run normalize -- --dry-run` first to preview changes).

## Available Commands (Claude Code)

Use these inside a Claude Code session in this repo (see [CLAUDE.md](../CLAUDE.md) for the full mode map):

| Action | How |
|--------|-----|
| Evaluate an offer | Paste a URL or JD text |
| Search for offers | `/job-forge scan` |
| Process pending URLs | `/job-forge pipeline` |
| Generate a PDF | `/job-forge pdf` |
| Batch evaluate | `/job-forge batch` |
| Check tracker status | `/job-forge tracker` |
| Fill application form | `/job-forge apply` |

## Tracker and scripts (terminal)

From the repository root, these commands maintain the application tracker and pipeline checks. They do not require Claude Code. `merge`, `normalize`, and `dedup` exit successfully when the tracker file is missing (same as a fresh clone). For optional PDF generation and setup lint, see the script table in [CONTRIBUTING.md](../CONTRIBUTING.md#development).

| Action | Command |
|--------|---------|
| Pipeline health check | `npm run verify` |
| Merge `batch/tracker-additions/*.tsv` into the tracker | `npm run merge` |
| Map status column to canonical labels | `npm run normalize` (preview with `npm run normalize -- --dry-run`) |
| Merge duplicate company/role rows | `npm run dedup` |

## Verify Setup

```bash
npm run verify               # Pipeline integrity (verify-pipeline.mjs). OK if the tracker file does not exist yet; still warns on unmerged batch/tracker-additions/*.tsv — run npm run merge when you intend to fold those rows into the tracker (see [batch/README.md](../batch/README.md))
npm run sync-check           # Same as node cv-sync-check.mjs — requires cv.md and config/profile.yml
```

Optional tracker and PDF scripts (`normalize`, `dedup`, `merge`, `pdf`) are listed in [CONTRIBUTING.md](../CONTRIBUTING.md#development).

## Build Dashboard (Optional)

The TUI reads the tracker at the **JobForge repo root** (`applications.md` or `data/applications.md`). If you build inside `dashboard/`, point `-path` at the parent directory:

```bash
cd dashboard
go build -o job-forge-dashboard .
./job-forge-dashboard -path ..   # repo root is one level up
```

From the repo root, `npm run build:dashboard` runs `go build .` inside `dashboard/` (same as the PR gate in [CONTRIBUTING.md](../CONTRIBUTING.md#development); default binary name is `dashboard` in that folder).

From the repo root after building:

```bash
npm run build:dashboard
./dashboard/dashboard -path .
```

To install a named binary under `dashboard/` (optional), use `go build -o job-forge-dashboard .` inside `dashboard/` and run `./dashboard/job-forge-dashboard -path .` instead.

## Troubleshooting

**`npm run verify` succeeds, but `npm run sync-check` fails**  
`sync-check` requires `cv.md` and `config/profile.yml` with the fields checked in `cv-sync-check.mjs`. Until you finish the profile and CV steps in Quick Start, that is normal. Use `npm run verify` for pipeline health on a minimal checkout, then run `sync-check` once your personal files exist.

**PDF generation fails with a browser or Chromium error**  
From the repo root, run `npx playwright install chromium` after `npm install` so Playwright can launch the bundled browser. For usage only, `npm run pdf -- --help` works without a successful Chromium install (see [CONTRIBUTING.md](../CONTRIBUTING.md#development)).

**Dashboard is empty or points at the wrong data**  
The `-path` argument must be the JobForge repository root (where `data/applications.md` or `applications.md` lives), not the `dashboard/` directory. From the repo root after `npm run build:dashboard`, use `./dashboard/dashboard -path .` (see [Build Dashboard](#build-dashboard-optional) above).

**`go build` or `npm run build:dashboard` reports `go: command not found`**  
Install Go 1.21+ and put it on your `PATH`, or omit the dashboard; everything else runs with Node.js.

**`npm run merge` says there is nothing to merge, but you have TSV files**  
Only files directly under `batch/tracker-additions/` with a `.tsv` extension are picked up. After a successful merge, rows are merged into the tracker and those files move to `batch/tracker-additions/merged/`, so a second run correctly finds nothing left. If you created TSVs elsewhere or only have files under `merged/`, move or regenerate them in the top-level `tracker-additions` folder (see [batch/README.md](../batch/README.md)).

## Contributing

Pull requests and issue reports are welcome. See [CONTRIBUTING.md](../CONTRIBUTING.md) for branch workflow, ideas (documentation, `examples/`, `templates/portals.example.yml`, dashboard features, utility scripts), and the checks maintainers expect before a PR (`npm run verify` and `npm run build:dashboard`).
