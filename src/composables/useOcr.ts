// OCR-L1 前端调用层 · 契约锚：notes/00_decisions.md DEC-10（一期先 L1 单路跑通主流程）
//
// 硬红线：
//   - 只 fetch 同域相对路径 '/api/ocr'，前端绝不直连任何云厂商 endpoint；
//   - 云厂商凭据与其 endpoint 字符串在前端侧一律不得出现（凭据只存在于 functions/ 侧）；
//   - 零依赖：不引任何 npm 包；失败一律静默回落（不 throw、不 console.error 刷屏、不阻塞 UI）。
// 原图保真：直接 append 原始字节（image.buffer），零 canvas / toBlob / resize（OCR_NO_COMPRESS 红线）。

import { ref } from 'vue'
import { saveCaptureOcr } from '../stores/captureStore'
import type { CapturePayload } from '../types/review'
import type { OcrNormalized, OcrResponse } from '../types/ocr'

/** 同域相对路径 —— 唯一允许的出网入口 */
const OCR_ENDPOINT = '/api/ocr'

/** 前端侧超时（ms）：比 Edge 侧的 8s 略短，保证 Edge 先收敛，前端不会悬挂 */
const OCR_TIMEOUT_MS = 7000

/** 调用态：idle 闲置 / pending 进行中 / ok 拿到真源 / fallback 静默回落 */
export type OcrStatus = 'idle' | 'pending' | 'ok' | 'fallback'

const status = ref<OcrStatus>('idle')
const lastError = ref<string>('')

/** 最近一次真源归一结果（仅内存态，不落任何新库新表） */
const lastResult = ref<OcrNormalized | null>(null)

/**
 * 触发 OCR-L1 归一。
 * @returns 是否拿到真源（false = 已静默回落桩）。本片不加 UI 提示，调用方只需 fire-and-forget。
 */
async function triggerOcr(payload: CapturePayload): Promise<boolean> {
  if (payload.images.length === 0) {
    status.value = 'fallback'
    lastError.value = 'no-image'
    return false
  }

  status.value = 'pending'
  lastError.value = ''

  // 原图原始字节直传（OCR_NO_COMPRESS 红线：不经任何压缩通道）
  const form = new FormData()
  for (const image of payload.images) {
    form.append('images', new Blob([image.buffer], { type: image.type }), image.name)
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), OCR_TIMEOUT_MS)

  try {
    const res = await fetch(OCR_ENDPOINT, { method: 'POST', body: form, signal: controller.signal })
    const body = (await res.json()) as OcrResponse

    if (body.kind !== 'ocr-ok' || body.data === undefined) {
      // 无凭据 / 无图 / 网络 / 超时 / 上游异常 / 空结果 —— 一律静默回落，不打扰孩子
      status.value = 'fallback'
      lastError.value = body.reason ?? 'fallback'
      return false
    }

    lastResult.value = body.data
    status.value = 'ok'
    // 复用既有 captures 表一次 put（不新建库表、不改版本号）
    // 写盘失败与「有没有拿到真源」是两件事：单独兜住，绝不因落盘失败把已拿到的真源降级成回落桩
    try {
      await saveCaptureOcr(payload.sessionId, body.data)
    } catch {
      lastError.value = 'save-failed'
    }
    return true
  } catch {
    // fetch 抛错 / 超时 / 响应解析失败：静默回落桩
    status.value = 'fallback'
    lastError.value = 'request-failed'
    return false
  } finally {
    clearTimeout(timer)
  }
}

export function useOcr(): {
  triggerOcr: (payload: CapturePayload) => Promise<boolean>
  status: typeof status
  lastError: typeof lastError
  lastResult: typeof lastResult
} {
  return { triggerOcr, status, lastError, lastResult }
}