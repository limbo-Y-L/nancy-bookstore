// src/lib/db.ts
// 数据访问层（PostgreSQL 模式）：统一走 cbApp.rdb()，camelCase ↔ snake_case 自动转换。
// 视图层只写 camelCase 逻辑字段（familyId / wrongType / createdAt …），不感知 PG 物理列名。
// 注：本 SDK 的 TypeScript 类型未声明 rdb（依赖 @cloudbase/mysql 未随包安装），此处用 any 桥接底层构造器。
import { cbApp, tcbReady } from './cloudbase'
import { getFamilyCode } from './family'

export const COL = {
  FAMILIES: 'families',
  WRONGS:   'wrongs',
  PROFILES: 'profiles',
  PLANS:    'plans',
} as const

// ADR-07 隔离列：wrongs/plans 物理列名为 family_id（family_code 列尚未创建，故沿用 family_id）
const FAMILY_COL = 'family_id'

// camelCase → snake_case（前端逻辑字段 → PG 物理列）
const toSnake = (k: string): string => k.replace(/[A-Z]/g, (m) => '_' + m.toLowerCase())
// snake_case → camelCase（PG 物理列 → 前端逻辑字段）
const toCamel = (k: string): string =>
  k === '_id' ? 'id' : k.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())

const objToSnake = (o: Record<string, any>): Record<string, any> => {
  const r: Record<string, any> = {}
  for (const k of Object.keys(o)) r[toSnake(k)] = o[k]
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

/**
 * rdb 查询/写入封装：拦截列名做 camel↔snake 转换，终端方法前 await 登录态闸门。
 * 底层构造器：cbApp.rdb().from(table)（CloudBase PostgreSQL）。
 */
class RdbTable {
  private q: any
  constructor(table: string) {
    // rdb 构造器在 col() 调用时即创建（仅构建查询对象，不发请求）；真实网络调用在终端方法。
    this.q = (cbApp as any).rdb().from(table)
  }
  select(...cols: string[]): RdbTable {
    this.q = cols.length ? this.q.select(...cols.map(toSnake)) : this.q.select()
    return this
  }
  eq(col: string, val: any): RdbTable {
    this.q = this.q.eq(toSnake(col), val)
    return this
  }
  in(col: string, vals: any[]): RdbTable {
    this.q = this.q.in(toSnake(col), vals)
    return this
  }
  order(col: string, dir: 'asc' | 'desc' = 'asc'): RdbTable {
    this.q = this.q.order(toSnake(col), { ascending: dir === 'asc' })
    return this
  }
  limit(n: number): RdbTable {
    this.q = this.q.limit(n)
    return this
  }
  // 终端读取：rdb 构造器本身可 await，返回 { data, error }（无 .get() 方法）
  async get(): Promise<{ data: any[] }> {
    await tcbReady
    // ADR-07：自动按 family_code 隔离（物理列 family_id），业务层无感
    this.q = this.q.eq('familyId', getFamilyCode())
    const res: any = await this.q
    if (res && res.error) throw res.error
    const data = res && res.data !== undefined ? res.data : res
    return { data: rowsToCamel(data) }
  }
  // 写入：camel→snake；登录态闸门后执行
  async insert(rows: Record<string, any> | Record<string, any>[]): Promise<any> {
    await tcbReady
    const arr = Array.isArray(rows) ? rows : [rows]
    const injected = arr.map((r) => {
      const s = objToSnake(r)
      if (!s[FAMILY_COL]) s[FAMILY_COL] = getFamilyCode()
      return s
    })
    return this.q.insert(injected)
  }
  async update(values: Record<string, any>): Promise<any> {
    await tcbReady
    return this.q.update(objToSnake(values))
  }
  async remove(): Promise<any> {
    await tcbReady
    return this.q.delete()
  }
}

/**
 * 集合访问入口（签名保持不变，其余文件沿用）：返回 rdb 表封装。
 * PostgreSQL 模式下，集合名即物理表名（COL 已为小写复数，无需再转）。
 */
export const col = (name: keyof typeof COL): RdbTable => new RdbTable(COL[name])
