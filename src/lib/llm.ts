// src/lib/llm.ts
// callLLM 占位骨架（批次②-3）· 不 fetch / 不发网络 / 无 key 读取
// 真 LLM wire 待 G2 放出后接管
export async function callLLM(_prompt: string, _opts?: { model?: string }): Promise<string> {
  // 占位骨架：不 fetch、不发网络、返回 deterministic mock
  return '[mock-llm] placeholder — wire when G2 released'
}

export type LLMWireState = 'mock' | 'armed' | 'live'
export const wireState: LLMWireState = 'mock'
