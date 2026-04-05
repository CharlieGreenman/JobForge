# Contributing to JobForge

Thanks for your interest in contributing! JobForge is built with Claude Code, and you can use it for development too.

## Quick Start

1. Fork the repo
2. Create a branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Test with a fresh clone (see [docs/SETUP.md](docs/SETUP.md))
5. Commit and push
6. Open a Pull Request

## What to Contribute

**Good first contributions:**
- Add companies to `templates/portals.example.yml`
- Improve documentation
- Add example CVs for different roles (in `examples/` — see `examples/README.md`)
- Report bugs via [Issues](https://github.com/CharlieGreenman/JobForge/issues)

**Bigger contributions:**
- New evaluation dimensions or scoring logic
- Dashboard TUI features (in `dashboard/`)
- New skill modes (in `modes/`)
- Script improvements (`.mjs` utilities)

## Guidelines

- Scripts should handle missing files gracefully (check `existsSync` before `readFileSync`)
- Dashboard changes require `go build` — test with real data before submitting
- Don't commit personal data (cv.md, profile.yml, applications.md, reports/)

## Development

Before opening a PR, from the repo root:

```bash
npm run verify
(cd dashboard && go build .)
```

`npm run verify` runs `verify-pipeline.mjs`. It exits successfully when `data/applications.md` is missing (fresh clone). Optional local setup checks:

```bash
npm run sync-check   # node cv-sync-check.mjs — expects cv.md and config/profile.yml
```

Dashboard (optional TUI):

```bash
cd dashboard && go build -o job-forge-dashboard .
./job-forge-dashboard --path .
```

## Need Help?

- [Setup guide](docs/SETUP.md) — install, profile, CV, portals, verify
- [Architecture](docs/ARCHITECTURE.md) — how evaluation, batch, and scripts fit together
- [Customization](docs/CUSTOMIZATION.md) — profile, archetypes, portals, template, states
- [Open an issue](https://github.com/CharlieGreenman/JobForge/issues)
