// 错题全量导出 · ②-5 设置抽屉
// 守门（wireState='mock' 期间）：只拉本地镜像数组，绝不触 col()。
// real 分支用动态 import('./db') —— 避免把 CloudBase SDK 静态打进抽屉 chunk。
// 本地镜像用途：错题页（mock 态内存数组）与设置抽屉（导出源）共享同一份本地数据，避免两处各造一份。

import { getFamilyCode } from './family'
import { wireState } from './llm'

export interface ExportWrong {
  id: string
  subject: string
  tags: string[]
  source: string
  wrongType?: string
  ts: number
}

const LOCAL_MIRROR_KEY = 'nancy-bookhouse.wrongs.local'

/** 写入本地镜像（错题页在 mock 态每次变更后调用） */
export function saveLocalWrongs(rows: ExportWrong[]): void {
  try {
    localStorage.setItem(LOCAL_MIRROR_KEY, JSON.stringify(rows))
  } catch {
    // 隐私模式等场景 localStorage 不可用：静默跳过，导出退化为当次内存数据
  }
}

/** 读取本地镜像；无镜像时返回空数组 */
export function readLocalWrongs(): ExportWrong[] {
  try {
    const raw = localStorage.getItem(LOCAL_MIRROR_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as ExportWrong[]) : []
  } catch {
    return []
  }
}

/** 全量拉取：mock 走本地镜像；real 走 CloudBase 文档库并按 familyId（家庭码）分区过滤 */
export async function pullAllWrongs(): Promise<ExportWrong[]> {
  if (wireState === 'mock') return readLocalWrongs()
  const { col } = await import('./db')
  const res = await col('WRONGS').where({ familyId: getFamilyCode() }).get()
  const list =
    (res.data as Array<{
      _id: string
      subject: string
      tags?: string[]
      source: string
      wrongType?: string
      createdAt: string
    }>) || []
  return list.map(d => ({
    id: d._id,
    subject: d.subject,
    tags: d.tags ?? [],
    source: d.source,
    wrongType: d.wrongType,
    ts: new Date(d.createdAt).getTime()
  }))
}

/** 组装导出 JSON：元信息（导出时间/家庭码/条数）+ 错题全量 */
export function buildExportJson(rows: ExportWrong[], familyCode = getFamilyCode()): string {
  return JSON.stringify(
    {
      meta: {
        app: 'nancy-bookhouse',
        kind: 'wrongs-export',
        exportedAt: new Date().toISOString(),
        familyCode,
        count: rows.length
      },
      data: rows
    },
    null,
    2
  )
}

/** 浏览器下载：Blob + 临时 a 标签，触发后释放对象 URL */
export function downloadJson(filename: string, json: string): void {
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** 一站式：全量拉取 → 打包 JSON → 触发下载，返回文件名与字节数 */
export async function exportWrongs(): Promise<{ filename: string; bytes: number; count: number }> {
  const rows = await pullAllWrongs()
  const json = buildExportJson(rows)
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const filename = `nancy-wrongs-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
    now.getDate()
  )}-${pad(now.getHours())}${pad(now.getMinutes())}.json`
  downloadJson(filename, json)
  return { filename, bytes: new Blob([json]).size, count: rows.length }
}
