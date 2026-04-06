# Customization Guide

## Profile (config/profile.yml)

This is the single source of truth for your identity. All modes read from here.

Key sections:
- **candidate**: Name, email, phone, location, LinkedIn, portfolio
- **target_roles**: Your North Star roles and archetypes
- **narrative**: Your headline, exit story, superpowers, proof points
- **compensation**: Target range, minimum, currency
- **location**: Country, timezone, visa status, on-site availability

## Target Roles (modes/_shared.md)

The archetype table in `_shared.md` determines how offers are scored and CVs are framed. Edit the table to match YOUR career targets:

```markdown
| Archetype | Thematic axes | What they buy |
|-----------|---------------|---------------|
| **Your Role 1** | key skills | what they need |
| **Your Role 2** | key skills | what they need |
```

Also update the "Adaptive Framing" table to map YOUR specific projects to each archetype.

## Portals (portals.yml)

Copy from `templates/portals.example.yml` and customize:

1. **title_filter.positive**: Keywords matching your target roles
2. **title_filter.negative**: Tech stacks or domains to exclude
3. **search_queries**: WebSearch queries for job boards (Ashby, Greenhouse, Lever)
4. **tracked_companies**: Companies to check directly

## CV Template (templates/cv-template.html)

The HTML template uses these design tokens:
- **Fonts**: Space Grotesk (headings) + DM Sans (body) -- self-hosted in `fonts/`
- **Colors**: Cyan primary (`hsl(187,74%,32%)`) + Purple accent (`hsl(270,70%,45%)`)
- **Layout**: Single-column, ATS-optimized

To customize fonts/colors, edit the CSS in the template. Update font files in `fonts/` if switching fonts.

## Examples (`examples/`)

Fictional samples for structure and tone — not real candidates. See [`examples/README.md`](../examples/README.md) for markdown CVs, an optional article-digest example, and a sample report layout. Use them as templates, then replace every detail with your own before applying.

## Interview prep (`interview-prep/story-bank.md`)

Optional file that holds curated STAR+R stories across evaluations. Modes that produce interview prep (for example Block F in a single-offer evaluation) can append or reference stories here so you reuse the same narratives instead of starting from scratch before each interview. The shipped file is a scaffold with formatting comments; replace placeholders with your own content as the bank fills in. If you prefer a different path, keep the same structure and point your workflow at your copy.

## Negotiation Scripts (modes/_shared.md)

The negotiation section provides frameworks for salary discussions. Replace the example scripts with your own:
- Target ranges
- Geographic arbitrage strategy
- Pushback responses

## Hooks (Optional)

JobForge can integrate with external systems via Claude Code hooks. Example hooks:

```json
{
  "hooks": {
    "SessionStart": [{
      "hooks": [{
        "type": "command",
        "command": "echo 'JobForge session started'"
      }]
    }]
  }
}
```

Save hooks in `.claude/settings.json`.

## States (templates/states.yml)

The canonical states rarely need changing. If you add new states, update:
1. `templates/states.yml`
2. `normalize-statuses.mjs` (alias mappings)
3. `modes/_shared.md` (any references)
4. `merge-tracker.mjs` — TSV merges validate the status column against labels in `templates/states.yml`; extend the parser or built-in fallbacks there if you add states before running `npm run merge`; see [batch/README.md](../batch/README.md)
5. `verify-pipeline.mjs` — extend `CANONICAL_STATUSES` (and `ALIASES` if needed) so the health check stays aligned with `states.yml`; see [Architecture — Pipeline Integrity](ARCHITECTURE.md#pipeline-integrity)
