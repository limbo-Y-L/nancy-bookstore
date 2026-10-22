// src/lib/cloudbase.ts
// CloudBase 初始化单例（批次②-1 底座）· 不引业务逻辑、不写任何集合操作
// 仅导出 app / db 两个句柄，供②-2 及其后消费。
// env 为字面量环境 ID，不引 process.env（浏览器直跑无 node env）。
// 注：@cloudbase/js-sdk v2 以默认导出 `cloudbase` 暴露 `cloudbase.init(...)`（非 initCloudBase 具名导出）
import cloudbase from '@cloudbase/js-sdk'

/** 环境 ID（字面量，不引 process.env；浏览器直跑无 node env） */
const TCB_ENV = 'nancy-bookstore-d3fnn33i4766c7dc'

console.log('[tcb] 配置环境 env:', TCB_ENV)

/** CloudBase 应用单例 */
export const cbApp = cloudbase.init({
  env: TCB_ENV
})

// 临时探针：验证 rdb 可用性（PG 路线切换前确认底层就绪；包 try/catch 避免模块加载期硬崩）
try {
  const rdbProbe = (cbApp as any).rdb?.()
  if (!rdbProbe) {
    console.error('[tcb] 致命：cbApp.rdb 不存在，文档API已切但PG底层未就绪，请检查SDK版本/安装@cloudbase/mysql')
  } else {
    console.log('[tcb] rdb 探针成功，准备真跑')
  }
} catch (e: any) {
  console.error('[tcb] 致命：调用 cbApp.rdb() 抛错（PG 底层未就绪）', e)
}

/** 数据库句柄：仅导出，集合读写留给②-2 */
export const db = cbApp.database()

/** ADR-07：弃用 CloudBase 匿名登录，改用 localStorage 的 8 位 family_code 做数据隔离（无鉴权依赖） */
console.log('[tcb] 使用 family_code 隔离，跳过匿名登录')

/** 模块加载即“就绪”（无登录态依赖）；页面读取前仍可 await tcbReady，仅作兼容闸门 */
export const tcbReady: Promise<void> = Promise.resolve()
