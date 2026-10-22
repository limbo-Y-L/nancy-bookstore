# 数据契约 · 四集合（batch② 生效）

## families
  _id(auto) | ownerId string | label string | createdAt ISO8601 | sealed boolean

## wrongs
  _id | familyId ref | source text | answer text | subject enum('计算'|'语文'|'英语'|'其他') | wrongType enum('concept'|'careless'|'method'|'misread') | tags string[] | reviewed boolean | createdAt | updatedAt | imageUrl text | imageThumbUrl text
<!-- 2026-10-21 EOB: subject字段已上线(②-4.5), wrongType pending-attribution归②-5归因UI -->
<!-- 2026-10-21 ADR-10: wrongType enum 补 misread(审题偏差)·归因UI②-5已上线·pending-attribution标记解除 -->
<!-- 2026-10-22 EOB: imageUrl/imageThumbUrl 指向云存储URL(原图/缩略图)，物理列 image_url/image_thumb_url，允许 NULL -->

## profiles
  _id | familyId ref | llmProvider string | modelTag string | preference json | lastSync ISO8601

## plans
  _id | familyId ref | window enum('week'|'month') | items json | generatedAt ISO8601 | sealed boolean

## 云存储目录约定（图片 · 文字进 PG / 图片进云存储）
- 桶：CloudBase 环境默认桶（不新建）
- 根路径：/wrongs/{family_code}/{wrong_id}/
  ├─ original.jpg   原图（前端上传原文件）
  └─ thumb.jpg      缩略图（前端 canvas 压缩到 800px 长边后上传）
- family_code：来自 localStorage（8 位家庭码，ADR-07）；wrong_id：crypto.randomUUID()
- 示例：/wrongs/F8X2K9Q1/3f8a-4b2e.jpg  ·  /wrongs/F8X2K9Q1/3f8a-4b2e.thumb.jpg
- wrongs 表仅存地址（imageUrl=原图/云存储 URL，imageThumbUrl=缩略图），不存二进制
- RLS：现有策略 authenticated 全量放行；升级付费版后再细化到 family_code。图片 URL 带 family_code 路径，即使被猜到地址仅暴露一张错题图，不泄文字。

- 当前为 PostgreSQL 模式：wrongs 等物理表需 DDL（见各表字段）；本文件即逻辑 schema
- 字段增删必须走 ADR，禁止静默扩字段
- 集合名全域只认这四个词；captures/records/traces 等历史别名永久作废
- 本文件由规约层（WB）维护，CB 只读不写

## 隔离模型（ADR-07）
- 弃用 CloudBase 匿名登录（长期 400 LOGIN_MANNER_UNREGISTED，不可用）。
- 以 localStorage 中 `nancy-bookhouse.familyCode`（8 位字母数字，剔除 I/O/0/1，见 src/lib/family.ts）为唯一隔离凭证。
- 所有 rdb 读写由 src/lib/db.ts 自动附加 `family_id`（值取 getFamilyCode()），业务层无感。
- 注：物理列名为 `family_id`（非 `family_code`，该列尚未创建）；云端 RLS 后续细化（付费版），当前靠查询 `where family_id` 兜底。
