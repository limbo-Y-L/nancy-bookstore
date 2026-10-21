// src/lib/llm.ts
// callLLM 占位骨架（批次②-3）· 不 fetch / 不发网络 / 无 key 读取
// 真 LLM wire 待 G2 放出后接管
export async function callLLM(_prompt: string, _opts?: { model?: string }): Promise<string> {
  // 占位骨架：不 fetch、不发网络、返回 deterministic mock
  return '[mock-llm] placeholder — wire when G2 released'
}

export type LLMWireState = 'mock' | 'armed' | 'live'
// G2-pending：真 LLM wire 待 G2 放出后在此接管 callLLM 并置 wireState='live'；
// 批次②-4末换线：三视图 useMock = wireState==='mock' 守门，col('WRONGS') 真读写路径已就位，本包不改字面量。
export const wireState: LLMWireState = 'mock'
