// 家长二审只读聚合 + 覆写 append 封装 · PAR-01
// 契约锚：DEC-15（家长二审=事后兜底复核口，默认全直过，二审为可选覆写通道非强制卡点）
//        DEC-11（单屏显式决策点≤2、孩子端零决策）
// 红线：零依赖零网络、零 localStorage/sessionStorage、零 OCR 真源、零 Edge Function。
//      采集库只读不写；讲题事件库仅 add（append only），不 put、不改表结构、不升级版本。

import { mockReviewItems } from '../constants/mockReview'

/* ------------------------------------------------------------------ *
 * 库口径（与既有落点同名同版本，禁新建 / 禁升级）
 * ------------------------------------------------------------------ */

/** 采集库：与 stores/captureStore.ts 的 DB_NAME / DB_VERSION 同值 */
const CAPTURE_DB_NAME = 'nancy-bookhouse'
const CAPTURE_DB_VERSION = 1
const CAPTURE_STORE = 'captures'

/** 讲题事件库：与 views/TeachView.vue 内建的 EVENT_DB_* 同值 */
const EVENT_DB_NAME = 'nancy-bookhouse-teach'
const EVENT_DB_VERSION = 1
const EVENT_STORE = 'teach-events'

/* ------------------------------------------------------------------ *
 * 类型
 * ------------------------------------------------------------------ */

/** 采集记录的四字段投影（原图字节一律不取、不留、不外传） */
export interface CaptureRow {
  sessionId: string
  mode: string
  imageCount: number
  createdAt: string
}

/** 讲题事件记录投影 */
export interface TeachEventRow {
  type: string
  session: string
  itemIds: string[]
  ts: number
}

/** 单条「错题待确认」条目 · 三行对照的数据模型 */
export interface AuditRow {
  /** 题号 */
  no: string
  /** 来源 session（批次号） */
  session: string
  /** 事件时间（毫秒） */
  ts: number
  /** 采集侧元信息，采不到则为 null（列表不因此报错） */
  capture: CaptureRow | null
  /** 孩子标记：归因草稿从未落盘，此处恒为中性文案 */
  childMark: string
  /** AI 建议：静态桩 knowledge · questionType，零网络 */
  aiHint: string
  /** 家长已覆写的归因；无则 null（默认直过） */
  overridden: string | null
}

/** 归因四类（DEC-15 文案锁） */
export const ATTRIBUTIONS: string[] = ['粗心', '概念不清', '方法不会', '审题偏差']

/** 中性文案（措辞按 notes/02_voice.md：软、不说教、无感叹号） */
const MARK_NONE = '没记下原因。'
const HINT_NONE = '这一题还没有记录。'

/* ------------------------------------------------------------------ *
 * 打开：禁升级
 * onupgradeneeded 里 abort 版本事务 → 既不建库也不升版，
 * 任何「版本对不上」都不被静默改写，读不到就当没有。
 * ------------------------------------------------------------------ */
function openLocked(name: string, version: number): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(name, version)
    req.onupgradeneeded = () => {
      try {
        req.transaction?.abort()
      } catch {
        /* 无事务可中止时忽略，走 onerror 兜底 */
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('indexedDB open failed'))
    req.onblocked = () => reject(new Error('indexedDB open blocked'))
  })
}

/** 只读遍历采集库，取四字段投影；库或表不存在返回空数组（不抛） */
async function readCaptureRows(): Promise<CaptureRow[]> {
  let db: IDBDatabase
  try {
    db = await openLocked(CAPTURE_DB_NAME, CAPTURE_DB_VERSION)
  } catch {
    return []
  }
  try {
    if (!db.objectStoreNames.contains(CAPTURE_STORE)) return []
    return await new Promise<CaptureRow[]>((resolve) => {
      const out: CaptureRow[] = []
      const tx = db.transaction(CAPTURE_STORE, 'readonly')
      const req = tx.objectStore(CAPTURE_STORE).openCursor()
      req.onsuccess = () => {
        const cursor = req.result
        if (cursor) {
          const v = cursor.value as Partial<CaptureRow> & { images?: unknown[] }
          out.push({
            sessionId: String(v.sessionId ?? ''),
            mode: String(v.mode ?? ''),
            imageCount: Array.isArray(v.images) ? v.images.length : 0,
            createdAt: String(v.createdAt ?? '')
          })
          cursor.continue()
        } else {
          resolve(out)
        }
      }
      req.onerror = () => resolve(out)
    })
  } catch {
    return []
  } finally {
    db.close()
  }
}

/** 只读遍历讲题事件库；库或表不存在返回空数组（不抛） */
async function readTeachEvents(): Promise<TeachEventRow[]> {
  let db: IDBDatabase
  try {
    db = await openLocked(EVENT_DB_NAME, EVENT_DB_VERSION)
  } catch {
    return []
  }
  try {
    if (!db.objectStoreNames.contains(EVENT_STORE)) return []
    return await new Promise<TeachEventRow[]>((resolve) => {
      const out: TeachEventRow[] = []
      const tx = db.transaction(EVENT_STORE, 'readonly')
      const req = tx.objectStore(EVENT_STORE).openCursor()
      req.onsuccess = () => {
        const cursor = req.result
        if (cursor) {
          const v = cursor.value as Partial<TeachEventRow>
          out.push({
            type: String(v.type ?? ''),
            session: String(v.session ?? ''),
            itemIds: Array.isArray(v.itemIds) ? v.itemIds.map((x) => String(x)) : [],
            ts: typeof v.ts === 'number' ? v.ts : 0
          })
          cursor.continue()
        } else {
          resolve(out)
        }
      }
      req.onerror = () => resolve(out)
    })
  } catch {
    return []
  } finally {
    db.close()
  }
}

/* ------------------------------------------------------------------ *
 * 对外：只读聚合
 * ------------------------------------------------------------------ */

/**
 * 聚合两库得「错题待确认」列表（默认全直过，无必覆写卡点、无必填校验）。
 * 条目来源 = teach-events 里 type==='teach-done' 的 itemIds（讲过 / 标过要讲的题号）。
 * 采集记录只按 session 补元信息，绝不写。
 */
export async function readAuditRows(): Promise<AuditRow[]> {
  const [captures, events] = await Promise.all([readCaptureRows(), readTeachEvents()])
  const capBySession = new Map(captures.map((c) => [c.sessionId, c]))
  const overrides = new Map<string, string>()
  for (const e of events) {
    if (e.type !== 'parent-override') continue
    const reason = (e as unknown as { reason?: string }).reason ?? ''
    for (const no of e.itemIds) overrides.set(`${e.session}#${no}`, String(reason))
  }

  const rows: AuditRow[] = []
  const seen = new Set<string>()
  for (const e of events) {
    if (e.type !== 'teach-done') continue
    for (const no of e.itemIds) {
      const key = `${e.session}#${no}`
      if (seen.has(key)) continue
      seen.add(key)
      const stub = mockReviewItems.find((it) => it.no === no)
      const aiHint =
        stub === undefined
          ? HINT_NONE
          : `${stub.knowledge} · ${stub.questionType} · ${stub.state === 'correct' ? '对上了' : '还要看'}`
      rows.push({
        no,
        session: e.session,
        ts: e.ts,
        capture: capBySession.get(e.session) ?? null,
        childMark: MARK_NONE,
        aiHint,
        overridden: overrides.get(key) ?? null
      })
    }
  }
  rows.sort((a, b) => b.ts - a.ts)
  return rows
}

/* ------------------------------------------------------------------ *
 * 对外：覆写 append
 * ------------------------------------------------------------------ */

/**
 * 家长覆写归因 → 向 teach-events 表 append 一条新记录。
 * 只 add（autoIncrement 自增），不 put、不改既有记录、不改表结构、不动采集库。
 */
export async function appendParentOverride(input: {
  session: string
  no: string
  reason: string
}): Promise<void> {
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(EVENT_DB_NAME, EVENT_DB_VERSION)
    req.onupgradeneeded = () => {
      const t = req.transaction
      if (t !== null && !req.result.objectStoreNames.contains(EVENT_STORE)) {
        t.abort() // 表不在 = 版本对不上，绝不在这里替既有落点建表
        return
      }
      try {
        t?.abort()
      } catch {
        /* 忽略 */
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('indexedDB open failed'))
  })
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(EVENT_STORE, 'readwrite')
      tx.objectStore(EVENT_STORE).add({
        type: 'parent-override',
        session: input.session,
        itemIds: [input.no],
        reason: input.reason,
        ts: Date.now()
      })
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error ?? new Error('indexedDB add failed'))
      tx.onabort = () => reject(tx.error ?? new Error('indexedDB add aborted'))
    })
  } finally {
    db.close()
  }
}

/* ------------------------------------------------------------------ *
 * 小工具（纯函数、确定性、零副作用）
 * ------------------------------------------------------------------ */

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

/** 毫秒 → `M月D日 HH:mm`；非法值返回中性占位，不抛 */
export function formatAuditTime(ts: number, createdAt: string): string {
  const d = new Date(ts > 0 ? ts : Date.parse(createdAt))
  if (Number.isNaN(d.getTime())) return '时间没记上'
  return `${d.getMonth() + 1}月${d.getDate()}日 ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}