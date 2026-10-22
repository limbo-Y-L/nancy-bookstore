// src/lib/cloudbase.ts
// CloudBase 初始化单例（批次②-1 底座）· 不引业务逻辑、不写任何集合操作
// 仅导出 app / db 两个句柄，供②-2 及其后消费。
// env 为字面量环境 ID，不引 process.env（浏览器直跑无 node env）。
// 注：@cloudbase/js-sdk v2 以默认导出 `cloudbase` 暴露 `cloudbase.init(...)`（非 initCloudBase 具名导出）
import cloudbase from '@cloudbase/js-sdk'
// 关系型通路：注册 rdb（PostgreSQL）组件，使 cbApp.rdb() 可用（@cloudbase/mysql 的副作用）。
import '@cloudbase/mysql'

/** 环境 ID / 地域：来自 .env（VITE_TCB_ENV / VITE_TCB_REGION），默认上海 */
const TCB_ENV = import.meta.env.VITE_TCB_ENV
const TCB_REGION = import.meta.env.VITE_TCB_REGION || 'ap-shanghai'

console.log('[tcb] 配置环境 env:', TCB_ENV, 'region:', TCB_REGION)

/** CloudBase 应用单例 */
export const cbApp = cloudbase.init({
  env: TCB_ENV,
  region: TCB_REGION
})

/** ADR-07：业务以 family_code（localStorage 家庭码）隔离；跳过匿名登录，以未登录身份发起请求；软隔离（应用层 WHERE family_code，不建服务端 RLS） */
console.log('[tcb] 使用 family_code 隔离，跳过匿名登录')

/** 初始化就绪：跳过匿名登录，直接就绪（未登录身份走 RLS anon 策略 + family_id 隔离） */
export const initCloudBase = (): Promise<void> => Promise.resolve()

export const tcbReady = initCloudBase()

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
