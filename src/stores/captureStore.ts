// 采集原图本地仓 · CAP-01
// 红线：原图只落 IndexedDB，不写 localStorage，不发任何网络请求。
// 原生 IndexedDB，零第三方依赖（不引 idb）。库名/表名语义清楚，主键 sessionId。

import type { CapturePayload } from '../types/review'
import type { OcrNormalized } from '../types/ocr'

const DB_NAME = 'nancy-bookhouse'
const DB_VERSION = 1
const STORE_NAME = 'captures'

/** 打开（必要时升级）本地库 */
function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'sessionId' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('indexedDB open failed'))
  })
}

/**
 * 写入一次采集批次（整批一次 put，sessionId 为主键，重复提交即覆盖）。
 * 本切片唯一被 CaptureView 调用的存储入口。
 */
export async function saveCapture(payload: CapturePayload): Promise<void> {
  const db = await openDb()
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).put(payload)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error ?? new Error('indexedDB put failed'))
      tx.onabort = () => reject(tx.error ?? new Error('indexedDB put aborted'))
    })
  } finally {
    db.close()
  }
}

/**
 * 按 sessionId 读取一次采集批次；无记录返回 null。
 * 供后续 REV-01 消费，本切片不调用。
 */
export async function readCapture(sessionId: string): Promise<CapturePayload | null> {
  const db = await openDb()
  try {
    return await new Promise<CapturePayload | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const req = tx.objectStore(STORE_NAME).get(sessionId)
      req.onsuccess = () => resolve((req.result as CapturePayload | undefined) ?? null)
      req.onerror = () => reject(req.error ?? new Error('indexedDB get failed'))
    })
  } finally {
    db.close()
  }
}

/**
 * 把 OCR-L1 归一结果回写到同一条采集记录（复用既有 captures 表，一次 put 整条记录覆盖）。
 * 红线：不新建库 / 不新建表 / 不改库版本号 / 不改 keyPath；只在既有记录上补一个可选 ocr 字段。
 * 无记录时静默返回（OCR 回落是正常路径，不该让批改链报错）。
 */
export async function saveCaptureOcr(sessionId: string, ocr: OcrNormalized): Promise<void> {
  const existing = await readCapture(sessionId)
  if (existing === null) return
  await saveCapture({ ...existing, ocr })
}