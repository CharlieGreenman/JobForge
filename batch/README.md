# Batch evaluation

This folder holds the **parallel batch runner** for processing many job URLs with headless `claude -p` workers. For how batch fits into the rest of JobForge, see [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md).

## What ships in git

| Path | Role |
|------|------|
| `batch-runner.sh` | Orchestrator: parallelism, state, retries, resume |
| `batch-prompt.md` | Prompt template passed to each worker |
| `README.md` | This file |

## Local-only files (gitignored when present)

Per [`.gitignore`](../.gitignore): `batch-input.tsv`, `batch-state.tsv`, `logs/*`, and `tracker-additions/*.tsv`. Empty dirs use `.gitkeep` where needed so the tree exists in a fresh clone.

## Input: `batch-input.tsv`

Tab-separated UTF-8 text, with a **header row** (the runner skips the literal `id` header):

| Column | Required | Description |
|--------|----------|-------------|
| `id` | Yes | Numeric offer id (used for state and ordering) |
| `url` | Yes | Job posting URL |
| `source` | No | Short label (e.g. board or company) |
| `notes` | No | Free text for your own context |

Example:

```text
id	url	source	notes
1	https://jobs.example.com/123	greenhouse	Staff engineer
2	https://boards.example.com/456	ashby	Remote OK
```

Create this file in **`batch/`** next to the runner (see `batch-runner.sh` constants). Then:

```bash
./batch/batch-runner.sh --dry-run   # from repo root
./batch/batch-runner.sh
```

Options and file layout: `./batch/batch-runner.sh --help`.

## After a batch run

Workers write one-line TSV rows under `batch/tracker-additions/`. Merge them into your tracker from the repo root:

```bash
npm run merge
```

(`node merge-tracker.mjs` — same as `npm run merge`; see [CONTRIBUTING.md](../CONTRIBUTING.md#development).)

## Prerequisites

The runner expects the `claude` CLI on `PATH` and a valid `batch-prompt.md`. It creates `reports/` and tracker paths as needed; ensure your usual JobForge setup (`cv.md`, profile, etc.) matches what `batch-prompt.md` assumes.
