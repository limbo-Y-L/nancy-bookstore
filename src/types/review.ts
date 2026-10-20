// 批改链数据类型 · CAP-01 采集落点契约
// 仅类型声明，零运行时、零依赖。数据只走 IndexedDB（见 stores/captureStore.ts）。

import type { CaptureMode, RawImageBytes } from '../constants/ocr'
import type { OcrNormalized } from './ocr'

export type { CaptureMode }

/** 单张采集原图元信息 · buffer 为原始字节（禁压缩，见 OCR_NO_COMPRESS） */
export interface CaptureImageMeta {
  /** 本地唯一 id（同 session 内去重键） */
  id: string
  /** 原始文件名 */
  name: string
  /** MIME 类型 */
  type: string
  /** 原始字节数 */
  size: number
  /** File.arrayBuffer() 直读的原始字节，零 canvas / toBlob / resize */
  buffer: RawImageBytes
}

/** 一次采集批次（IndexedDB 记录值，sessionId 为主键） */
export interface CapturePayload {
  /** 本地生成的 UUID v4，仅本地使用，不上送 */
  sessionId: string
  /** 采集模式 */
  mode: CaptureMode
  /** 整批原图（一次赋值、整批直铺，不做 stagger） */
  images: CaptureImageMeta[]
  /** 落盘时间（ISO 8601） */
  createdAt: string
  /** OCR-L1 真源归一结果（可选）：OCR 静默回落时该字段缺省，消费方回落桩 */
  ocr?: OcrNormalized
}