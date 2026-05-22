---
title: Knowledge Vault OS Agent Instructions
type: agent-brief
domain: ai-agent
status: active
sensitivity: public
updated: 2026-05-22
tags: [agent, codex, plugin]
---

# Agent Instructions

This repository is a public-safe Codex plugin package.

## Rules

- Keep the package generic. Do not add real private vault content.
- Do not include raw chat exports, company-confidential data, credentials, dashboard private indexes, or machine-specific absolute paths.
- Skill details belong in `skills/knowledge-vault-os/`.
- User-facing install and release documentation belongs in `docs/`.
- Scripts must be safe by default and support dry-run where writes affect user-level Codex or agent configuration.
- Run `npm run validate` after meaningful changes.
