// OCR-L1 Edge 壳 · POST /api/ocr（Cloudflare Pages Functions 惯例目录 functions/api/）
// 契约锚：notes/00_decisions.md DEC-10（一期先 L1 单路跑通主流程）
//
// 硬红线（本文件是全工程唯一持有凭据的地方）：
//   - 凭据只从 context.env 读，绝不硬编码、绝不写进任何返回值 / 响应头 / 错误信息；
//   - 不引任何 npm 包（含腾讯云 SDK、wrangler）：TC3-HMAC-SHA256 签名用 WebCrypto 自实现；
//   - 无状态：无 DB 读写、无 session、无 cookie、无日志落盘（除必要的 console 短码）；
//   - 判题 / 归因 / 讲题逻辑一律不在 Edge（仍在本地前端），本壳只做「图片 → 文本 → 结构」。
//
// 失败口径：凭据缺失 / 无图 / 网络抖 / 超时 / 腾讯返回异常 / 识别结果为空 —— 一律 HTTP 200 +
// { kind: 'ocr-stub-fallback', reason: <短码> }，前端才能静默回落桩，不 500、不抛栈。

import { normalizeOcrResponse, type OcrNormalized } from '../_shared/ocrNormalize'

/** 腾讯云极速 OCR 通用印刷体识别（DEC-10 的 L1，单次 HTTP 返回） */
const TENCENT_OCR_HOST = 'ocr.tencentcloudapi.com'
const TENCENT_OCR_SERVICE = 'ocr'
const TENCENT_OCR_ACTION = 'GeneralFastOCR'

/** 请求超时（ms）：对齐 DEC-10「1~3s」，留足余量仍能在等待态内收敛 */
const OCR_TIMEOUT_MS = 8000

interface EdgeContext {
  request: Request
  env: Record<string, string | undefined>
}

type StubReason =
  | 'no-credential'
  | 'no-image'
  | 'network'
  | 'timeout'
  | 'upstream-error'
  | 'upstream-empty'

const encoder = new TextEncoder()

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  })
}

function stub(reason: StubReason): Response {
  return jsonResponse({ kind: 'ocr-stub-fallback', reason })
}

function hex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function sha256Hex(data: Uint8Array): Promise<string> {
  return hex(await crypto.subtle.digest('SHA-256', data as unknown as ArrayBuffer))
}

/** HMAC-SHA256(key, data) → ArrayBuffer */
async function hmac(key: ArrayBuffer | Uint8Array, data: string): Promise<ArrayBuffer> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    key as unknown as ArrayBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  return crypto.subtle.sign('HMAC', keyMaterial, encoder.encode(data) as unknown as ArrayBuffer)
}

/** 零依赖 base64（分块，避免大图一次 concat 爆栈） */
function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  const chunk = 0x8000
  let binary = ''
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

interface Tc3Auth {
  authorization: string
  /** 与签名同源的时间戳：x-tc-timestamp 必须复用它，不可另取 Date.now() */
  timestamp: string
}

/**
 * TC3-HMAC-SHA256 签名，自实现（红线：零新依赖，不引腾讯云 SDK）。
 * 步骤：CanonicalRequest → StringToSign → 派生签名密钥（TC3+Key → date → service → tc3_request）→ Signature。
 * 时间戳只取一次，签名与 x-tc-action 归一化到同一份值，避免签头与时间戳漂移。
 */
async function tc3Authorization(secretId: string, secretKey: string, payload: string): Promise<Tc3Auth> {
  const timestamp = String(Math.floor(Date.now() / 1000))
  const date = new Date(Number(timestamp) * 1000).toISOString().slice(0, 10)

  const hashedPayload = await sha256Hex(encoder.encode(payload))
  const canonicalHeaders = `content-type:application/json; charset=utf-8\nhost:${TENCENT_OCR_HOST}\nx-tc-action:${TENCENT_OCR_ACTION.toLowerCase()}\n`
  const signedHeaders = 'content-type;host;x-tc-action'
  const canonicalRequest = [
    'POST',
    '/',
    '',
    canonicalHeaders,
    signedHeaders,
    hashedPayload
  ].join('\n')

  const stringToSign = [
    'TC3-HMAC-SHA256',
    timestamp,
    `${date}/${TENCENT_OCR_SERVICE}/tc3_request`,
    await sha256Hex(encoder.encode(canonicalRequest))
  ].join('\n')

  const secretDate = await hmac(encoder.encode(`TC3${secretKey}`), date)
  const secretService = await hmac(secretDate, TENCENT_OCR_SERVICE)
  const secretSigning = await hmac(secretService, 'tc3_request')
  const signature = hex(await hmac(secretSigning, stringToSign))

  return {
    authorization: `TC3-HMAC-SHA256 Credential=${secretId}/${date}/${TENCENT_OCR_SERVICE}/tc3_request, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    timestamp
  }
}

interface TencentError {
  Code?: string
  Message?: string
}

/**
 * POST /api/ocr —— 唯一接触腾讯云凭据的入口。
 * 返回分支（六种，全部 HTTP 200）：
 *   1. no-credential    凭据缺失
 *   2. no-image         multipart 里没取到图片
 *   3. network          腾讯侧网络错误（fetch 抛错）
 *   4. timeout          超过 OCR_TIMEOUT_MS（AbortController）
 *   5. upstream-error   腾讯返回 Response.Error
 *   6. upstream-empty   腾讯返回正常但识别结果为空
 *   正常：{ kind: 'ocr-ok', data: OcrNormalized }
 */
export default async function onRequestPost(context: EdgeContext): Promise<Response> {
  // 1. 凭据只从 env 读（缺失即静默回落，不 401：前端才能无声降级）
  const secretId = context.env.TENCENT_OCR_SECRET_ID
  const secretKey = context.env.TENCENT_OCR_SECRET_KEY
  if (secretId === undefined || secretId === '' || secretKey === undefined || secretKey === '') {
    return stub('no-credential')
  }

  // 2. 解析上传的图片（只取第一张：DEC-10 一期 L1 单图单次返回）
  let file: File
  try {
    const form = await context.request.formData()
    const picked = form.getAll('images').find((entry): entry is File => entry instanceof File)
    if (picked === undefined) return stub('no-image')
    file = picked
  } catch {
    return stub('no-image')
  }

  // 3. 调腾讯云极速 OCR（TC3 签名自实现；超时用 AbortController 兜住）
  const payload = JSON.stringify({ ImageBase64: toBase64(await file.arrayBuffer()) })
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), OCR_TIMEOUT_MS)

  let raw: unknown
  try {
    const auth = await tc3Authorization(secretId, secretKey, payload)
    const res = await fetch(`https://${TENCENT_OCR_HOST}/`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json; charset=utf-8',
        host: TENCENT_OCR_HOST,
        'x-tc-action': TENCENT_OCR_ACTION.toLowerCase(),
        authorization: auth.authorization,
        'x-tc-timestamp': auth.timestamp
      },
      body: payload,
      signal: controller.signal
    })
    raw = await res.json()
  } catch (err) {
    // 4/3：超时与网络抖一律归一为短码，绝不把 err 原文（含可能的凭据上下文）回传
    const timedOut = err instanceof Error && err.name === 'AbortError'
    console.warn('[ocr-l1]', timedOut ? 'timeout' : 'network')
    return stub(timedOut ? 'timeout' : 'network')
  } finally {
    clearTimeout(timer)
  }

  // 5. 腾讯返回异常 → 归一（只回 Code 短码，不回 Message 原文）
  if (typeof raw === 'object' && raw !== null) {
    const error = (raw as { Response?: { Error?: TencentError } }).Response?.Error
    if (error !== undefined && error !== null) {
      console.warn('[ocr-l1]', 'upstream-error', error.Code ?? '')
      return stub('upstream-error')
    }
  }

  // 6. 归一（打标与判定不在本片，见 _shared/ocrNormalize.ts 口径声明）
  const data: OcrNormalized = normalizeOcrResponse(raw)
  if (data.items.length === 0) {
    console.warn('[ocr-l1]', 'upstream-empty')
    return stub('upstream-empty')
  }

  return jsonResponse({ kind: 'ocr-ok', data })
}