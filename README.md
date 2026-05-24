# Knowledge Vault OS for Codex

> 中文：把 Codex 变成一个本地优先的个人知识库操作员和长期上下文大脑。  
> English: Turn Codex into a local-first knowledge-vault operator and long-term context brain.

[中文介绍](#中文介绍) · [English Introduction](#english-introduction) · [快速开始 / Quick Start](#快速开始--quick-start) · [文档 / Docs](#文档--docs)

## 中文介绍

Knowledge Vault OS 是一套面向 Codex 的本地优先知识库操作系统。

它不是普通 Obsidian 模板，也不是“把资料丢进 RAG 问答”。它要解决的是一个更基础的问题：每次使用 Codex 时，你不应该反复解释自己是谁、项目走到哪一步、哪些判断已经做过、哪些边界不能碰。

它把 Markdown / Obsidian 主库、来源包、项目页、决策页、方法页和 Agent Brief 串成一套可安装、可验证、可复用的工作流，让 Codex 在开始做事前先读取你的长期上下文。

### 它解决什么

- 让 Codex 不再从零开始理解你的项目和偏好。
- 把聊天、网页、文档、会议和项目文件先变成证据，再晋升为稳定知识。
- 把个人判断、项目结论和方法论沉淀成可反复调用的 Markdown 页面。
- 让私密和公司机密材料默认留在本地，只抽象出可复用的高层结论。
- 给长期知识库增加轻量 dashboard、lint、验证和发布前检查。

### 核心工作流

```text
感知 -> 来源登记 -> 证据入账 -> 分块摘要 -> 晋升判断 -> 主题页编译 -> Agent 调用
```

这套流程的核心不是“存更多资料”，而是让资料逐步变成 Codex 可以安全调用的长期语境。

### 适合谁

- 想用 Markdown / Obsidian 做长期个人知识主库的人。
- 想让 Codex 在做事前读取个人上下文、项目结论和方法论的人。
- 不想把私密聊天、公司资料、账号数据直接丢进外部知识库的人。
- 想把日常资料持续整理成项目页、决策页、方法页和 Agent Brief 的人。

## English Introduction

Knowledge Vault OS is a local-first knowledge operating system for Codex.

It is not just an Obsidian template, and it is not a generic RAG chatbot over your files. It solves a more fundamental problem: Codex should not need you to repeat who you are, what a project is about, what decisions have already been made, and which boundaries must be respected every time you start a task.

Knowledge Vault OS connects a Markdown / Obsidian vault, source packets, project notes, decision records, method pages, and agent briefs into an installable, verifiable, reusable workflow. It helps Codex read your long-term context before it starts working.

### What It Solves

- Codex can start from your existing project context instead of a blank slate.
- Chats, web pages, documents, meetings, and project files enter an evidence layer before becoming stable knowledge.
- Personal judgment, project conclusions, and working methods become reusable Markdown pages.
- Private and company-confidential material stays local by default, while only high-level conclusions are promoted.
- Your knowledge vault gains lightweight dashboards, linting, validation, and release checks.

### Core Workflow

```text
Perceive -> Register Source -> Ledger Evidence -> Chunk Summary -> Promotion Decision -> Compile Topic Pages -> Invoke Agent Context
```

The goal is not to store more files. The goal is to turn scattered material into safe, structured, long-term context that Codex can actually use.

### Who It Is For

- People who use Markdown / Obsidian as a long-term personal knowledge base.
- Codex users who want project context, decisions, and methods available before each task.
- Users who do not want to upload private chats, company documents, or account data into external knowledge systems.
- Builders who want daily work to become reusable project notes, decision records, method pages, and agent briefs.

## 核心原则 / Principles

- Markdown is the durable source of truth. / Markdown 是长期事实主库。
- Codex memory, browsers, chat exports, iMA-like tools, vector stores, and dashboards are auxiliary layers. / Codex 记忆、浏览器、聊天记录、iMA 类工具、向量库和 dashboard 都是辅助层。
- New material enters the evidence layer before promotion. / 新来源先进入证据层，再判断是否晋升为稳定知识。
- Sensitive material should be summarized, not copied wholesale into public or reusable topic pages. / 私密和公司机密材料默认只保留高层抽象结论，不复制原文进长期主题页。

## 包里有什么 / What's Included

```text
knowledge-vault-os/
  .codex-plugin/plugin.json
  skills/knowledge-vault-os/
  assets/vault-template/
  dashboard-lite/
  scripts/
  docs/
```

- `.codex-plugin/plugin.json`: Codex plugin manifest.
- `skills/knowledge-vault-os/SKILL.md`: main Skill for initialization, ingestion, compilation, invocation, and maintenance.
- `skills/knowledge-vault-os/references/`: source governance, compile rules, and invocation strategy.
- `assets/vault-template/`: a generic Markdown vault template.
- `dashboard-lite/`: local static dashboard for vault inspection.
- `scripts/`: install, initialize, source scanning, daily capture, inbox compilation, dashboard build, lint, package, and validation scripts.
- `docs/`: installation, architecture, privacy, product introduction, and release checklist.

## 快速开始 / Quick Start

```bash
git clone https://github.com/m18516241624-arch/knowledge-vault-os.git
cd knowledge-vault-os
npm install
npm run validate
```

初始化一个本地 vault / Initialize a local vault:

```bash
node scripts/init-vault.mjs ~/Documents/MyKnowledgeVault
node scripts/wiki-lint.mjs ~/Documents/MyKnowledgeVault
```

生成一个来源包 / Generate a source packet:

```bash
node scripts/scan-sources.mjs ~/Documents/MyKnowledgeVault README.md --level L1 --sensitivity private --decision inbox
```

扫描本地工作目录并生成 daily capture / Scan a local work folder and create daily capture records:

```bash
node scripts/daily-capture.mjs ~/Documents/MyKnowledgeVault ~/Documents/MyProject --target-date YYYY-MM-DD
```

安全编译明确标记为 `decision: compile` 的来源包 / Safely compile packets explicitly marked as `decision: compile`:

```bash
node scripts/compile-inbox.mjs ~/Documents/MyKnowledgeVault --dry-run
node scripts/compile-inbox.mjs ~/Documents/MyKnowledgeVault
```

生成 dashboard-lite 数据 / Build dashboard-lite data:

```bash
node scripts/build-dashboard-lite.mjs ~/Documents/MyKnowledgeVault
```

进行 dashboard-lite 浏览器截图验收 / Run dashboard-lite browser screenshot verification:

```bash
npm run browsers:install
npm run verify:dashboard
```

本地安装到 Codex 插件市场结构 / Install into the local Codex plugin marketplace structure:

```bash
npm run install:local -- --dry-run
npm run install:local
```

打包发布文件 / Package the plugin:

```bash
npm run package:plugin
```

## 在 Codex 里怎么用 / Using It In Codex

安装后可以直接对 Codex 说 / After installation, you can say:

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

## 文档 / Docs

- [安装说明 / Installation](docs/INSTALL.md)
- [项目介绍页 / Product Introduction](docs/INTRODUCTION.html)
- [架构说明 / Architecture](docs/ARCHITECTURE.md)
- [隐私模型 / Privacy Model](docs/PRIVACY.md)
- [更新记录 / Changelog](CHANGELOG.md)
- [v0.2 范围 / v0.2 Scope](docs/v0.2-scope.md)
- [发布检查清单 / Release Checklist](docs/RELEASE-CHECKLIST.md)

## 当前状态 / Current Status

v0.2 includes local daily capture, conservative inbox compilation, dashboard-lite, package validation, and browser screenshot verification.

It does not yet include account connectors, cloud sync, vector databases, automatic chat-history extraction, or team permission systems.

v0.2 已补齐本地 daily capture、保守 inbox 编译、dashboard-lite、包验证和浏览器截图验收。

它仍然不包含账号连接器、云同步、向量数据库、自动聊天记录抓取或团队权限系统。

## License

MIT
