---
title: Source Registry
type: source-registry
domain: knowledge-vault
status: active
sensitivity: private
updated: 2026-05-22
tags: [maintenance, source-registry, ingestion]
---

# Source Registry

Register sources before compiling them into long-lived knowledge.

## Source Levels

| Level | Meaning | Default Handling |
|---|---|---|
| L0 | Existing Markdown vault notes | Read and update directly |
| L1 | Local project files, public pages, public repositories | Packet first, compile after review |
| L2 | Personal notes, browser captures, screenshots, external libraries | Inbox first |
| L3 | Authorized account exports | Scoped summaries only |
| L4 | Chats, salary, employees, candidates, customers, family, confidential work | Evidence only by default |

## Registered Sources

| source_id | Source | Level | Intake Method | Default Entry | Auto Compile | Risk | Rule |
|---|---|---:|---|---|---|---|---|
| vault_markdown | Markdown vault notes | L0 | local read | original file | yes | stale or conflicting facts | use frontmatter and topic pages as current truth |
| local_projects | Local project files | L1/L2 | source packet | `00-inbox/source-packets/` | review | temporary build artifacts | compile only reusable conclusions |
| public_web | Public web pages | L1/L2 | source packet with URL | `00-inbox/source-packets/` | review | stale facts | verify dates before external use |

## Promotion Rules

A source can be promoted only when it is traceable, reusable, safe, clearly targeted, and reconciled with old knowledge.
