# 安装说明

## 方式一：从 GitHub 克隆后本地安装

```bash
git clone https://github.com/m18516241624-arch/knowledge-vault-os.git
cd knowledge-vault-os
npm install
npm run validate
npm run install:local -- --dry-run
npm run install:local
```

安装脚本会复制当前插件包到：

```text
~/.agents/plugins/plugins/knowledge-vault-os
```

并在：

```text
~/.agents/plugins/marketplace.json
```

中注册本地插件入口。

如果 Codex 已经打开，安装后可能需要重启 Codex 或刷新插件列表。

## 方式二：只使用 vault 模板和脚本

不安装插件也可以直接初始化一个 Markdown vault：

```bash
node scripts/init-vault.mjs ~/Documents/MyKnowledgeVault
node scripts/wiki-lint.mjs ~/Documents/MyKnowledgeVault
```

扫描本地来源并写入证据层：

```bash
node scripts/daily-capture.mjs ~/Documents/MyKnowledgeVault ~/Documents/MyProject --target-date YYYY-MM-DD
```

每次扫描都会生成一个带时间戳的独立来源包，适合试跑和重复运行。

编译已经明确标记的来源包：

```bash
node scripts/compile-inbox.mjs ~/Documents/MyKnowledgeVault --dry-run
node scripts/compile-inbox.mjs ~/Documents/MyKnowledgeVault
```

生成本地 dashboard-lite 数据：

```bash
node scripts/build-dashboard-lite.mjs ~/Documents/MyKnowledgeVault
```

验证 dashboard-lite 浏览器截图：

```bash
npm run browsers:install
npm run verify:dashboard
```

截图会写入 `.tmp/dashboard-lite-screenshots/`，该目录默认不会进入发布包。

## 方式三：打包后手动分发

```bash
npm run package:plugin
```

输出文件位于：

```text
dist/knowledge-vault-os-0.2.0.tar.gz
```

## 卸载

删除本地插件目录：

```bash
rm -rf ~/.agents/plugins/plugins/knowledge-vault-os
```

然后从 `~/.agents/plugins/marketplace.json` 中移除 `knowledge-vault-os` 条目。

卸载插件不会删除你用它初始化出来的 vault。
