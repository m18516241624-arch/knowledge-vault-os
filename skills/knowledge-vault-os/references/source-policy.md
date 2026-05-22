# Source Policy

## Principle

More collection is not better knowledge. Every source must be traceable, classified, and routed before it can become durable knowledge.

## Source Levels

| Level | Meaning | Default Handling |
|---|---|---|
| L0 | Existing Markdown vault notes | Read directly and update by maintenance rules |
| L1 | Local project files, public pages, public repositories | Can become packets and may compile after review |
| L2 | Personal notes, browser captures, screenshots, iMA-style libraries | Inbox first, compile only after judgment |
| L3 | Authorized account exports such as mail, calendar, cloud docs | Scope-limited summaries only |
| L4 | Chats, salary, employee, candidate, customer, family, or company-confidential material | Evidence only by default; compile abstracted conclusions only |

## Source Packet Fields

Every source packet should include:

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

## Decisions

- `discard`: no durable value.
- `log-only`: worth tracking but not compiling.
- `inbox`: keep as evidence for later.
- `compile`: safe and useful to promote now.
- `review`: needs human judgment.

## Stop Rules

Do not compile when:

- The source is not traceable.
- The source contains high-sensitive raw details.
- The claim is a guess or one-time event.
- The destination page is unclear.
- The new claim conflicts with old knowledge and the relationship is unresolved.
