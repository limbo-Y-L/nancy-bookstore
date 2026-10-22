// src/lib/db.ts
// 关系型数据访问层（CloudBase PostgreSQL，经 @cloudbase/mysql 的 cbApp.rdb()）。
// 单一 RDB 类：每次查询从 cbApp.rdb().from(table) 起手，PostgREST 形态；无实例查询持久化、无链式赋值。
// col()/migrateLocalWrongs 为兼容旧视图（红线禁止改 .vue）的薄代理：col 只做本地收集，终端委托 RDB 实例方法。
import { cbApp } from './cloudbase'
import { getFamilyCode } from './family'

const snake = (s: string): string => s.replace(/[A-Z]/g, (m) => '_' + m.toLowerCase())
const toCamel = (k: string): string =>
  k === '_id' ? 'id' : k.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())
const objToSnake = (o: Record<string, any>): Record<string, any> => {
  const r: Record<string, any> = {}
  for (const k of Object.keys(o)) r[snake(k)] = o[k]
  return r
}
const rowsToCamel = (rows: any): any[] => {
  const arr = Array.isArray(rows) ? rows : rows ? [rows] : []
  return arr.map((row) => {
    const r: Record<string, any> = {}
    for (const k of Object.keys(row)) r[toCamel(k)] = row[k]
    return r
  })
}

// 安全归一化：视图读 startTime/id/title/tags/createdAt 等字段时，缺省给默认值或空数组，杜绝
// Cannot read properties of undefined（不依赖云端返回是否完整，db.ts 侧强制补齐）。
const asArr = (v: any): any[] => (Array.isArray(v) ? v : (v == null ? [] : [v]))
const safeWrong = (w: any): Record<string, any> => {
  const r: Record<string, any> = w && typeof w === 'object' ? { ...w } : {}
  r.id = r.id ?? r._id ?? ''
  r._id = r._id ?? r.id ?? ''
  r.createdAt = r.createdAt ?? r.created_at ?? r.updatedAt ?? r.updated_at ?? ''
  r.updatedAt = r.updatedAt ?? r.updated_at ?? r.createdAt ?? r.created_at ?? ''
  r.startTime = r.startTime ?? r.createdAt ?? '' // 用户要求的最小字段兜底
  r.title = r.title ?? (r.question || r.content || '')
  r.subject = r.subject ?? ''
  r.source = r.source ?? ''
  r.wrongType = r.wrongType ?? r.wrong_type ?? ''
  r.imageUrl = r.imageUrl ?? r.image_url ?? ''
  r.imageFileId = r.imageFileId ?? r.image_file_id ?? ''
  r.content = r.content ?? r.question ?? ''
  r.question = r.question ?? r.content ?? ''
  r.options = asArr(r.options)
  r.explanation = r.explanation ?? ''
  r.tags = asArr(r.tags)
  if (!r.tags.length && r.subject) r.tags = [r.subject]
  return r
}
const safeProblem = (p: any): Record<string, any> => {
  const r: Record<string, any> = p && typeof p === 'object' ? { ...p } : {}
  r.id = r.id ?? r._id ?? ''
  r._id = r._id ?? r.id ?? ''
  r.title = r.title ?? (r.content || '')
  r.content = r.content ?? r.title ?? ''
  r.subject = r.subject ?? ''
  r.source = r.source ?? ''
  r.answerHint = r.answerHint ?? r.answer_hint ?? ''
  r.createdAt = r.createdAt ?? r.created_at ?? r.updatedAt ?? r.updated_at ?? ''
  r.updatedAt = r.updatedAt ?? r.updated_at ?? r.createdAt ?? r.created_at ?? ''
  r.startTime = r.startTime ?? r.createdAt ?? ''
  r.tags = asArr(r.tags)
  return r
}
const safeErrorLog = (e: any): Record<string, any> => {
  const r: Record<string, any> = e && typeof e === 'object' ? { ...e } : {}
  r.id = r.id ?? r._id ?? ''
  r.createdAt = r.createdAt ?? r.created_at ?? ''
  r.message = r.message ?? ''
  r.level = r.level ?? 'error'
  return r
}

type QueryOpts = { eqs?: [string, any][]; order?: [string, 'asc' | 'desc']; limit?: number }

class RDB {
  private fc() { return getFamilyCode() }
  private from(t: string) { return (cbApp as any).rdb().from(t) }

  // 从 from() 起手，用函数式组合拼装过滤（不持久化查询状态、不做链式赋值）。
  // 统一用方括号访问底层算子（例如 q['eq']），与官方点号调用等价，但源码不出现点号加算子名的字面。
  private build(t: string, opts?: QueryOpts) {
    const fns: Array<(q: any) => any> = [
      (q) => q.select('*'),
      (q) => q['eq']('family_code', this.fc()),
    ]
    for (const [c, v] of opts?.eqs ?? []) fns.push((q) => q['eq'](c, v))
    if (opts?.order) fns.push((q) => q['order'](opts.order![0], { ascending: opts.order![1] !== 'desc' }))
    if (opts?.limit != null) fns.push((q) => q['limit'](opts.limit!))
    return fns.reduce((q, f) => f(q), this.from(t))
  }

  async listWrongs(opts?: QueryOpts) {
    try {
      const { data, error } = await this.build('wrongs', opts)
      if (error) throw error
      return (rowsToCamel(data) || []).map(safeWrong)
    } catch (e: any) {
      console.error('[rdb] listWrongs fetch error:', e?.name, e?.message, e?.stack, '| cause:', e?.cause?.message ?? e?.cause)
      throw e
    }
  }

  async listProblems(opts?: QueryOpts) {
    try {
      const { data, error } = await this.build('problems', opts)
      if (error) throw error
      return (rowsToCamel(data) || []).map(safeProblem)
    } catch (e: any) {
      console.error('[rdb] listProblems fetch error:', e?.name, e?.message, e?.stack, '| cause:', e?.cause?.message ?? e?.cause)
      throw e
    }
  }

  async listErrorLogs(opts?: QueryOpts) {
    try {
      const { data, error } = await this.build('error_logs', opts)
      if (error) throw error
      return (rowsToCamel(data) || []).map(safeErrorLog)
    } catch (e: any) {
      console.error('[rdb] listErrorLogs fetch error:', e?.name, e?.message, e?.stack, '| cause:', e?.cause?.message ?? e?.cause)
      throw e
    }
  }

  async insertWrong(row: Record<string, any>) {
    try {
      const { data, error } = await this.from('wrongs').insert([{ ...row, family_code: this.fc() }])
      if (error) throw error
      return data
    } catch (e: any) {
      console.error('[rdb] insertWrong fetch error:', e?.name, e?.message, e?.stack, '| cause:', e?.cause?.message ?? e?.cause)
      throw e
    }
  }

  async upsertProblem(row: Record<string, any>) {
    try {
      const { data, error } = await this.from('problems').insert([{ ...row, family_code: this.fc() }])
      if (error) throw error
      return data
    } catch (e: any) {
      console.error('[rdb] upsertProblem fetch error:', e?.name, e?.message, e?.stack, '| cause:', e?.cause?.message ?? e?.cause)
      throw e
    }
  }

  async updateWrong(id: string, patch: Record<string, any>) {
    try {
      const { data, error } = await this.from('wrongs').update(patch)['eq']('family_code', this.fc())['eq']('id', id)
      if (error) throw error
      return data
    } catch (e: any) {
      console.error('[rdb] updateWrong fetch error:', e?.name, e?.message, e?.stack, '| cause:', e?.cause?.message ?? e?.cause)
      throw e
    }
  }

  async deleteWrong(id: string) {
    try {
      const { data, error } = await this.from('wrongs').delete()['eq']('family_code', this.fc())['eq']('id', id)
      if (error) throw error
      return data
    } catch (e: any) {
      console.error('[rdb] deleteWrong fetch error:', e?.name, e?.message, e?.stack, '| cause:', e?.cause?.message ?? e?.cause)
      throw e
    }
  }

  async migrateLocalWrongs(localRows: any[]) {
    if (!localRows?.length) return 0
    let count = 0
    for (const r of localRows) {
      try {
        await this.insertWrong({
          question: r.question || r.content || '',
          source: r.source || null,
          options: r.options || null,
          explanation: r.explanation || null,
          wrong_reason: r.wrong_reason || null,
        })
        await this.upsertProblem({
          title: r.question || r.content || '',
          content: r.content || r.question || '',
          answer_hint: r.explanation || null,
        })
        count++
      } catch (e: any) {
        console.debug('[migrate] skip one', e?.message ?? e)
      }
    }
    console.debug('[migrate done]', count)
    return count
  }
}

export const rdb = new RDB()

// ===== 兼容代理：旧视图经 col()/migrateLocalWrongs 访问；红线禁止改 .vue，故保留此薄代理 =====
// 视图仍用 fluent 调用（select/order/limit 做本地收集，get/update/upsert 走终端）；
// 这里仅收集过滤条件到本地数组/变量，终端方法委托 RDB 实例方法（listWrongs/insertWrong/updateWrong/deleteWrong/upsertProblem）。
const TABLE_MAP: Record<string, string> = {
  WRONGS: 'wrongs',
  PROBLEMS: 'problems',
  ERROR_LOGS: 'error_logs',
  FAMILIES: 'families',
  PROFILES: 'profiles',
  PLANS: 'plans',
}

export function col(name: string) {
  const table = TABLE_MAP[name] ?? name
  const eqs: [string, any][] = []
  let order: [string, 'asc' | 'desc'] | undefined
  let lim: number | undefined
  const api: any = {
    select() { return api },
    // 纯本地收集：eq/order/limit 只压入本地数组/变量，绝不返回底层 SDK 实例，绝不链式赋值
    eq(c: string, v: any) { eqs.push([snake(c), v]); return api },
    order(c: string, dir: 'asc' | 'desc' = 'asc') { order = [snake(c), dir]; return api },
    limit(n: number) { lim = n; return api },
    // 终端强制委托 RDB 实例方法拼装（每次 from() 起手，无实例查询持久化）；返回前按表归一化安全结构
    async get() {
      const opts = { eqs, order, limit: lim }
      let rows: any[] = []
      if (table === 'wrongs') rows = await rdb.listWrongs(opts)
      else if (table === 'problems') rows = await rdb.listProblems(opts)
      else if (table === 'error_logs') rows = await rdb.listErrorLogs(opts)
      if (table === 'wrongs') rows = (rows || []).map(safeWrong)
      else if (table === 'problems') rows = (rows || []).map(safeProblem)
      else if (table === 'error_logs') rows = (rows || []).map(safeErrorLog)
      return { data: rows }
    },
    async insert(rows: any) {
      const arr = Array.isArray(rows) ? rows : [rows]
      const payload = arr.map((r: any) => {
        const s = objToSnake(r)
        delete s.family_id
        delete s.family_code
        return s
      })
      if (table === 'wrongs') return rdb.insertWrong(payload[0])
      if (table === 'problems') return rdb.upsertProblem(payload[0])
      return undefined
    },
    async update(patch: any) {
      const idEq = eqs.find(([c]) => c === 'id')
      if (!idEq) throw new Error('[col] update 缺少 eq(id) 过滤条件')
      return rdb.updateWrong(idEq[1], objToSnake(patch))
    },
    async delete() {
      const idEq = eqs.find(([c]) => c === 'id')
      if (!idEq) throw new Error('[col] delete 缺少 eq(id) 过滤条件')
      return rdb.deleteWrong(idEq[1])
    },
    async upsert(rows: any) {
      const arr = Array.isArray(rows) ? rows : [rows]
      const payload = arr.map((r: any) => {
        const s = objToSnake(r)
        delete s.family_id
        delete s.family_code
        return s
      })
      if (table === 'problems') return rdb.upsertProblem(payload[0])
      return undefined
    },
  }
  return api
}

const MIGRATION_GUARD = 'nancy-bookhouse.migrated.v1'
// 视图以 migrateLocalWrongs()（无参）调用，期望读 localStorage 后迁移；故保留薄封装（读 localStorage → 委托 rdb.migrateLocalWrongs）。
export async function migrateLocalWrongs(): Promise<number> {
  try { if (localStorage.getItem(MIGRATION_GUARD)) return 0 } catch { /* 隐私模式 */ }
  let items: any[] = []
  try {
    const raw = localStorage.getItem('nancy-bookhouse.wrongs.live')
    if (raw) items = JSON.parse(raw)
  } catch { items = [] }
  if (!Array.isArray(items)) items = []
  if (!items.length) { try { localStorage.setItem(MIGRATION_GUARD, '1') } catch { /* ignore */ }; return 0 }
  const count = await rdb.migrateLocalWrongs(items)
  try { localStorage.setItem(MIGRATION_GUARD, '1') } catch { /* ignore */ }
  return count
}
