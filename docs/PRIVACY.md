# 隐私模型

Knowledge Vault OS 默认本地优先，不主动上传资料。

## 数据位置

| 类型 | 默认位置 | 是否可公开 |
|---|---|---|
| 插件代码 | GitHub 仓库 | 是 |
| vault 模板 | `assets/vault-template/` | 是 |
| 用户真实 vault | 用户本机自选目录 | 否 |
| source packet | 用户真实 vault 的 `00-inbox/source-packets/` | 默认否 |
| dashboard index | 用户本机生成 | 默认否 |
| 聊天/账号导出 | 用户授权的本机路径 | 默认否 |

## 敏感等级建议

| 等级 | 内容 | 默认处理 |
|---|---|---|
| public | 公开网页、公开文档、公开仓库 | 可摘要、可引用 |
| private | 个人笔记、草稿、想法、未公开项目 | 本地保存，谨慎外发 |
| company-confidential | 公司内部资料、员工、薪资、候选人、客户 | 证据层优先，只写抽象结论 |

## 禁止默认外发

- 原始聊天记录。
- 公司内部材料。
- 候选人、员工、薪资、客户或供应商明细。
- 家庭、亲友、私人关系信息。
- API Key、Cookie、Token、密码。
- 包含私密摘要的 dashboard 数据。

## 编译原则

高敏资料可以产生方法论、流程、项目级判断，但不应把原文、姓名、明细、截图或导出包复制进长期主题页。

正确路径：

```text
raw source -> source packet -> abstract stable claim -> topic page
```
