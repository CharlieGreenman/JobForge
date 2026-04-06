# Saved job descriptions (`jds/`)

Use this folder for **markdown copies of job descriptions** you want to evaluate through the pipeline without a live URL (paywalled boards, exports, or text you pasted from email).

## How it connects to the pipeline

1. Add a line to **`data/pipeline.md`** (create the file if needed; see [docs/SETUP.md](../docs/SETUP.md)) using the `local:` prefix:

   ```markdown
   - [ ] local:jds/example-role-at-acme.md
   ```

2. Run `/job-forge pipeline` (or your usual pipeline flow). The agent resolves `local:jds/{filename}` to **`jds/{filename}`** in the repo root and reads that file as the JD source. See [`modes/pipeline.md`](../modes/pipeline.md).

## Conventions

- One posting per file is easiest to track; name files so you recognize the role and company (slug-style names work well).
- Keep content as plain markdown or pasted JD text; no special front matter is required by the tooling described above.
- For a **fictional** structural example (safe to commit), see [`examples/sample-jd.md`](../examples/sample-jd.md). Your real files stay under `jds/` and remain gitignored.

## Git

Individual `*.md` JD files under `jds/` are **gitignored** so real postings and employer text stay local. Only placeholders such as **`.gitkeep`** and **this `README.md`** are intended to ship with the repo.
