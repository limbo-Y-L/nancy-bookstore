// OCR-L1 前端共享类型 · 与 functions/_shared/ocrNormalize.ts 的结构逐字段对齐
// 契约锚：notes/00_decisions.md DEC-10（一期先 L1 单路跑通主流程）
//
// 口径：打标与判定不在 OCR-L1。极速 OCR 只吐文本，给不了知识点/题型/对错，
// 故真源返回时 knowledge / questionType 为中性占位、state 一律 'empty'（待本地判定）。
//
// 为什么这里独立声明而不从 functions/ import：
//   functions/ 不在 tsconfig 的前端 include 内（include 仅 src/**），跨目录 import 会把
//   Edge 侧代码拖进前端类型图。故两侧各自声明、以本文件注释为对齐契约；改一处须同步另一处。
// 仅类型声明，零运行时、零依赖。

/** 单题归一结构（字段与 functions/_shared/ocrNormalize.ts 的 OcrItem 一一对应） */
export interface OcrItem {
  /** 本地唯一 id */
  id: string
  /** 题号字符串 */
  no: string
  /** 三态：一期真源恒为 'empty'，判定留在本地 */
  state: 'correct' | 'wrong' | 'empty'
  /** 知识点（AI 打标位：真源给不了，中性占位，待本地填充） */
  knowledge: string
  /** 题型（AI 打标位：真源给不了，中性占位，待本地填充） */
  questionType: string
  /** 识别出的答案/文本，可选；抽不到则字段不存在 */
  answer?: string
  /** 该题原始识别文本 */
  text: string
  /** 置信度 0~1 */
  confidence: number
}

/** 归一整包 */
export interface OcrNormalized {
  /** 一期只有腾讯云极速 OCR 单路（DEC-10） */
  source: 'tencent-l1'
  imageCount: number
  items: OcrItem[]
}

/**
 * /api/ocr 的响应契约。
 * 除 'ocr-ok' 外一律静默回落桩（无凭据 / 无图 / 网络 / 超时 / 上游异常 / 空结果），
 * 全部 HTTP 200，由前端决定回落，本层不抛错。
 */
export interface OcrResponse {
  kind: 'ocr-ok' | 'ocr-stub-fallback'
  /** kind === 'ocr-ok' 时必有 */
  data?: OcrNormalized
  /** kind === 'ocr-stub-fallback' 时的短码（no-credential / no-image / network / timeout / upstream-error / upstream-empty） */
  reason?: string
}