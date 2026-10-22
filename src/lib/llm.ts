// src/lib/llm.ts
// P1 · 讲题主链真 LLM 接入（原生 fetch，无新依赖）
// 密钥仅从 import.meta.env 读取，不写死在代码里；超时 15s；失败抛错由上层 catch
// Prompt 模板 / 输出审查层均在本文件内，视图层只传题目文本，无感知

// —— 孩子版 Prompt 模板（后续家长版开关再扩展）——
const CHILD_PROMPT_TEMPLATE =
  '你是小狐，一个陪小学三年级孩子做数学题的伙伴。只讲思路、知识点、常见陷阱，绝对不告诉答案。讲完抛一个引导问题。题目：{question}'

// —— 输出审查层：剧透判定（答案+是+选项字母或数字）——
const isSpoiler = (text: string): boolean => {
  const hasAnswer = text.includes('答案')
  const hasYes = text.includes('是')
  const hasChoice = /[A-D]/i.test(text)
  const hasNum = /[0-9]+/.test(text)
  return hasAnswer && hasYes && (hasChoice || hasNum)
}
const SPOILER_FALLBACK = '我们先不揭晓答案，你愿意先说说你的思路吗？小狐可以帮你理一理。'

// 安全读取 env（不依赖 env.d.ts 声明，避免改动其他文件）
const getEnv = (k: string): string => {
  const env = import.meta.env as unknown as Record<string, string | undefined>
  return env[k] ?? ''
}

export async function callLLM(_prompt: string, _opts?: { model?: string }): Promise<string> {
  const provider = getEnv('VITE_LLM_PROVIDER') || 'deepseek'
  // Key 优先取设置抽屉里存的本机 Key（localStorage），再回退 .env（构建期注入）
  const apiKey =
    (() => { try { return localStorage.getItem('nancy-bookhouse.apiKey') || '' } catch { return '' } })() ||
    getEnv('VITE_LLM_API_KEY')
  const model =
    _opts?.model ||
    getEnv('VITE_LLM_MODEL') ||
    (provider === 'deepseek' ? 'deepseek-chat' : 'hunyuan-lite')
  // 端点：优先 VITE_LLM_BASE_URL（自建网关 / 云函数转发）。
  // 默认 deepseek 走 vite dev 代理 /llm（规避浏览器 CORS）；生产构建无 dev 代理，
  // 需把 VITE_LLM_BASE_URL 指向自备后端（如 CF Function /api/llm）。
  const baseUrl =
    getEnv('VITE_LLM_BASE_URL') ||
    (import.meta.env.DEV
      ? '/llm/chat/completions'
      : 'https://api.deepseek.com/v1/chat/completions')

  const finalPrompt = CHILD_PROMPT_TEMPLATE.replace('{question}', _prompt)

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15000)

  try {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: finalPrompt }],
        temperature: 0.7
      }),
      signal: controller.signal
    })
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      throw new Error(`LLM HTTP ${res.status}${detail ? ' · ' + detail.slice(0, 200) : ''}`)
    }
    const data: any = await res.json()
    const text: string =
      data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text ?? ''
    if (!text) throw new Error('LLM 返回为空')
    // 输出审查：剧透则降级为引导文案，否则原样返回
    return isSpoiler(text) ? SPOILER_FALLBACK : text
  } finally {
    clearTimeout(timer)
  }
}

export type LLMWireState = 'mock' | 'armed' | 'live'
// G2 闸门：'live' 激活四集合真读写（批次②-6.1 验收后放行 · 2026-10-21）
// 三视图 useMock = wireState==='mock' 守门，col('WRONGS'/'PLANS'/...) 真读写路径已就位；callLLM 仍占位（真 LLM wire 待后续接入）。
export const wireState: LLMWireState = 'live'
