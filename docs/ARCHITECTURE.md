# 架构说明

Knowledge Vault OS 的核心不是文件夹结构，而是一条知识晋升链路。

```text
perceive
  -> register source
  -> store evidence
  -> summarize blocks
  -> promote stable claims
  -> compile topic pages
  -> call from Codex
```

## 五层模型

### 1. 来源治理层

判断资料从哪里来、敏感等级是什么、能不能自动编译。

关键文件：

- `_maintenance/source-registry.md`
- `80-agent-briefs/source-ingestion-protocol.md`

### 2. 证据层

原始资料或来源包先进入证据层，避免直接污染长期知识。

关键目录：

- `00-inbox/`
- `00-inbox/source-packets/`
- `_maintenance/capture-ledger/`
- `scripts/daily-capture.mjs`

### 3. 知识编译层

只有稳定、可追溯、可复用、已脱敏的结论才进入主题页。

关键目录：

- `20-projects/`
- `30-decisions/`
- `40-methods/`
- `50-context/`
- `60-ai-skills/`
- `scripts/compile-inbox.mjs`

### 4. Agent 调用层

给 Codex 和其他 agent 快速读取压缩上下文。

关键文件：

- `全局索引.md`
- `80-agent-briefs/knowledge-vault-entry.md`
- `80-agent-briefs/current-focus.md`
- `80-agent-briefs/wiki-maintenance-protocol.md`

### 5. 本地可视化层

轻量 dashboard 只读本地 vault，生成一个本地 JSON 索引，再由静态页面展示。

关键文件：

- `scripts/build-dashboard-lite.mjs`
- `dashboard-lite/index.html`
- `dashboard-lite/vault-lite.json`（本地生成，默认不应提交）

## 为什么不用纯 RAG

纯 RAG 更像“临时搜索答案”。Knowledge Vault OS 更像“持续把信息编译成可复用知识”。

RAG 可以作为检索层，但不能成为唯一事实源。稳定事实仍应回写 Markdown。

## 插件结构

```text
.codex-plugin/plugin.json
skills/knowledge-vault-os/SKILL.md
skills/knowledge-vault-os/references/
assets/vault-template/
dashboard-lite/
scripts/
docs/
```

## 成功标准

- 新来源不会绕过证据层。
- 高敏信息不会直接进入主题页。
- 重要结论不会只留在聊天历史。
- Codex 能按入口文件快速理解当前上下文。
- vault 能被 Git、Obsidian 和普通文本工具长期维护。
