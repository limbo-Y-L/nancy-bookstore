// OCR-L1 前端调用层 · 契约锚：notes/00_decisions.md DEC-10（一期先 L1 单路跑通主流程）
//
// 调用通道（一期）：经 CloudBase JS SDK app.callFunction({ name: 'ocr' }) 调用，与 app.database() 同源同 SDK，
//   不硬编码任何云厂商 endpoint、不泄露凭据（前端红线：凭据只存在于 functions/ 侧）。
//   注：原设计是 fetch 同域 '/api/ocr'（HTTP 云函数）；但本机 Windows CLI 无法给 Web 函数 scf_bootstrap 置 +x，
//       函数起不来（网关 400）。故暂走 SDK 调用通道；后续恢复 HTTP 函数只需把本片 fetch 段换回即可。
// 硬红线：
//   - 零依赖：不引任何 npm 包；失败一律静默回落（不 throw、不 console.error 刷屏、不阻塞 UI）。
// 原图保真：直接 append 原始字节（image.buffer），零 canvas / toBlob / resize（OCR_NO_COMPRESS 红线）。

import { ref } from 'vue'
import { cbApp } from '../lib/cloudbase'
import { saveCaptureOcr } from '../stores/captureStore'
import type { CapturePayload } from '../types/review'
import type { OcrNormalized, OcrResponse } from '../types/ocr'

/** 前端侧超时（ms）：本地放弃等待上限；callFunction 本身走 SDK，超时即回落 */
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
  // 守卫：payload/images 缺失直接回落，避免后续属性访问抛未捕获 TypeError 连锁崩溃（step 6）
  if (!payload || !Array.isArray(payload.images) || payload.images.length === 0) {
    status.value = 'fallback'
    lastError.value = 'no-image'
    return false
  }

  status.value = 'pending'
  lastError.value = ''

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), OCR_TIMEOUT_MS)

  try {
    // 一期经 CloudBase SDK callFunction 调用 ocr（与 app.database() 同源同 SDK，不暴露端点/密钥）。
    // 真实 OCR 切片上线后 data 传入 base64 原图；桩阶段忽略入参。
    const res = await cbApp.callFunction({
      name: 'ocr',
      data: { imageCount: payload.images.length }
    })
    // v2 SDK：结果在 res.result；兼容直接返回情形。
    const body = ((res as any).result ?? res) as OcrResponse

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