// src/lib/progress.ts
// 复习进度镜像：mock 态读 localStorage，real 态（wireState==='live'）走 CloudBase。
// 守门：wireState 来自 llm.ts；mock 期间绝不静态 import db（仅 live 分支动态 import）。
// 不新建 CSS 变量；不引新依赖。
import { wireState } from './llm'

export interface ProgressSnapshot {
  currentStage: number
  completedQuestions: number
}

const LS_KEY = 'nancy_progress'
const DEFAULT_SNAPSHOT: ProgressSnapshot = { currentStage: 1, completedQuestions: 0 }

function readLocal(): ProgressSnapshot {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return { ...DEFAULT_SNAPSHOT }
    const parsed = JSON.parse(raw) as Partial<{ stage: number; count: number }>
    return {
      currentStage: typeof parsed.stage === 'number' ? parsed.stage : DEFAULT_SNAPSHOT.currentStage,
      completedQuestions: typeof parsed.count === 'number' ? parsed.count : DEFAULT_SNAPSHOT.completedQuestions
    }
  } catch {
    return { ...DEFAULT_SNAPSHOT }
  }
}

export async function getProgress(): Promise<ProgressSnapshot> {
  if (wireState === 'live') {
    // real 态：动态 import db，按 familyId 查进度集合。
    // 注：schema 四集合当前为 families/wrongs/profiles/plans，无独立 'progress'，
    // 进度快照暂落 PLANS（待 ADR 定稿）；familyId 待家庭码体系落地，先回退本地不阻塞。
    try {
      const { col } = await import('./db')
      const res = await col('PLANS').where({ familyId: 'f_pending' }).get()
      const docs = res.data as Array<{ stage?: number; count?: number }>
      if (docs.length > 0) {
        const d = docs[0]
        return {
          currentStage: d.stage ?? DEFAULT_SNAPSHOT.currentStage,
          completedQuestions: d.count ?? DEFAULT_SNAPSHOT.completedQuestions
        }
      }
    } catch {
      /* 静默回退本地 */
    }
  }
  return readLocal()
}

export function setProgress(stage: number, count: number): void {
  // mock 态 / live 兜底：始终写本地，保证不丢。
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ stage, count }))
  } catch {
    /* 静默 */
  }
  if (wireState === 'live') {
    // real 态：落地 CloudBase（familyId 待定）；本地兜底已保证不丢。
    import('./db')
      .then(({ col }) => {
        col('PLANS')
          .add({ familyId: 'f_pending', stage, count, createdAt: new Date().toISOString() })
          .catch(() => {})
      })
      .catch(() => {})
  }
}
