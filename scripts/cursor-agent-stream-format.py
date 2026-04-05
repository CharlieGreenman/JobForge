#!/usr/bin/env python3
"""
Pretty-print Cursor Agent CLI stream-json (NDJSON) for humans.

Reads one JSON object per line from stdin; prints assistant text to stdout
and progress (session, tools) to stderr. See:
https://cursor.com/docs/cli/reference/output-format
"""

from __future__ import annotations

import json
import sys


def _assistant_text(obj: dict) -> str:
    parts: list[str] = []
    for block in (obj.get("message") or {}).get("content") or []:
        if isinstance(block, dict) and block.get("type") == "text":
            parts.append(str(block.get("text") or ""))
    return "".join(parts)


def _describe_tool_call(tool_call: dict, *, completed: bool) -> str:
    if not isinstance(tool_call, dict) or not tool_call:
        return "?"

    if "readToolCall" in tool_call:
        inner = tool_call["readToolCall"]
        args = inner.get("args") or {}
        path = args.get("path", "?")
        if completed:
            res = inner.get("result") or {}
            succ = (res.get("success") or {}) if isinstance(res, dict) else {}
            lines = succ.get("totalLines")
            if lines is not None:
                return f"read {path} ({lines} lines)"
            return f"read {path} (done)"
        return f"read {path}"

    if "writeToolCall" in tool_call:
        inner = tool_call["writeToolCall"]
        args = inner.get("args") or {}
        path = args.get("path", "?")
        if completed:
            res = inner.get("result") or {}
            succ = (res.get("success") or {}) if isinstance(res, dict) else {}
            lines = succ.get("linesCreated")
            if lines is not None:
                return f"write {path} (+{lines} lines)"
            return f"write {path} (done)"
        return f"write {path}"

    fn = tool_call.get("function")
    if isinstance(fn, dict):
        name = fn.get("name") or "function"
        raw = fn.get("arguments")
        if isinstance(raw, str):
            arg_s = raw.replace("\n", " ").strip()
            if len(arg_s) > 160:
                arg_s = arg_s[:160] + "…"
        else:
            arg_s = json.dumps(raw, default=str) if raw is not None else ""
            if len(arg_s) > 160:
                arg_s = arg_s[:160] + "…"
        return f"{name} {arg_s}".strip()

    for key, inner in tool_call.items():
        if isinstance(inner, dict) and key.endswith("ToolCall"):
            label = key[: -len("ToolCall")] or key
            args = inner.get("args")
            if isinstance(args, dict):
                return f"{label} {json.dumps(args, default=str)[:200]}"
            return f"{label} …"

    return json.dumps(tool_call, default=str)[:200]


def main() -> None:
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            o = json.loads(line)
        except json.JSONDecodeError:
            print(line, file=sys.stderr, flush=True)
            continue

        t = o.get("type")
        if t == "thinking":
            continue
        if t == "system":
            sid = str(o.get("session_id") or "")
            sid_short = (sid[:8] + "…") if len(sid) > 8 else sid
            print(
                f"\n[cursor-agent] session {sid_short}  model={o.get('model', '?')!s}  cwd={o.get('cwd', '')}",
                file=sys.stderr,
                flush=True,
            )
        elif t == "user":
            txt = _assistant_text(o)
            if len(txt) > 600:
                txt = txt[:600] + "…"
            print(f"\n[cursor-agent] --- prompt ({len(txt)} chars) ---\n{txt}\n", file=sys.stderr, flush=True)
        elif t == "assistant":
            sys.stdout.write(_assistant_text(o))
            sys.stdout.flush()
        elif t == "tool_call":
            sub = o.get("subtype")
            tc = o.get("tool_call") if isinstance(o.get("tool_call"), dict) else {}
            desc = _describe_tool_call(tc, completed=(sub == "completed"))
            if sub == "started":
                print(f"\n[cursor-agent] tool ▶ {desc}", file=sys.stderr, flush=True)
            elif sub == "completed":
                print(f"[cursor-agent] tool ✓ {desc}", file=sys.stderr, flush=True)
            else:
                print(f"[cursor-agent] tool {sub!s} {desc}", file=sys.stderr, flush=True)
        elif t == "result":
            dur = o.get("duration_ms")
            err = o.get("is_error")
            sub = o.get("subtype")
            print(
                f"\n[cursor-agent] result  subtype={sub!s}  duration_ms={dur!s}  is_error={err!s}",
                file=sys.stderr,
                flush=True,
            )
        else:
            # Forward-compatible: show unknown types lightly
            print(f"[cursor-agent] event type={t!s}", file=sys.stderr, flush=True)


if __name__ == "__main__":
    main()
