<script setup lang="ts">
// 家长态薄条 · PAR-01（DEC-15 家长二审 = 事后兜底复核口，默认全直过，仅人工觉拧才改）
// 形态：壳层顶栏正下方的 inline 薄条（非全屏遮罩 / 非抽屉 / 非居中 modal），
//       文档流内普通元素，不阻断孩子态交互、不加全局事件拦截、不改路由守卫。
// 红线：零网络、零 localStorage/sessionStorage、零 Teleport/portal、零新 @keyframes、
//       零 transition-group、零星级/评分/百分比/进度条。样式只用既有 token，零色值字面量。
import { computed, onMounted, ref } from 'vue'
import {
  ATTRIBUTIONS,
  appendParentOverride,
  formatAuditTime,
  readAuditRows,
  type AuditRow
} from '../stores/parentAudit'

const emit = defineEmits<{ exit: [] }>()

/** 列表数据模型：两库只读聚合结果；默认全直过 = 无任何必覆写卡点 */
const rows = ref<AuditRow[]>([])
/** 单条就地展开键（session#题号），空串 = 全收 */
const openKey = ref('')
/** 本次会话内已选归因 + 轻反馈（纯内存，退出即随组件卸载清空） */
const picked = ref<Record<string, string>>({})
const noted = ref('')

const empty = computed<boolean>(() => rows.value.length === 0)

function keyOf(row: AuditRow): string {
  return `${row.session}#${row.no}`
}

/** 单条时间文案（毫秒优先，回落到采集批次时间） */
function timeOf(row: AuditRow): string {
  return formatAuditTime(row.ts, row.capture?.createdAt ?? '')
}

/** 单条当前归因：本次会话选的优先，否则读库里已 append 的家长覆写 */
function chosenOf(row: AuditRow): string {
  return picked.value[keyOf(row)] ?? row.overridden ?? ''
}

/** 轻反馈只落在刚写过的那一条上 */
function notifiedOf(row: AuditRow): string {
  return picked.value[keyOf(row)] !== undefined ? noted.value : ''
}

function toggle(row: AuditRow): void {
  openKey.value = openKey.value === keyOf(row) ? '' : keyOf(row)
}

/** 覆写：append 一条 diff 落盘 + 按钮态变化 + 一句轻反馈；不改任何孩子草稿态 */
async function override(row: AuditRow, reason: string): Promise<void> {
  const key = keyOf(row)
  try {
    await appendParentOverride({ session: row.session, no: row.no, reason })
  } catch {
    picked.value = { ...picked.value, [key]: picked.value[key] ?? '' }
    noted.value = '这次没存上。'
    return
  }
  picked.value = { ...picked.value, [key]: reason }
  noted.value = '记下了。'
}

onMounted(async () => {
  rows.value = await readAuditRows()
})

/** 退出口：纯内存清态（父级切 v-if 卸载本组件），不写任何持久化 */
function leave(): void {
  openKey.value = ''
  picked.value = {}
  noted.value = ''
  emit('exit')
}
</script>

<template>
  <!-- 家长态薄条 · inline 文档流元素，落在壳层顶栏正下方 -->
  <div class="parent-bar">
    <p class="parent-bar-hint">确认一下就好。</p>
    <button class="parent-bar-out" type="button" @click="leave">× 退出</button>
  </div>

  <section class="parent-body">
    <p class="parent-title">错题待确认</p>
    <!-- 默认全直过：只提示，不设必覆写卡点、不设必填、不阻断任何流程 -->
    <p class="parent-note">都先过去了。觉得不对，再改。</p>

    <!-- 空态：中性一句，不空白不报错 -->
    <p v-if="empty" class="parent-empty">这一阵没有要看的。</p>

    <ul v-else class="parent-list">
      <li v-for="row in rows" :key="keyOf(row)" class="parent-item">
        <button class="parent-row" type="button" @click="toggle(row)">
          <span class="parent-no">第 {{ row.no }} 题</span>
          <span class="parent-meta">
            {{ timeOf(row) }}
            · {{ row.capture ? `${row.capture.imageCount} 张` : '批次没对上' }}
          </span>
          <span class="parent-state">直过</span>
        </button>

        <!-- 单条就地展开 · 三行对照（无 Teleport / 无 portal / 无全屏浮层） -->
        <div v-if="openKey === keyOf(row)" class="parent-detail">
          <p class="parent-line"><span class="parent-k">题号</span>第 {{ row.no }} 题</p>
          <p class="parent-line"><span class="parent-k">孩子标记</span>{{ row.childMark }}</p>
          <p class="parent-line"><span class="parent-k">AI 建议</span>{{ row.aiHint }}</p>

          <p class="parent-ask">看着是哪一种？</p>
          <!-- 归因四选一 · DEC-15 -->
          <div class="parent-caps">
            <button
              v-for="reason in ATTRIBUTIONS"
              :key="reason"
              class="parent-cap"
              :class="{ 'is-on': chosenOf(row) === reason }"
              type="button"
              @click="override(row, reason)"
            >
              {{ reason }}
            </button>
          </div>
          <p v-if="notifiedOf(row)" class="parent-noted">{{ notifiedOf(row) }}</p>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
/* PAR-01 家长态薄条 · 全部样式落在本组件 scoped
 * 只用既有 token（--color-* / --violet-* / --font-* / --space-* / --radius-*），
 * 零新全局 token、零色值字面量、零新 @keyframes、零 transition。 */

.parent-bar {
  position: relative;
  z-index: 1;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  margin: 0 var(--space-3);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--violet-300);
  border-radius: var(--radius-md);
  background: var(--color-card-bg);
}

.parent-bar-hint {
  margin: 0;
  font-family: var(--font-family);
  font-size: var(--font-sm);
  color: var(--color-ink);
}

.parent-bar-out {
  flex: 0 0 auto;
  padding: 0 var(--space-2);
  border: 1px solid var(--violet-300);
  border-radius: var(--radius-pill);
  background: var(--color-primary-soft);
  font-family: var(--font-family);
  font-size: var(--font-sm);
  color: var(--color-ink-soft);
  cursor: pointer;
}

.parent-body {
  position: relative;
  z-index: 1;
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin: var(--space-2) var(--space-3) 0;
  padding: var(--space-3);
  border: 1px solid var(--violet-300);
  border-radius: var(--radius-md);
  background: var(--color-card-bg);
}

.parent-title {
  margin: 0;
  font-family: var(--font-family);
  font-size: var(--font-lg);
  font-weight: 600;
  letter-spacing: 0.5px;
  color: var(--color-ink);
}

.parent-note {
  margin: 0;
  font-family: var(--font-family);
  font-size: var(--font-sm);
  color: var(--color-ink-soft);
}

.parent-empty {
  margin: 0;
  padding: var(--space-2) 0;
  font-family: var(--font-family);
  font-size: var(--font-sm);
  color: var(--color-ink-faint);
}

.parent-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.parent-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  border-top: 1px solid var(--color-line);
  padding-top: var(--space-1);
}

.parent-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) 0;
  border: none;
  background: transparent;
  font-family: var(--font-family);
  font-size: var(--font-sm);
  color: var(--color-ink);
  cursor: pointer;
  text-align: left;
}

.parent-no {
  flex: 0 0 auto;
  font-weight: 600;
}

.parent-meta {
  flex: 1 1 auto;
  color: var(--color-ink-faint);
}

.parent-state {
  flex: 0 0 auto;
  padding: 2px var(--space-2);
  border-radius: var(--radius-pill);
  background: var(--color-primary);
  color: var(--color-primary-deep);
}

/* 单条就地展开 · 纸面内浅色底，不浮到屏幕外 */
.parent-detail {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-2);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-sm);
  background: var(--violet-100);
}

.parent-line {
  margin: 0;
  font-family: var(--font-family);
  font-size: var(--font-sm);
  color: var(--color-ink);
}

.parent-k {
  display: inline-block;
  min-width: 5em;
  margin-right: var(--space-1);
  color: var(--color-ink-soft);
}

.parent-ask {
  margin: var(--space-1) 0 0;
  font-family: var(--font-family);
  font-size: var(--font-sm);
  color: var(--color-ink-soft);
}

.parent-caps {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}

.parent-cap {
  padding: 2px var(--space-2);
  border: 1px solid var(--violet-300);
  border-radius: var(--radius-pill);
  background: var(--color-card-bg);
  font-family: var(--font-family);
  font-size: var(--font-sm);
  color: var(--color-ink-soft);
  cursor: pointer;
}

.parent-cap.is-on {
  background: var(--color-primary);
  border-color: var(--color-primary-deep);
  color: var(--color-ink);
}

.parent-noted {
  margin: 0;
  font-family: var(--font-family);
  font-size: var(--font-sm);
  color: var(--color-ink-soft);
}
</style>