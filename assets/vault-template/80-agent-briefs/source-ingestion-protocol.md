---
title: Source Ingestion Protocol
type: agent-brief
domain: ai-agent
status: active
sensitivity: private
updated: 2026-05-22
tags: [agent-brief, ingestion, privacy]
---

# Source Ingestion Protocol

The goal is not to save everything. The goal is to turn daily information into traceable evidence, then compile stable conclusions.

## Steps

1. Read `_maintenance/source-registry.md`.
2. Classify the source level and sensitivity.
3. Create a source packet in `00-inbox/source-packets/`.
4. Summarize facts and candidate stable claims.
5. Decide whether to discard, log, keep in inbox, compile, or review.
6. Compile only when the promotion checklist passes.

## Source Packet Minimum Fields

- `source_id`
- `captured_at`
- `source_path_or_url`
- `source_window`
- `sensitivity`
- `summary`
- `stable_claims`
- `promotion_target`
- `decision`
- `risk_note`

## Stop Rules

Stop before compilation when the source is unregistered, untraceable, high-sensitive, conflicting, or likely to be sent to an external platform without explicit confirmation.
