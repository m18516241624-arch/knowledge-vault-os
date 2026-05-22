# Contributing

Contributions are welcome, but this project has one firm boundary: keep the package generic and public-safe.

## Good Contributions

- Better vault templates.
- Clearer source packet fields.
- Safer lint rules.
- Better installation scripts.
- Documentation improvements.
- Local-first integrations that keep private data under user control.

## Avoid

- Bundling real personal or company data.
- Adding default cloud uploads.
- Treating vector indexes as the source of truth.
- Directly ingesting private chats or account exports without an evidence-first privacy model.

## Before Opening A PR

```bash
npm run validate
npm run package:plugin
```

Also scan for private paths, secrets, and machine-specific assumptions.
