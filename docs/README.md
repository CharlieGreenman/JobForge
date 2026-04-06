# JobForge documentation

Guides for installing JobForge, understanding how pieces fit together, and tailoring the system to your search. Use this file as the entry point when browsing the `docs/` folder on GitHub or locally.

| Guide | What it covers |
|-------|----------------|
| [SETUP.md](SETUP.md) | Prerequisites, profile and CV, portals copy, `npm run verify`, optional Go dashboard, [troubleshooting](SETUP.md#troubleshooting) |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Modes under `modes/`, single-offer flow, batch runner, tracker and scripts |
| [CUSTOMIZATION.md](CUSTOMIZATION.md) | Profile, archetypes in `_shared.md`, `portals.yml`, CV template, canonical states, optional story bank and Claude Code hooks |

## Checks and automation

Terminal workflows and PR-style gates are documented across a few files. Use this map when you need a command name versus what a script actually does:

| What you need | Where to read |
|---------------|---------------|
| npm script names (`verify`, `merge`, `normalize`, `dedup`, `pdf`, `sync-check`, `build:dashboard`) | [CONTRIBUTING.md — Development](../CONTRIBUTING.md#development) |
| What each repository-root `.mjs` utility is for | [ARCHITECTURE.md — Pipeline integrity](ARCHITECTURE.md#pipeline-integrity) |
| Batch runner, TSV layout, and `batch/tracker-additions/` merge flow | [batch/README.md](../batch/README.md) |
| Optional scripted iterations (same verify + dashboard build gate as a manual PR) | [scripts/cursor-agent-loop.sh](../scripts/cursor-agent-loop.sh) — usage and env vars in the script header and [CONTRIBUTING.md — Optional: scripted agent iterations](../CONTRIBUTING.md#optional-scripted-agent-iterations); verbose JSON output is formatted by [cursor-agent-stream-format.py](../scripts/cursor-agent-stream-format.py) |

## Related material (repository root)

- [modes/README.md](../modes/README.md) — per-command prompts used with `CLAUDE.md` (archetypes and shared scoring live in `_shared.md`; see **Modes** in [ARCHITECTURE.md](ARCHITECTURE.md))
- [CLAUDE.md](../CLAUDE.md) — default agent instructions for Claude Code in this repo
- [CONTRIBUTING.md](../CONTRIBUTING.md) — branch workflow, quality gate, contribution ideas
- [templates/states.yml](../templates/states.yml) — canonical tracker status ids and labels (used by verify, merge, and normalize)
- [templates/portals.example.yml](../templates/portals.example.yml) — starter portal and scanner config (copy to repo-root `portals.yml`)
- [templates/cv-template.html](../templates/cv-template.html) — HTML layout for ATS-style PDFs from `generate-pdf.mjs`
- [examples/README.md](../examples/README.md) — fictional CV samples and illustrative report layout
- [interview-prep/story-bank.md](../interview-prep/story-bank.md) — optional STAR+R story bank (grows as you run evaluations)
- [batch/README.md](../batch/README.md) — batch TSV input, merge step, and runner prerequisites
- [`data/pipeline.md`](../data/) — inbox of pending offer URLs / local JD paths (create when needed; see [`modes/pipeline.md`](../modes/pipeline.md)); saved JD text often lives under [`jds/`](../jds/) as `local:jds/{file}` (see [jds/README.md](../jds/README.md))
- [scripts/cursor-agent-loop.sh](../scripts/cursor-agent-loop.sh) — optional driver for repeated non-interactive passes; see the **Checks and automation** table above and [CONTRIBUTING.md — Optional: scripted agent iterations](../CONTRIBUTING.md#optional-scripted-agent-iterations)
