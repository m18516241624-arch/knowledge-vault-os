# Security Policy

Knowledge Vault OS is local-first. It does not include account connectors, cloud sync, telemetry, vector database uploads, or chat-platform ingestion in v0.2.

## Sensitive Data Boundary

Do not put these into a public repository:

- Private vault notes.
- Raw chat exports.
- Company-confidential files.
- Salary, employee, candidate, customer, supplier, or family details.
- API keys, cookies, tokens, passwords, or screenshots containing credentials.
- Generated dashboard indexes that may contain private summaries.
- `dashboard-lite/vault-lite.json` when built from a private vault.

## Reporting Issues

If you find a security or privacy issue, open a private issue or contact the maintainer before publishing exploit details.

## Maintainer Rule

Before every public release, run:

```bash
npm run validate
rg -n "/Users/|PersonalKnowledgeVault|salary|token|api[_-]?key|cookie|password|secret" . \
  --glob '!SECURITY.md' \
  --glob '!docs/RELEASE-CHECKLIST.md' \
  --glob '!scripts/validate-package.mjs'
```

Review every hit manually before publishing.
