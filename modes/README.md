# Modes

Markdown prompts used with Claude Code together with the root [`CLAUDE.md`](../CLAUDE.md). Each file aligns with a `/job-forge …` entry point or shared behavior described there.

- **`_shared.md`** — Archetypes, scoring dimensions, negotiation scaffolding. Edit this first when you change how offers are classified or weighted.
- **Per-command files** — Each `*.md` here pairs with a `/job-forge …` entry in [`CLAUDE.md`](../CLAUDE.md). How modes connect to batch, tracker, and scripts is spelled out in [**Architecture — Modes**](../docs/ARCHITECTURE.md#modes-modes).

| File | Role |
|------|------|
| [`_shared.md`](_shared.md) | Shared archetypes, scoring, negotiation scaffolding |
| [`auto-pipeline.md`](auto-pipeline.md) | Default path when the user pastes a JD or URL — full evaluate → report → PDF → tracker flow |
| [`offer.md`](offer.md) | Explicit full evaluation (blocks A–F) for a single offer |
| [`compare.md`](compare.md) | Side-by-side comparison of multiple offers |
| [`contact.md`](contact.md) | LinkedIn or email outreach drafts |
| [`deep.md`](deep.md) | Deeper company / role research |
| [`pdf.md`](pdf.md) | Tailored CV and PDF generation |
| [`training.md`](training.md) | Evaluate a course, cert, or learning path |
| [`project.md`](project.md) | Evaluate a portfolio project for job fit |
| [`tracker.md`](tracker.md) | Application tracker hygiene and status questions |
| [`apply.md`](apply.md) | Application forms and long-form answers |
| [`scan.md`](scan.md) | Portal and job-board scanning |
| [`pipeline.md`](pipeline.md) | Work through pending URLs in `data/pipeline.md` |
| [`batch.md`](batch.md) | Batch evaluation workflow and TSV-oriented runs |
| [`followup.md`](followup.md) | What to follow up on next |
| [`rejection.md`](rejection.md) | Log or process a rejection |
| [`negotiation.md`](negotiation.md) | Offer received — negotiation framing |

To tailor profile-driven settings, portals, and templates, see [`docs/CUSTOMIZATION.md`](../docs/CUSTOMIZATION.md).

Contributors: see [`CONTRIBUTING.md`](../CONTRIBUTING.md) for branch workflow and the `npm run verify` gate; prefer one cohesive change per PR (for example a single mode or updates under `_shared.md` only).
