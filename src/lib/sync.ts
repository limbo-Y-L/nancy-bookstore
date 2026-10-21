// src/lib/sync.ts
// 首次写入冒烟：对四集合各写一条探针文档，写完即删（纯探测，不残留）
// 任何异常静默吞掉，跟 OCR L3 同律，不红屏
// 不在页面生命周期自动调（仅 export，由手动冒烟 import 触发）
import { col } from './db'

const probeDoc = () => ({ _probe: true, ts: Date.now() })

export async function probe(): Promise<void> {
  const keys = ['FAMILIES', 'WRONGS', 'PROFILES', 'PLANS'] as const
  for (const k of keys) {
    try {
      const res = await col(k).add(probeDoc())
      // add 后立刻 remove：pair 必须成对，不靠人工清
      if (res?.id) {
        await col(k).doc(res.id).remove()
      }
    } catch {
      // 静默吞掉：探针失败不影响主流程，跟 OCR L3 同律
    }
  }
}
