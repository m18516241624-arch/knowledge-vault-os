# Knowledge Vault OS for Codex

把 Codex 变成一个本地优先的个人知识库操作员。

Knowledge Vault OS 不是普通 Obsidian 模板，也不是“把资料丢进 RAG 问答”。它打包的是一套可安装、可复用的知识工作流：

```text
感知 -> 来源登记 -> 证据入账 -> 分块摘要 -> 晋升判断 -> 主题页编译 -> Agent 调用
```

## 适合谁

- 想用 Markdown / Obsidian 做长期个人知识主库的人。
- 想让 Codex 在做事前读取个人上下文、项目结论和方法论的人。
- 不想把私密聊天、公司资料、账号数据直接丢进外部知识库的人。
- 想把日常资料持续整理成可复用项目页、决策页、方法页和 Agent Brief 的人。

## 核心原则

- Markdown 是唯一长期主库。
- Codex memory、浏览器、聊天记录、iMA 类工具、向量库、dashboard 都只是辅助层。
- 新来源先进入证据层，再判断是否晋升为稳定知识。
- 私密和公司机密材料默认只保留高层抽象结论，不复制原文进长期主题页。

## 包里有什么

```text
knowledge-vault-os/
  .codex-plugin/plugin.json
  skills/knowledge-vault-os/
  assets/vault-template/
  dashboard-lite/
  scripts/
  docs/
```

- `.codex-plugin/plugin.json`：Codex 插件 manifest。
- `skills/knowledge-vault-os/SKILL.md`：主 Skill，负责初始化、接入、编译、调用和维护。
- `skills/knowledge-vault-os/references/`：来源治理、编译规则、调用策略。
- `assets/vault-template/`：可直接初始化的 Markdown vault 模板。
- `dashboard-lite/`：本地静态轻量驾驶舱。
- `scripts/`：本地安装、初始化、来源包、daily capture、inbox 编译、dashboard 索引、lint、打包和验证脚本。
- `docs/`：安装、架构、隐私和发布检查清单。

## 快速开始

```bash
git clone https://github.com/m18516241624-arch/knowledge-vault-os.git
cd knowledge-vault-os
npm install
npm run validate
```

初始化一个本地 vault：

```bash
node scripts/init-vault.mjs ~/Documents/MyKnowledgeVault
node scripts/wiki-lint.mjs ~/Documents/MyKnowledgeVault
```

生成一个来源包：

```bash
node scripts/scan-sources.mjs ~/Documents/MyKnowledgeVault README.md --level L1 --sensitivity private --decision inbox
```

扫描本地工作目录并生成 daily capture：

```bash
node scripts/daily-capture.mjs ~/Documents/MyKnowledgeVault ~/Documents/MyProject --target-date YYYY-MM-DD
```

每次扫描都会生成独立来源包，重复运行不会覆盖同一天已有记录。

安全编译明确标记为 `decision: compile` 的来源包：

```bash
node scripts/compile-inbox.mjs ~/Documents/MyKnowledgeVault --dry-run
node scripts/compile-inbox.mjs ~/Documents/MyKnowledgeVault
```

生成 dashboard-lite 数据：

```bash
node scripts/build-dashboard-lite.mjs ~/Documents/MyKnowledgeVault
```

进行 dashboard-lite 浏览器截图验收：

```bash
npm run browsers:install
npm run verify:dashboard
```

本地安装到 Codex 插件市场结构：

```bash
npm run install:local -- --dry-run
npm run install:local
```

打包发布文件：

```bash
npm run package:plugin
```

## 在 Codex 里怎么用

安装后可以直接对 Codex 说：

```text
Use Knowledge Vault OS to initialize a local Markdown knowledge vault.
```

```text
Use Knowledge Vault OS to ingest this folder into my vault as source packets.
```

```text
Use my vault as context before helping with this task.
```

```text
Compile my inbox into stable project, decision, and method notes.
```

## 文档

- [安装说明](docs/INSTALL.md)
- [架构说明](docs/ARCHITECTURE.md)
- [隐私模型](docs/PRIVACY.md)
- [更新记录](CHANGELOG.md)
- [v0.2 范围](docs/v0.2-scope.md)
- [发布检查清单](docs/RELEASE-CHECKLIST.md)

## 当前状态

v0.2 已补齐本地 daily capture、保守 inbox 编译和 dashboard-lite。它仍然不包含账号连接器、云同步、向量数据库、自动聊天记录抓取或团队权限系统。

## License

MIT
