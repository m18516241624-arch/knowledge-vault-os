---
name: knowledge-vault-os
description: Use when the user wants Codex to initialize, operate, maintain, ingest into, compile, or call a local Markdown/Obsidian knowledge vault. Covers personal knowledge operating systems, source intake, evidence packets, LLM wiki maintenance, project/decision/method notes, agent briefs, and local-first Codex knowledge workflows. Trigger for requests like "initialize my knowledge vault", "ingest these sources", "compile my inbox", "use my vault as context", "turn this into durable knowledge", or "package my knowledge base workflow for others".
---

# Knowledge Vault OS

Knowledge Vault OS turns Codex into an operator for a local-first Markdown knowledge base.

Core loop:

```text
perceive -> register source -> store evidence -> summarize blocks -> promote stable claims -> compile topic pages -> call from Codex
```

## Route

Choose one primary route before acting:

1. **Initialize**: create a new vault from `assets/vault-template/`.
2. **Ingest**: turn files, folders, links, exports, or notes into source packets.
3. **Compile**: promote stable evidence into project, decision, method, context, skill, or agent-brief pages.
4. **Daily Capture**: scan local source folders for changed files and write source packets, capture ledgers, and daily-log entries.
5. **Compile Inbox**: promote only source packets explicitly marked for compilation.
6. **Dashboard Lite**: build a local static dashboard index for vault inspection.
7. **Call**: read the vault to build task context before answering or executing.
8. **Maintain**: run lint, update ledgers, refresh briefs, and reduce stale or orphaned knowledge.

If the user asks for a plan only, do not write files. If they approve execution, continue end to end.

## Source Of Truth

- Markdown/Obsidian is the durable source of truth.
- Codex memory, chat logs, browser history, dashboards, iMA-style tools, and vector indexes are helper layers.
- Stable conclusions must be written back into Markdown topic pages.
- Raw sensitive material stays in evidence or source systems unless explicitly authorized and abstracted.

## What To Read

- For source intake, read `references/source-policy.md`.
- For promotion and wiki maintenance, read `references/compile-policy.md`.
- For using the vault during real work, read `references/invocation-policy.md`.

## Initialize

Use the root script when available:

```bash
node scripts/init-vault.mjs <target-vault-path>
```

Then run:

```bash
node scripts/wiki-lint.mjs <target-vault-path>
```

Do not overwrite an existing vault without explicit confirmation or a safe merge mode.

## Ingest

For every new source:

1. Classify sensitivity and source level.
2. Create a source packet in `00-inbox/source-packets/`.
3. Include path, time window, summary, candidate stable claims, and promotion target.
4. Stop before topic-page compilation if evidence is unclear or sensitive boundaries are unresolved.

Use:

```bash
node scripts/scan-sources.mjs <vault-path> <source-path-or-url> [...]
```

## Daily Capture

Use this when the user wants a repeatable local scan, not deep semantic compilation:

```bash
node scripts/daily-capture.mjs <vault-path> <source-path> [...] --target-date YYYY-MM-DD
```

The script records changed files into:

- `00-inbox/source-packets/YYYY-MM-DD-daily-capture-<timestamp>.md`
- `_maintenance/capture-ledger/YYYY-MM.md`
- `_maintenance/daily-log.md`

It creates a separate source packet for each run and does not decide that evidence is stable knowledge.

## Compile

Promote only when the claim is traceable, reusable, abstracted to a safe level, and has a clear target page.

Preferred destinations:

- `20-projects/` for project state and next actions.
- `30-decisions/` for confirmed choices and boundaries.
- `40-methods/` for reusable methods.
- `50-context/` for stable context.
- `60-ai-skills/` for agent, prompt, and automation rules.
- `80-agent-briefs/` for compressed context future agents must read.

Update existing pages before creating new ones.

For deterministic compilation, use only packets that already contain:

- `decision: compile`
- non-empty `Stable Claims`
- a safe `Promotion Target` under an allowed vault topic folder

```bash
node scripts/compile-inbox.mjs <vault-path> --dry-run
node scripts/compile-inbox.mjs <vault-path>
```

If claims or targets are unclear, keep the packet in review.

## Dashboard Lite

Build a local static dashboard index:

```bash
node scripts/build-dashboard-lite.mjs <vault-path>
```

This writes `dashboard-lite/vault-lite.json`. Treat it as local/private generated data unless the user explicitly approves sharing.

## Call

Before answering a task that depends on the user or organization context:

1. Read `全局索引.md`.
2. Read `80-agent-briefs/knowledge-vault-entry.md`.
3. Read `80-agent-briefs/current-focus.md`.
4. Read task-relevant topic pages.
5. State uncertainty when vault facts may be stale.

## Maintain

Run lint after substantive changes:

```bash
node scripts/wiki-lint.mjs <vault-path>
```

Maintenance should reduce future ambiguity. Avoid creating logs that never compile into topic pages.

## Stop Rules

Stop and ask before:

- Deleting, moving, archiving, or mass rewriting notes.
- Syncing private or company-confidential material to external platforms.
- Treating chat history, memory, or vector hits as current facts without evidence.
- Writing high-sensitive raw details into topic pages.
