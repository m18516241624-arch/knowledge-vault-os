# Invocation Policy

## Goal

When Codex uses the vault, it should produce better work with less repeated explanation from the user.

## Reading Order

1. `全局索引.md`
2. `80-agent-briefs/knowledge-vault-entry.md`
3. `80-agent-briefs/current-focus.md`
4. Relevant project, decision, method, context, or skill pages
5. Evidence packets only when the task needs traceability or the compiled page is insufficient

## Context Pack

Before acting, compress what matters into:

- Task goal.
- Relevant user or organization context.
- Stable decisions.
- Active constraints.
- Sensitive boundaries.
- Open uncertainty.

## Answering Rules

- Lead with the decision-relevant conclusion.
- Cite vault paths when the user needs traceability.
- Say when vault information may be stale.
- Do not expose private or company-confidential details unless the user has asked within an appropriate local context.
- If the task creates durable conclusions, write them back into the right vault page.

## Good Invocation Prompt

```text
Use my knowledge vault first. Read the entry brief, current focus, and the relevant project or method pages. Then help me complete this task. If you create a stable conclusion, write it back to the vault.
```
