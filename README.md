# JobForge

> AI-powered job search pipeline built on Claude Code. Evaluate offers, generate tailored CVs, scan portals, negotiate offers, and track everything -- powered by AI agents.

![Claude Code](https://img.shields.io/badge/Claude_Code-000?style=flat&logo=anthropic&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=flat&logo=playwright&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Made in USA](https://img.shields.io/badge/Made_in-USA_%F0%9F%87%BA%F0%9F%87%B8-red?style=flat)

<p align="center">
  <img src="demo/demo.gif" alt="JobForge Demo" width="800">
</p>

<p align="center"><em>Paste a job URL. Get a scored evaluation, tailored CV, and tracked application — in seconds.</em></p>

---

## What Is This

JobForge turns Claude Code into a full job search command center. Instead of manually tracking applications in a spreadsheet, you get an AI-powered pipeline that:

- **Evaluates offers** with a unified 10-dimension weighted scoring system
- **Generates tailored PDFs** -- ATS-optimized CVs with anti-AI-detection writing rules
- **Scans portals** with fuzzy dedup (catches reposts with new URLs)
- **Processes in batch** -- evaluate 10+ offers in parallel with sub-agents
- **Tracks everything** with pipeline integrity checks and canonical state management
- **Manages follow-ups** -- timing-based nudges so you never miss a window
- **Learns from rejections** -- pattern analysis across all rejections by stage, archetype, and score
- **Negotiates offers** -- structured comp breakdown, leverage assessment, counter-offer strategy

> **Important: This is NOT a spray-and-pray tool.** The whole point is to apply only where there's a real match. The scoring system helps you focus on high-fit opportunities instead of wasting everyone's time. Always review before submitting.

## Features

| Feature | Description |
|---------|-------------|
| **Auto-Pipeline** | Paste a URL, get a full evaluation + PDF + tracker entry |
| **Unified Scoring** | 10 weighted dimensions, consistent across all modes, with calibration anchors |
| **Anti-AI-Detection CVs** | Writing rules that avoid ATS filters on Indeed, LinkedIn, Workday |
| **6-Block Evaluation** | Role summary, CV match, level strategy, comp research, personalization, interview prep (STAR+R) |
| **Interview Story Bank** | Curated bank of 10-12 stories with match counts, archetype tags, and automatic pruning |
| **Follow-Up System** | Timing-based nudges: Applied 7+ days ago nudge, Interviewed 1 day ago thank-you note |
| **Rejection Analysis** | Captures stage + reason, surfaces patterns (archetype gaps, scoring miscalibration) |
| **Offer Negotiation** | Total comp breakdown, equity valuation, leverage from pipeline, counter-offer scripts |
| **Deep Research** | Company research that feeds back into scores and interview prep |
| **Smart LinkedIn Outreach** | Reads evaluation reports to craft targeted messages using top proof points |
| **Portal Scanner** | 45+ companies pre-configured with fuzzy dedup for reposts |
| **Batch Processing** | Parallel evaluation with `claude -p` workers, with honest verification flagging |
| **Pipeline Integrity** | Automated merge, dedup, status normalization, health checks |

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/CharlieGreenman/JobForge.git
cd JobForge && npm install
npx playwright install chromium   # Required for PDF generation

# 2. Configure
cp config/profile.example.yml config/profile.yml  # Edit with your details
cp templates/portals.example.yml portals.yml       # Customize companies

# 3. Add your CV
# Create cv.md in the project root with your CV in markdown

# 4. Personalize with Claude
claude   # Open Claude Code in this directory

# Then ask Claude to adapt the system to you:
# "Change the archetypes to backend engineering roles"
# "Add these 5 companies to portals.yml"
# "Update my profile with this CV I'm pasting"

# 5. Start using
# Paste a job URL or run /job-forge
```

> **The system is designed to be customized by Claude itself.** Modes, archetypes, scoring weights, negotiation scripts -- just ask Claude to change them.

## Usage

```
/job-forge                → Show all available commands
/job-forge {paste a JD}   → Full auto-pipeline (evaluate + PDF + tracker)
/job-forge scan           → Scan portals for new offers
/job-forge pdf            → Generate ATS-optimized CV
/job-forge batch          → Batch evaluate multiple offers
/job-forge tracker        → View application status
/job-forge apply          → Fill application forms with AI
/job-forge pipeline       → Process pending URLs
/job-forge contact        → LinkedIn outreach (uses evaluation report)
/job-forge deep           → Deep company research (feeds back into scores)
/job-forge followup       → Check what needs follow-up action
/job-forge rejection      → Record/analyze rejection patterns
/job-forge negotiation    → Structured offer negotiation
/job-forge training       → Evaluate a course/cert
/job-forge project        → Evaluate a portfolio project
```

Or just paste a job URL or description directly -- JobForge auto-detects it and runs the full pipeline.

## How It Works

```
You paste a job URL or description
        │
        ▼
┌──────────────────┐
│  Archetype       │  Classifies: LLMOps / Agentic / PM / SA / FDE / Transformation
│  Detection       │
└────────┬─────────┘
         │
┌────────▼─────────┐
│  A-F Evaluation   │  Match, gaps, comp research, STAR stories
│  (reads cv.md)    │  Unified 10-dimension scoring model
└────────┬─────────┘
         │
    ┌────┼────┐
    ▼    ▼    ▼
 Report  PDF  Tracker
  .md   .pdf   .tsv
         │
    ┌────┼────┐
    ▼    ▼    ▼
 Apply  Follow  Negotiate
        up      (if offer)
```

## Project Structure

```
JobForge/
├── CLAUDE.md                    # Agent instructions
├── cv.md                        # Your CV (create this)
├── article-digest.md            # Your proof points (optional)
├── config/
│   └── profile.example.yml      # Template for your profile
├── modes/                       # 17 skill modes
│   ├── _shared.md               # Shared context + scoring model
│   ├── offer.md                 # Single evaluation
│   ├── pdf.md                   # PDF generation + anti-AI-detection
│   ├── scan.md                  # Portal scanner + fuzzy dedup
│   ├── contact.md               # LinkedIn outreach (report-aware)
│   ├── deep.md                  # Company research (feeds into scores)
│   ├── followup.md              # Follow-up timing
│   ├── rejection.md             # Rejection analysis
│   ├── negotiation.md           # Offer negotiation
│   ├── batch.md                 # Batch processing
│   └── ...
├── templates/
│   ├── cv-template.html         # ATS-optimized CV template
│   ├── portals.example.yml      # Scanner config template
│   └── states.yml               # Canonical statuses
├── batch/
│   ├── batch-prompt.md          # Self-contained worker prompt
│   └── batch-runner.sh          # Orchestrator script
├── dashboard/                   # Optional Go TUI for the tracker (`go build` in this dir)
├── docs/                        # SETUP, ARCHITECTURE, CUSTOMIZATION
├── examples/                    # Fictional CV samples + sample report (see examples/README.md)
├── interview-prep/
│   └── story-bank.md            # Curated STAR stories (max 12)
├── scripts/                     # Optional agent loop helper (see CONTRIBUTING.md)
├── data/                        # Your tracking data (gitignored)
├── reports/                     # Evaluation reports (gitignored)
├── output/                      # Generated PDFs (gitignored)
└── fonts/                       # Space Grotesk + DM Sans
```

## License

MIT
