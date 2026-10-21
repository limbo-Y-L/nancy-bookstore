// src/utils/ocrClient.ts
// OCR 前端调用点（CloudBase 云函数骨架期）
// 目标地址为「构建期替换标记」，不硬编码真实地址；调用失败一律静默回落 L3-fallback，不阻断主流程。
// 视觉 / sealed 段不在本文件改动范围。

/** 构建期替换标记：CI/构建脚本将其替换为真实云函数地址，运行期勿硬编码 */
export const OCR_ENDPOINT = '__CLOUDBASE_FN_OCR__'

export interface OcrResult {
  text: string
  confidence: number
  stage: string
  source: string
}

/** L3 静默回落：任何异常/非 200 都返回空文本，前端不红屏 */
function l3Fallback(): OcrResult {
  return { text: '', confidence: 0, stage: 'L3-fallback', source: 'mock' }
}

/**
 * 调 OCR 云函数；入参为图片 base64 串。
 * 任何失败（网络/非 200/解析异常）一律走 L3 fallback，不抛、不阻断主流程。
 */
export async function ocrRecognize(imageBase64: string): Promise<OcrResult> {
  try {
    const res = await fetch(OCR_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ image: imageBase64 })
    })
    if (!res.ok) return l3Fallback()
    return (await res.json()) as OcrResult
  } catch {
    return l3Fallback()
  }
}
