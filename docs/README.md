# JobForge documentation

Guides for installing JobForge, understanding how pieces fit together, and tailoring the system to your search. Use this file as the entry point when browsing the `docs/` folder on GitHub or locally.

| Guide | What it covers |
|-------|----------------|
| [SETUP.md](SETUP.md) | Prerequisites, profile and CV, portals copy, `npm run verify`, optional Go dashboard |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Modes under `modes/`, single-offer flow, batch runner, tracker and scripts |
| [CUSTOMIZATION.md](CUSTOMIZATION.md) | Profile, archetypes in `_shared.md`, `portals.yml`, CV template, canonical states |

## Related material (repository root)

- [modes/](../modes/) — per-command prompts used with `CLAUDE.md` (archetypes and shared scoring live in `_shared.md`; see **Modes** in [ARCHITECTURE.md](ARCHITECTURE.md))
- [CLAUDE.md](../CLAUDE.md) — default agent instructions for Claude Code in this repo
- [CONTRIBUTING.md](../CONTRIBUTING.md) — branch workflow, quality gate, contribution ideas
- [examples/README.md](../examples/README.md) — fictional CV samples and illustrative report layout
- [interview-prep/story-bank.md](../interview-prep/story-bank.md) — optional STAR+R story bank (grows as you run evaluations)
- [batch/README.md](../batch/README.md) — batch TSV input, merge step, and runner prerequisites

Optional scripted agent iterations (same verify/build expectations as a manual PR) are described in [scripts/cursor-agent-loop.sh](../scripts/cursor-agent-loop.sh) and in CONTRIBUTING.
