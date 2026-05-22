# GitHub 发布检查清单

## 内容检查

- [ ] README 能解释项目价值、安装方式和使用方式。
- [ ] `docs/INSTALL.md` 可跟着执行。
- [ ] `docs/ARCHITECTURE.md` 解释清楚五层模型。
- [ ] `docs/PRIVACY.md` 明确本地优先和敏感边界。
- [ ] `SECURITY.md` 没有过度承诺。
- [ ] `CHANGELOG.md` 已记录本次版本变化。
- [ ] `.github/workflows/validate.yml` 能在 GitHub 上跑通。
- [ ] `LICENSE` 存在。

## 技术检查

```bash
npm run validate
npm run browsers:install
npm run verify:dashboard
npm run package:plugin
```

## 隐私扫描

```bash
rg -n "/Users/|PersonalKnowledgeVault|salary|token|api[_-]?key|cookie|password|secret" . \
  --glob '!SECURITY.md' \
  --glob '!docs/RELEASE-CHECKLIST.md' \
  --glob '!scripts/validate-package.mjs'
```

每个命中都必须人工确认。

## GitHub 首次发布建议

1. 只发布 `knowledge-vault-os/` 作为仓库根目录，不发布上层 ops workspace。
2. 首版 tag 使用 `v0.2.0`。
3. Release notes 强调这是本地优先骨架，不包含账号连接器。
4. README 中的仓库地址在最终建库后统一替换为真实 URL。
5. 发布前重新跑一次 demo vault 初始化和 lint。
6. 首次 push 后确认 GitHub Actions 的 Validate workflow 通过。
7. 检查 `.tmp/dashboard-lite-screenshots/` 中的桌面和手机截图。

## v0.2 Release Notes 草稿

```text
Knowledge Vault OS v0.2.0

Local-first Codex knowledge vault workflow package.

Includes:
- Codex plugin manifest
- Main Knowledge Vault OS Skill
- Markdown vault template
- Source packet workflow
- Daily capture for local file evidence
- Safe compile-inbox flow for explicit source packets
- Dashboard Lite static local view
- Browser screenshot verification for Dashboard Lite
- Basic wiki lint
- Local install and packaging scripts

Not included yet:
- Cloud sync
- Vector database
- Account connectors
- Direct chat-platform ingestion
```
