<script setup lang="ts">
// 讲题流页 · TCH-01（引导段 → 翻转触发句 → 主讲静听段，三段单页无子路由）
// 契约锚：DEC-19·修订（苏格拉底只追问不直给 / 静听不打断 / 完成事件落盘不渲染评价面板）
//        DEC-16（讲题内容仅存在于本页，批改结果页零泄露）
//        DEC-11（孩子端零决策：只做/继续/收，无二选一）
//        Q3 讲题退出落点 = A 退回作业桌（路由解耦，本片首次落地）
// 红线：零题面重渲（不 import 批改数据 / 不读 captureStore）、零评分星级徽章、
//       零评价面板 DOM、零网络、零新 @keyframes、零 transition-group、无子路由。
import { computed, ref } from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import {
  BACK_HOME,
  FLIP_NEXT,
  FLIP_TRIGGER,
  GUIDE_NEXT,
  LISTEN_DONE,
  LISTEN_HINT,
  SOCRATIC_QUESTIONS
} from '../constants/teachPhrases'

type TeachStage = 'guide' | 'flip' | 'listen'

const route = useRoute()
const router = useRouter()

/** 取 query 单值（缺参 / 数组 / null 一律归一为空串，缺参静默兜底不做任何报错） */
function firstValue(raw: unknown): string {
  if (typeof raw === 'string') return raw.trim()
  if (Array.isArray(raw)) {
    const head = raw.find((v): v is string => typeof v === 'string')
    return head ? head.trim() : ''
  }
  return ''
}

/** 入参：session（批次号）与 ids（逗号题号串）；只消费题号元数据，不拉任何题内容 */
const sessionId = firstValue(route.query.session)
const itemIds = firstValue(route.query.ids)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

/** 缺参 / ids 为空 → 立刻静默退回作业桌，不报错、不白屏、不闪一帧空内容 */
const ready = ref(sessionId !== '' && itemIds.length > 0)
if (!ready.value) void router.replace('/home')

/** 三段式本地阶段位（不用路由子页，不用任何过渡动画） */
const stage = ref<TeachStage>('guide')

/** 当前题序号（从 0 起，题序来自 ids 数组下标）；苏格拉底追问按题序取模，不随机 */
const index = ref(0)
const question = computed<string>(
  () => SOCRATIC_QUESTIONS[index.value % SOCRATIC_QUESTIONS.length] ?? SOCRATIC_QUESTIONS[0] ?? ''
)
/** 轻量位置提示（只读 ids 元数据的条数，不渲染任何题面） */
const position = computed<string>(() => `第 ${index.value + 1} 题 · 共 ${itemIds.length} 题`)

/* ---------------------------------------------------------------------------
 * 主讲完成事件落盘（DEC-19：主讲完成事件落盘，一期不渲染评价面板）
 * 纯 append 写、零读、零渲染；原生 IndexedDB，零第三方依赖。
 *
 * 独立库说明：CAP-01 的 captureStore 以显式版本号 open(name, 1)，若本片把
 * nancy-bookhouse 抬到 v2 建表，该文件（禁改）下一次 open 会抛 VersionError
 * 打断采集链。故另开独立库nancy-bookhouse-teach 建独立表teach-events，
 * 零触碰既有库与既有文件。
 * ------------------------------------------------------------------------- */
const EVENT_DB_NAME = 'nancy-bookhouse-teach'
const EVENT_DB_VERSION = 1
const EVENT_STORE = 'teach-events'

/** 打开（必要时升级）讲题事件库 */
function openEventDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(EVENT_DB_NAME, EVENT_DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(EVENT_STORE)) {
        // 无 keyPath + autoIncrement：每次add 自增主键，纯追加永不改写旧记录
        db.createObjectStore(EVENT_STORE, { autoIncrement: true })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('indexedDB open failed'))
  })
}

/** append 写一条主讲完成事件（只写不读；失败不阻断退出） */
async function appendTeachEvent(payload: {
  type: 'teach-done'
  session: string
  itemIds: string[]
  ts: number
}): Promise<void> {
  const db = await openEventDb()
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(EVENT_STORE, 'readwrite')
      tx.objectStore(EVENT_STORE).add(payload)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error ?? new Error('indexedDB add failed'))
      tx.onabort = () => reject(tx.error ?? new Error('indexedDB add aborted'))
    })
  } finally {
    db.close()
  }
}

/** 退出在途闸：防重复落盘 / 防守卫与按钮双触发 */
let leaving = false

/**
 * 唯一退出口（Q3 = A 退回作业桌）：段三「收起来」/ 左上「← 回去」/ 手势返回守卫三入口共用。
 * 顺序固定：① append 落盘 teach-done 事件 → ② router.replace('/home')（replace 非 push，不增长历史）
 */
async function leaveTeach(): Promise<void> {
  if (leaving) return
  leaving = true
  try {
    await appendTeachEvent({
      type: 'teach-done',
      session: sessionId,
      itemIds: [...itemIds],
      ts: Date.now()
    })
  } catch {
    console.debug('[teach] event append skipped')
  }
  await router.replace('/home')
}

/** 手势返回兜底：任何离开本路由的导航都拦下，改走同一退出口，绝不放行回到批改页堆叠 */
onBeforeRouteLeave(() => {
  if (leaving) return true // 退出口自身发起的 replace，放行以免自锁
  void leaveTeach()
  return false
})
</script>

<template>
  <div v-if="ready" class="teach">
    <button class="teach-back" type="button" @click="leaveTeach">{{ BACK_HOME }}</button>

    <!-- 段一 · 引导段：同一时刻只显示一句苏格拉底追问（无输入框/无录音/无评分） -->
    <section v-if="stage === 'guide'" class="teach-stage">
      <p class="teach-pos">{{ position }}</p>
      <p class="teach-line">{{ question }}</p>
      <button class="teach-next" type="button" @click="stage = 'flip'">{{ GUIDE_NEXT }}</button>
    </section>

    <!-- 段二 · 翻转触发句：一句温度软话，无评分结论句 -->
    <section v-else-if="stage === 'flip'" class="teach-stage">
      <p class="teach-line">{{ FLIP_TRIGGER }}</p>
      <button class="teach-next" type="button" @click="stage = 'listen'">{{ FLIP_NEXT }}</button>
    </section>

    <!-- 段三 · 主讲静听段：不打断不纠错，零评价面板 DOM（DEC-19 一期仅落事件） -->
    <section v-else class="teach-stage">
      <p class="teach-line">{{ LISTEN_HINT }}</p>
      <button class="teach-next" type="button" @click="leaveTeach">{{ LISTEN_DONE }}</button>
    </section>
  </div>
</template>

<style scoped>
/* TCH-01 讲题流页样式 · 仅本页 scoped
 * 不新写背景层、不新增 ::before/::after 星空层、零新 @keyframes；
 * 只用既有 token，不新增全局 token，不含任何色值字面量。 */

.teach {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding-top: var(--space-2);
  /* 消解固定底栏微遮：内容底部留足滚动余量 */
  padding-bottom: calc(var(--shell-bottom-h) + var(--space-3));
}

/* 左上轻返回键（与段三「收起来」同走 leaveTeach） */
.teach-back {
  align-self: flex-start;
  padding: 0;
  border: none;
  background: transparent;
  font-family: var(--font-family);
  font-size: var(--font-sm);
  color: var(--color-ink-soft);
  cursor: pointer;
}

/* 三段共用的纸面容器：瞬切，无 transition / 无 v-enter */
.teach-stage {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-3);
  border: 1px solid var(--violet-300);
  border-radius: var(--radius-md);
  background: var(--color-card-bg);
}

.teach-pos {
  margin: 0;
  font-family: var(--font-family);
  font-size: var(--font-sm);
  color: var(--color-ink-faint);
}

/* 主句：纸面深字，字号走 --font-lg，句长已在文案层收住 */
.teach-line {
  margin: 0;
  font-family: var(--font-family);
  font-size: var(--font-lg);
  font-weight: 600;
  letter-spacing: 0.5px;
  color: var(--color-ink);
}

.teach-next {
  height: 48px;
  border: 1px solid var(--violet-300);
  border-radius: var(--radius-md);
  background: var(--color-card-bg);
  font-family: var(--font-family);
  font-size: var(--font-base);
  color: var(--color-ink);
  cursor: pointer;
}
</style>