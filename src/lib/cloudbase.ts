// src/lib/cloudbase.ts
// CloudBase 初始化单例（批次②-1 底座）· 不引业务逻辑、不写任何集合操作
// 仅导出 app / db 两个句柄，供②-2 及其后消费。
// env 为字面量环境 ID，不引 process.env（浏览器直跑无 node env）。
// 注：@cloudbase/js-sdk v2 以默认导出 `cloudbase` 暴露 `cloudbase.init(...)`（非 initCloudBase 具名导出）
import cloudbase from '@cloudbase/js-sdk'

/** CloudBase 应用单例 */
export const cbApp = cloudbase.init({
  env: 'nancy-bookstore-d3fnn33i4766c7dc'
})

/** 数据库句柄：仅导出，集合读写留给②-2 */
export const db = cbApp.database()
