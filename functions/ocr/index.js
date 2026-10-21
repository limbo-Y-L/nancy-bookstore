// CloudBase 云函数 · ocr（一期降级桩）
// 部署形态：普通 event 函数（tcb fn deploy，无需 scf_bootstrap / 无 +x 依赖）。
// 调用方：前端经 CloudBase JS SDK app.callFunction({ name: 'ocr', data }) 调用（与 app.database() 同源同 SDK，
//   不硬编码任何云厂商 endpoint / 不泄露凭据，符合前端红线）。
// 契约锚：src/types/ocr.ts 的 OcrResponse
//
// 一期不调真实 OCR API：任何请求一律返回 ocr-stub-fallback（空结果降级）。
// 真实 OCR 凭据与 endpoint 留待后续切片在此处接入；前端侧绝不持有任何云厂商凭据/地址。
//
// event 入参 data：{ imageCount?: number }（桩阶段忽略；真实 OCR 切片将接收 base64 图）。

exports.main = async (event, context) => {
  return {
    kind: 'ocr-stub-fallback',
    reason: 'no-credential'
  }
}
