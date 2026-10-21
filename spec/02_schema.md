# 数据契约 · 四集合（batch② 生效）

## families
  _id(auto) | ownerId string | label string | createdAt ISO8601 | sealed boolean

## wrongs
  _id | familyId ref | source text | answer text | subject enum('计算'|'语文'|'英语'|'其他') | wrongType enum('concept'|'careless'|'method') [pending-attribution] | tags string[] | reviewed boolean | createdAt | updatedAt
<!-- 2026-10-21 EOB: subject字段已上线(②-4.5), wrongType pending-attribution归②-5归因UI -->

## profiles
  _id | familyId ref | llmProvider string | modelTag string | preference json | lastSync ISO8601

## plans
  _id | familyId ref | window enum('week'|'month') | items json | generatedAt ISO8601 | sealed boolean

- CloudBase 为 schemaless 文档模型，无 DDL 建表动作；本文件即逻辑 schema
- 字段增删必须走 ADR，禁止静默扩字段
- 集合名全域只认这四个词；captures/records/traces 等历史别名永久作废
- 本文件由规约层（WB）维护，CB 只读不写
