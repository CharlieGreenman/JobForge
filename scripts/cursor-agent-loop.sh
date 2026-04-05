#!/usr/bin/env bash
# Re-exec under bash when invoked as `sh` (often dash on Linux). This script uses
# bash-only syntax ([[, arrays, PIPESTATUS, BASH_SOURCE).
if [ -z "${BASH_VERSION+x}" ]; then
  exec /usr/bin/env bash "$0" "$@"
fi

# Drive Cursor Agent CLI in a loop (non-interactive). Each iteration is one agent
# session that explores the repo, picks the next best improvement, implements it,
# runs a small quality gate, commits, and optionally pushes.
#
# Task selection (humans/agents):
#   - Read CONTRIBUTING.md ("What to Contribute") and docs/SETUP.md, docs/ARCHITECTURE.md,
#     docs/CUSTOMIZATION.md for direction.
#   - Search for open work: rg 'TODO|FIXME|HACK' modes dashboard *.mjs batch docs
#   - Improve modes/*.md, .mjs utilities, templates/, examples/, or dashboard/ (Go TUI)
#     in one cohesive slice per iteration.
#   - Do not commit personal artifacts (cv.md, config/profile.yml, data/applications.md,
#     reports/, user portals.yml) — see CONTRIBUTING.md and .gitignore.
#
# Quality gate (repo root):
#   npm run verify
#   (cd dashboard && go build .)
#   verify-pipeline.mjs exits 0 when applications.md is missing (fresh clone); still
#   run it. Dashboard build requires Go on PATH when touching dashboard/.
#   Do not require npm run sync-check (cv-sync-check.mjs) in the gate: it expects
#   personal cv.md and profile.yml and fails on a clean template checkout.
#
# Self-improve: when this script or its header comments are stale vs CONTRIBUTING.md
# or real workflows, a minimal accurate edit here is fair game for an iteration.
#
# Prerequisites:
#   - Cursor Agent CLI: https://cursor.com/install (`agent` on PATH)
#   - Auth: `agent login` or CURSOR_API_KEY
#   - Node.js for npm run verify
#   - Go (when working on dashboard/)
#   - For push: configured remote; new branches may need `git push -u origin HEAD` once
#
# Environment (optional):
#   CURSOR_AGENT_ITERATIONS   Max agent runs (default: 100)
#   CURSOR_AGENT_PUSH         If 1, git push after each iteration (default: 1). 0 = no push.
#   CURSOR_AGENT_FORCE_SHELL  If 1, pass --force for agent shell (default: 1). Set 0 for prompts.
#   CURSOR_AGENT_WORKSPACE    Repo root (default: git top-level from cwd)
#   CURSOR_AGENT_MODEL        Passed as --model (default: composer-2)
#   CURSOR_AGENT_EXTRA        Extra instructions appended to the built-in prompt
#   CURSOR_AGENT_VERBOSE      If 1, stream agent progress via stream-json (default: 1). 0 = text only
#   CURSOR_AGENT_GIT_AUTHOR_NAME   Git author/committer name (default: Charlie Greenman)
#   CURSOR_AGENT_GIT_AUTHOR_EMAIL  Git author/committer email (default: GitHub noreply for this repo)
#
# Usage:
#   ./scripts/cursor-agent-loop.sh
#   CURSOR_AGENT_ITERATIONS=3 ./scripts/cursor-agent-loop.sh
#   CURSOR_AGENT_PUSH=0 CURSOR_AGENT_VERBOSE=0 ./scripts/cursor-agent-loop.sh
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STREAM_FORMATTER="${SCRIPT_DIR}/cursor-agent-stream-format.py"

ITERATIONS="${CURSOR_AGENT_ITERATIONS:-100}"
PUSH="${CURSOR_AGENT_PUSH:-1}"
FORCE_SHELL="${CURSOR_AGENT_FORCE_SHELL:-1}"
VERBOSE="${CURSOR_AGENT_VERBOSE:-1}"
WORKSPACE="${CURSOR_AGENT_WORKSPACE:-}"
MODEL="${CURSOR_AGENT_MODEL:-composer-2}"
EXTRA="${CURSOR_AGENT_EXTRA:-}"

if ! command -v agent >/dev/null 2>&1; then
  echo "error: 'agent' not found. Install Cursor Agent CLI: https://cursor.com/install" >&2
  exit 1
fi

if [[ "$VERBOSE" == "1" ]]; then
  if ! command -v python3 >/dev/null 2>&1; then
    echo "warning: python3 not found; install Python 3 or set CURSOR_AGENT_VERBOSE=0" >&2
    VERBOSE=0
  elif [[ ! -f "$STREAM_FORMATTER" ]]; then
    echo "warning: missing ${STREAM_FORMATTER}; set CURSOR_AGENT_VERBOSE=0" >&2
    VERBOSE=0
  fi
fi

if [[ -z "$WORKSPACE" ]]; then
  WORKSPACE="$(git rev-parse --show-toplevel 2>/dev/null)" || {
    echo "error: not inside a git repository (set CURSOR_AGENT_WORKSPACE)" >&2
    exit 1
  }
fi

cd "$WORKSPACE"

current_branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)"
if [[ "$PUSH" == "1" && "$current_branch" == "main" ]]; then
  echo "warning: will push to main after each iteration; use a feature branch or CURSOR_AGENT_PUSH=0 if unintended." >&2
fi

case "$ITERATIONS" in
'' | *[!0-9]*)
  echo "error: CURSOR_AGENT_ITERATIONS must be a positive integer (got: ${ITERATIONS})" >&2
  exit 1
  ;;
esac
if [[ "$ITERATIONS" -lt 1 ]]; then
  echo "error: CURSOR_AGENT_ITERATIONS must be >= 1" >&2
  exit 1
fi

if [[ "$PUSH" == "1" ]]; then
  PUSH_TEXT="After a successful commit, do not run git push; the host script runs git push immediately after this agent exits."
else
  PUSH_TEXT="Do not run git push."
fi

GIT_AUTHOR_NAME="${CURSOR_AGENT_GIT_AUTHOR_NAME:-Charlie Greenman}"
GIT_AUTHOR_EMAIL="${CURSOR_AGENT_GIT_AUTHOR_EMAIL:-CharlieGreenman@users.noreply.github.com}"
export GIT_AUTHOR_NAME GIT_AUTHOR_EMAIL
export GIT_COMMITTER_NAME="$GIT_AUTHOR_NAME"
export GIT_COMMITTER_EMAIL="$GIT_AUTHOR_EMAIL"

build_prompt() {
  cat <<EOF
You are working on JobForge, an AI-powered job-search pipeline (Claude Code modes, Node utilities, optional Go dashboard). Respect CLAUDE.md, CONTRIBUTING.md, and .cursor rules if present.

Single iteration — do exactly one cohesive, meaningful slice of work:

1. Explore the repo. Read CLAUDE.md, CONTRIBUTING.md, and skim docs/ (SETUP, ARCHITECTURE, CUSTOMIZATION). Understand modes/, batch/, templates/, and dashboard/ when relevant.

2. Decide what to work on. Priority order:
   a) CONTRIBUTING.md "What to Contribute" and obvious gaps in docs or examples.
   b) Search for concrete hooks: e.g. \`rg 'TODO|FIXME|HACK' modes dashboard *.mjs batch docs\` (adjust paths as needed).
   c) One subsystem per iteration: a mode file in modes/, a script (*.mjs), template/example polish, or dashboard (Go) — not a repo-wide refactor.
   d) Self-improve this loop: if scripts/cursor-agent-loop.sh or its header is wrong or missing heuristics, fix it minimally when that is highest leverage.

   Do NOT commit or "fix" user-specific files: cv.md, config/profile.yml, portals.yml with personal data, data/applications.md, reports/, or other private paths called out in CONTRIBUTING / .gitignore. Upstream improvements should stay generic.

   Pick something concrete. Do NOT claim there is nothing to do.

3. Implement with minimal scope. Match existing style (markdown tone, Node ESM, Go conventions in dashboard/). Scripts should handle missing files gracefully (see CONTRIBUTING).

4. Run the quality gate from the repo root:
   npm run verify
   (cd dashboard && go build .)
   If you did not change dashboard/, the go build still must pass — fix any breakage you introduced. If Go is missing from the environment, say so clearly and stop rather than skipping silently.

5. If you made real changes: git add only what belongs to this task, then commit with author and message rules:
   - Author must be exactly: ${GIT_AUTHOR_NAME} <${GIT_AUTHOR_EMAIL}>
     Use: git commit --author="${GIT_AUTHOR_NAME} <${GIT_AUTHOR_EMAIL}>" -m "type: short description"
     (GIT_AUTHOR_*/GIT_COMMITTER_* may already be exported for this session; the result must still show that author.)
   - Subject/body: conventional prefix (feat:/fix:/chore:/docs:/test:/refactor:). Describe the change only.
   - Do not mention Cursor, Cursor Agent, ChatGPT, Claude, automation, bots, or "AI" / "generated" in the commit message.
   ${PUSH_TEXT}

6. Do not force-push. Do not rewrite published history.

7. End your response with a final line: DONE

${EXTRA}
EOF
}

agent_cmd=(agent -p --trust --workspace "$WORKSPACE")
if [[ "$VERBOSE" == "1" ]]; then
  agent_cmd+=(--output-format stream-json --stream-partial-output)
else
  agent_cmd+=(--output-format text)
fi
if [[ "$FORCE_SHELL" == "1" ]]; then
  agent_cmd+=(--force)
fi
agent_cmd+=(--model "$MODEL")

i=1
while true; do
  if [[ "$i" -gt "$ITERATIONS" ]]; then
    break
  fi

  echo "=== cursor-agent-loop: iteration $i of ${ITERATIONS} ===" >&2
  prompt="$(build_prompt)"
  agent_status=0
  if [[ "$VERBOSE" == "1" ]]; then
    set +e
    "${agent_cmd[@]}" "$prompt" | python3 "$STREAM_FORMATTER"
    pipe_statuses=("${PIPESTATUS[@]}")
    set -e
    agent_status=${pipe_statuses[0]}
    fmt_status=${pipe_statuses[1]:-0}
    if [[ "$fmt_status" -ne 0 ]]; then
      echo "error: stream formatter exited non-zero ($fmt_status) on iteration $i" >&2
      exit "$fmt_status"
    fi
  fi
  if [[ "$VERBOSE" != "1" ]]; then
    set +e
    "${agent_cmd[@]}" "$prompt"
    agent_status=$?
    set -e
  fi
  if [[ "$agent_status" -ne 0 ]]; then
    echo "error: agent exited non-zero ($agent_status) on iteration $i" >&2
    exit "$agent_status"
  fi

  if [[ "$PUSH" == "1" ]]; then
    git push
  fi

  i=$((i + 1))
done

echo "=== cursor-agent-loop: finished ${ITERATIONS} iteration(s) ===" >&2
