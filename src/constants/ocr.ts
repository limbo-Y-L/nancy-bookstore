// 采集域常量 · CAP-01 行为接入切片
// 契约锚：03_context.md §3 ⑫三拧点最终裁定 / notes/00_decisions.md DEC-11·16·17·19
// 纯 TypeScript 字面量，零依赖、零网络、零副作用。

/** 单次采集最多张数（作业桌一次一叠，超出部分丢弃） */
export const MAX_CAPTURE = 9

/**
 * 原图保真红线开关（恒真）。
 * 读取层以类型收窄强制「只走原始字节通道」：置 true 时 CaptureImageMeta['buffer']
 * 只能是 ArrayBuffer，杜绝 canvas/toBlob/resize 压缩分支混入类型。
 */
export const OCR_NO_COMPRESS = true as const

/** 采集模式：hw = 作业批改 / mt = 口算批改 */
export type CaptureMode = 'hw' | 'mt'

/** 采集模式联合类型（具名别名，便于常量与类型同处一册） */
export type CAPTURE_MODE = CaptureMode

/** OCR_NO_COMPRESS 为真时的原图字节载荷类型（恒等于 ArrayBuffer） */
export type RawImageBytes = typeof OCR_NO_COMPRESS extends true ? ArrayBuffer : never