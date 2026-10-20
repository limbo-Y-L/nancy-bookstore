// OCR-L1 归一真源 · 腾讯云极速 OCR 原始返回 → 前端共享结构
// 契约锚：notes/00_decisions.md DEC-10（OCR 三层分级，一期先 L1 单路跑通主流程）
//
// 【打标与判定不在本片 · 口径声明】
// 腾讯云极速 OCR 的通用印刷体识别只吐「识别文本 + 每条文本的置信度」，给不了知识点、给不了题型、也给不了对错。
// 所以本文件严格只负责一件事：**文本 → 结构**。
//   - state 一律 'empty'（待本地判定；判题逻辑留在本地前端，不在 Edge、不在本片）
//   - knowledge / questionType 填中性占位文案，**绝不伪造 AI 打标**
//   - answer 只从识别文本里抽答案候选，抽不到就不给该字段（可选字段不占位、不编造）
// 这样保证结构与源码同源、不虚构：真源层只搬运可见事实，判断层留给本地。
//
// 零凭据依赖、零网络、零 IO：纯映射，可被 Node 直接 import 单测。
// 结构与前端 src/types/ocr.ts 的 OcrNormalized 逐字段对齐（functions/ 不在 tsconfig 前端 include 内，
// 故两侧各自独立声明，改一处必须同步另一处）。

/** 归一后的单题结构（与 src/types/ocr.ts 的 OcrItem 逐字段对齐） */
export interface OcrItem {
  id: string
  /** 题号字符串 */
  no: string
  /** 一律 'empty'：判定不在本片 */
  state: 'correct' | 'wrong' | 'empty'
  /** AI 打标位：真源给不了，中性占位 */
  knowledge: string
  /** AI 打标位：真源给不了，中性占位 */
  questionType: string
  /** 识别出的答案/文本，可选；抽不到则字段不存在 */
  answer?: string
  /** 该题原始识别文本 */
  text: string
  /** 0~1 */
  confidence: number
}

/** 归一后的整包结构 */
export interface OcrNormalized {
  source: 'tencent-l1'
  imageCount: number
  items: OcrItem[]
}

/** 中性占位文案：AI 打标位由本地判定层后续填充，真源层不虚构 */
export const ATTRIBUTION_HINT = '还没认出来'

/** 一期恒定的状态：待本地判定 */
export const OCR_L1_STATE = 'empty' as const

/** 源标识：一期只有腾讯云极速 OCR 单路（DEC-10） */
export const OCR_L1_SOURCE = 'tencent-l1' as const

/** 腾讯云 TextDetections 里我们只关心的三个字段 */
interface RawDetection {
  text: string
  confidence: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/** 置信度归一到 0~1（腾讯给的是 0~100 的整数），非法值一律归 0，绝不外插 */
function toUnitConfidence(raw: unknown): number {
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return 0
  if (raw > 1) return Math.max(0, Math.min(1, raw / 100))
  return Math.max(0, Math.min(1, raw))
}

/**
 * 从一条识别文本里抽答案候选（极简、确定性）：
 *   - 必须出现 `=`（含全角＝）才认为是答案行；取最后一个 `=` 之后的尾段；
 *   - 去掉全部空白与常见中英文标点；
 *   - 尾段非空才给 answer；没有 `=` 或尾段为空 → **不给该字段**（不编造、不拿题干冒充答案）。
 * 抽候选不是判定：这里只搬「看得见的尾段」，对不对由本地判定层说话。
 */
function extractAnswer(text: string): string | undefined {
  const eq = Math.max(text.lastIndexOf('='), text.lastIndexOf('＝'))
  if (eq < 0) return undefined
  const tail = text.slice(eq + 1).replace(/[\s。，、；：,.()（）]/gu, '')
  return tail === '' ? undefined : tail
}

/** 归一主函数：腾讯云原始返回 → OcrNormalized。
 * 纯函数、零副作用；识别不出任何文本时 items 为空数组（由调用方决定是否回落桩）。 */
export function normalizeOcrResponse(raw: unknown): OcrNormalized {
  const root = isRecord(raw) ? raw : {}
  const response = isRecord(root.Response) ? root.Response : {}
  const detections = Array.isArray(response.TextDetections) ? response.TextDetections : []

  const items: OcrItem[] = []
  let no = 0

  for (const entry of detections) {
    if (!isRecord(entry)) continue
    const text = typeof entry.DetectedText === 'string' ? entry.DetectedText.trim() : ''
    if (text === '') continue
    no += 1
    const answer = extractAnswer(text)
    const item: OcrItem = {
      id: `l1-${no}`,
      no: String(no),
      state: OCR_L1_STATE,
      knowledge: ATTRIBUTION_HINT,
      questionType: ATTRIBUTION_HINT,
      text,
      confidence: toUnitConfidence(entry.Confidence)
    }
    if (answer !== undefined) item.answer = answer
    items.push(item)
  }

  return { source: OCR_L1_SOURCE, imageCount: 1, items }
}