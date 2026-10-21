'use strict'

// functions/ocr/index.js
// OCR 云函数入口（HTTP 触发）· 三档 mock 骨架（封存态：不接真实腾讯云、不读密钥、不引环境变量）
//
// 契约锁定：
//   入：POST body { image: string(base64) }
//   出：JSON { text: string, confidence: number, stage: string, source: "mock" }
//   无 SecretId/Key 读取（避免误提交）
//
// 三档逻辑（严格原样，不发明）：
//   L1 入参 {image:base64} → 直接返回 L1-mock
//   L2 judgeStub：原 stub 判定分支原样，返回 L2-mock
//   L3 静默回落：任何异常不抛、返回 L3-fallback + 空文本，前端不红屏

/** L1：入参即返回 mock 基线（骨架期不进真实链路） */
function l1Mock() {
  return { text: '', confidence: 0, stage: 'L1-mock', source: 'mock' }
}

/** L2：judge stub 判定分支（原样骨架，不发明真实判题） */
function l2JudgeStub(image) {
  // 占位分支：原 stub 的 no-image / 有图 两路，均回落 L2-mock
  if (image === undefined || image === null) {
    return { text: '', confidence: 0, stage: 'L2-mock', source: 'mock' }
  }
  return { text: '', confidence: 0, stage: 'L2-mock', source: 'mock' }
}

/** L3：静默回落（任何异常不抛，前端不红屏） */
function l3Fallback() {
  return { text: '', confidence: 0, stage: 'L3-fallback', source: 'mock' }
}

/** HTTP 触发入口：解析入参 → 走 L2 judge 分支；任何异常走 L3 静默回落 */
exports.main = async (event, context) => {
  try {
    const body = typeof event.body === 'string'
      ? JSON.parse(event.body || '{}')
      : (event.body || {})
    const image = body && body.image
    return l2JudgeStub(image)
  } catch (e) {
    return l3Fallback()
  }
}

// 暴露三档供自检（不打扰主链路）
exports.l1Mock = l1Mock
exports.l2JudgeStub = l2JudgeStub
exports.l3Fallback = l3Fallback
