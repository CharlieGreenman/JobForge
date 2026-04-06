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

For structure and section ideas, see the fictional samples in [`examples/`](../examples/) (for example `cv-example.md`, `cv-example-backend-engineer.md`, and `cv-example-data-engineer.md`).

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

## Available Commands

| Action | How |
|--------|-----|
| Evaluate an offer | Paste a URL or JD text |
| Search for offers | `/job-forge scan` |
| Process pending URLs | `/job-forge pipeline` |
| Generate a PDF | `/job-forge pdf` |
| Batch evaluate | `/job-forge batch` |
| Check tracker status | `/job-forge tracker` |
| Fill application form | `/job-forge apply` |

## Verify Setup

```bash
npm run verify               # Pipeline integrity (same as verify-pipeline.mjs; OK if tracker not created yet)
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

From the repo root after building (same quality gate as in [CONTRIBUTING.md](../CONTRIBUTING.md#development)):

```bash
(cd dashboard && go build -o job-forge-dashboard .)
./dashboard/job-forge-dashboard -path .
```

## Contributing

Pull requests and issue reports are welcome. See [CONTRIBUTING.md](../CONTRIBUTING.md) for branch workflow, ideas (documentation, `examples/`, `templates/portals.example.yml`, dashboard features, utility scripts), and the checks maintainers expect before a PR (`npm run verify` and `cd dashboard && go build .`).
