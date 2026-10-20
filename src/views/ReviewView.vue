<script setup lang="ts">
// 批改结果页 · REV-01 基底 + REV-02 订正重判 + REV-03 要讲标记聚合切片
// 契约锚：03_context.md §3 ⑫ Q2 整包收齐→一次赋值→整批直铺 / DEC-11·15·16·17·19
// REV-01：三态题卡整批直铺 / Tab 切视图 / 归因四胶囊 / ⟲判一下翻转；
// REV-02：题卡左下「订正」→ 就地行内输入区（键盘输入 / 📷拍照二选）→ 提交后单题重判（桩判定）。
// REV-03：题卡右下「要讲」→ 题号旁静态星芒 / 长按题号＝家长指定（硬覆盖）/ 底部簇区 computed 派生成「开始讲题」。
// 切片边界：TCH-01 讲题页（本片只建路由与占位页，零讲题内容）/ PAR-01 家长二审与验证一律不在本页实现。
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { readCapture } from '../stores/captureStore'
import { judgeStub, mockReviewItems, type MockReviewItem } from '../constants/mockReview'

/** 题卡渲染单位 = 桩项 + 归因草稿态（孩子点选即草稿，默认空不强制，DEC-15） */
interface ReviewCard extends MockReviewItem {
  reason: string
}

/** 归因四胶囊（DEC-15 文案锁定，默认全灰未选） */
const REASONS = ['粗心', '概念不清', '方法不会', '审题偏差'] as const

/** 顶部 Tab：默认「错题+空题」，纯本地 filter，不触路由 */
const TABS = [
  { key: 'focus', label: '错题+空题' },
  { key: 'all', label: '全部' }
] as const

type ReviewTab = (typeof TABS)[number]['key']

const route = useRoute()
const router = useRouter()
const activeTab = ref<ReviewTab>('focus')

/** 本次采集轻信息（mode + 张数），来自 IndexedDB 真记录；查无记录则回退轻提示 */
const captureMeta = ref<{ mode: string; count: number } | null>(null)

/** 本次采集 session（来自 /capture 跳转时带的 query）；无则空串，跳讲题页时原样透传 */
const sessionId = computed(() => (typeof route.query.session === 'string' ? route.query.session : ''))

/** Q2 整包收齐 → 一次赋值 → 整批直铺：默认先铺桩（真源在 onMounted 里整包替换一次），无 stagger / 无逐条显形 */
const reviewItems = ref<ReviewCard[]>(mockReviewItems.map((item) => ({ ...item, reason: '' })))

onMounted(async () => {
  const sid = sessionId.value
  if (sid === '') return
  try {
    const payload = await readCapture(sid)
    if (payload === null) return
    captureMeta.value = { mode: payload.mode, count: payload.images.length }
    // OCR-L1 真源优先：有且 items 非空 → 整包一次赋值（Q2 不变，不逐条 push、不改数组结构）
    const ocr = payload.ocr
    if (ocr !== undefined && ocr.items.length > 0) {
      reviewItems.value = ocr.items.map((item) => ({
        id: item.id,
        no: item.no,
        state: item.state,
        knowledge: item.knowledge,
        questionType: item.questionType,
        answer: item.answer,
        reason: ''
      }))
    }
  } catch {
    // 读不到不报错、不空白：captureMeta 保持 null，落「无采集记录」轻提示，题卡照常铺
    captureMeta.value = null
  }
})

/** Tab 过滤：focus = 错题+空题（state !== 'correct'）；all = 不过滤。纯 computed，无路由动作 */
const visibleItems = computed<ReviewCard[]>(() =>
  activeTab.value === 'all' ? reviewItems.value : reviewItems.value.filter((item) => item.state !== 'correct')
)

const modeLabel = computed(() => (captureMeta.value?.mode === 'mt' ? '口算批改' : '作业批改'))

function stateLabel(state: ReviewCard['state']): string {
  if (state === 'correct') return '对上了'
  if (state === 'wrong') return '没对上'
  return '空着'
}

/** 归因胶囊：单选语义 toggle（点已选取消，点新的换选）；不选也能继续，无任何强制卡点 */
function toggleReason(id: string, reason: string): void {
  const card = reviewItems.value.find((item) => item.id === id)
  if (card === undefined) return
  card.reason = card.reason === reason ? '' : reason
}

/** DEC-16 ⟲判一下？浮层：就地 v-if 半透层，非常驻不主动弹；同一时刻只开一张卡的浮层 */
const judgeOpenId = ref<string | null>(null)

function toggleJudge(id: string): void {
  judgeOpenId.value = judgeOpenId.value === id ? null : id
}

function closeJudge(): void {
  judgeOpenId.value = null
}

/** [翻]：correct ↔ wrong 双向翻转，state 即时生效、色轨随 class 立即变；空题不参与翻转 */
function flipState(id: string): void {
  const card = reviewItems.value.find((item) => item.id === id)
  if (card === undefined || card.state === 'empty') return
  card.state = card.state === 'correct' ? 'wrong' : 'correct'
  judgeOpenId.value = null
}

/* ---------------------------------------------------------------------------
 * REV-02 订正重判（DEC-17）：左键「订正」→ 就地展开行内输入区 → 键盘输入 / 📷拍照二选
 * → 提交后单题重判。零弹层、零传送门、零路由跳转、零整页重渲。
 * ------------------------------------------------------------------------- */

/** 订正区状态模型：同一时刻只开一张题的输入区（与 DEC-16 浮层同一克制口径）
 *  - fixOpenId 哪张题开着订正区（null = 全收）
 *  - fixMode   二选一切换：键盘输入 / 拍照上传
 *  - fixText   键盘输入的答案原文
 *  - fixPhoto  已选照片文件名（空串 = 未选）
 *  这四项只描述「当前这一张」，不写进题卡对象，收起即清空，不污染题卡数据。 */
type FixMode = 'keyboard' | 'photo'

const fixOpenId = ref<string | null>(null)
const fixMode = ref<FixMode>('keyboard')
const fixText = ref('')
const fixPhoto = ref('')

/** 「这次订正对上了」的一次性微反馈标记；仅用于挂 .is-fresh 淡入，非渲染节奏 */
const freshId = ref<string | null>(null)
let freshTimer: ReturnType<typeof setTimeout> | null = null

/** 打开 / 收起题卡的订正区（就地展开，不挂任何 transition，避免抖动） */
function toggleFix(id: string): void {
  if (fixOpenId.value === id) {
    closeFix()
    return
  }
  fixOpenId.value = id
  fixMode.value = 'keyboard'
  fixText.value = ''
  fixPhoto.value = ''
}

/** 收起订正区：清掉草稿，题卡与其它题一律不动 */
function closeFix(): void {
  fixOpenId.value = null
  fixMode.value = 'keyboard'
  fixText.value = ''
  fixPhoto.value = ''
}

/** 二选一切换（键盘输入 / 📷拍照上传），切的是同一块行内区，不新增面板 */
function switchFixMode(mode: FixMode): void {
  fixMode.value = mode
}

/** 📷 选好照片后只留文件名回显；不上传、不读内容、不发任何请求 */
function onPickPhoto(event: Event): void {
  const input = event.target as HTMLInputElement
  fixPhoto.value = input.files !== null && input.files.length > 0 ? (input.files[0]?.name ?? '') : ''
}

/** 提交「交上去」：单题重判。
 *  数据更新粒度 —— 只对 reviewItems 里这一项的 state 字段做原地赋值，
 *  既不替换数组、不过滤列表、不动其它题，Vue 因此只 patch 这一个 class 与这一处文本。 */
function submitFix(id: string): void {
  const card = reviewItems.value.find((item) => item.id === id)
  if (card === undefined) return

  // 二选一：拍照上传时把已选文件名当作本次订正内容（桩判定层只看文本，不看图）
  const given = fixMode.value === 'photo' ? fixPhoto.value : fixText.value
  const before = card.state
  const after = judgeStub(card, given)

  // 没写 / 写空：judgeStub 原样返回原 state，这里再兜一层，保证「没写就不动」
  if (after === before) {
    closeFix()
    return
  }

  card.state = after

  // 错 → 对 这一次给个淡入微反馈（只换 background-color，过渡复用 0.18s）
  if (after === 'correct' && before !== 'correct') {
    freshId.value = id
    if (freshTimer !== null) clearTimeout(freshTimer)
    // 定时器只做一件事：稍后摘掉反馈 class，绝不参与渲染节奏
    freshTimer = setTimeout(() => {
      freshId.value = null
      freshTimer = null
    }, 1600)
  }

  closeFix()
}

/* ---------------------------------------------------------------------------
 * REV-03 要讲标记聚合（DEC-17 / DEC-19·修订）
 * - 题卡右下「要讲」→ 题号旁亮静态星芒（纯 CSS ::after，零动画、零新资源）
 * - 长按题号 ≥ PARENT_HOLD_MS → 家长指定要讲（硬覆盖，孩子点「要讲」取消不掉；再长按一次解除）
 * - 标记存在两个独立容器（孩子 / 家长），聚合题集 = 并集；底部簇区由 computed 派生成「开始讲题」
 * - 长按只写权重位：零家长验证、零家长态面板、零提示气泡（PAR-01 才做验证）
 * ------------------------------------------------------------------------- */

/** 家长长按判定阈值（ms）。写在视图内、不入 constants/：本片不新增常量文件 */
const PARENT_HOLD_MS = 600

/** 孩子点的「要讲」标记（键为题卡 id）；不写进 reviewItems 题卡对象，保持 REV-02「只改字段」粒度 */
const markedIds = ref<Set<string>>(new Set())
/** 家长长按指定的「要讲」标记（键为题卡 id）；权重高于孩子标记（DEC-19 硬覆盖） */
const parentMarkedIds = ref<Set<string>>(new Set())

/** 聚合题集 = 家长指定 ∪ 孩子标记，按题卡原序排列（并集，非任一容器） */
const teachItems = computed<ReviewCard[]>(() =>
  reviewItems.value.filter((item) => parentMarkedIds.value.has(item.id) || markedIds.value.has(item.id))
)

/** 跳转用的题号串（逗号连接，如 '1,4'） */
const teachNos = computed<string[]>(() => teachItems.value.map((item) => item.no))

/** 是否已有标记 —— 底部簇区变身的唯一判据，纯 computed 派生，无手动 boolean toggle */
const hasMarked = computed(() => teachNos.value.length > 0)

/** 簇区回显用的题号串（顿号连接，仅人读） */
const teachNoText = computed(() => teachNos.value.join('、'))

function isMarked(id: string): boolean {
  return parentMarkedIds.value.has(id) || markedIds.value.has(id)
}

/** 孩子点「要讲」：再点取消。家长指定过的题硬覆盖，取消不掉（DEC-19） */
function toggleMark(id: string): void {
  if (parentMarkedIds.value.has(id)) return
  const next = new Set(markedIds.value)
  if (!next.delete(id)) next.add(id)
  markedIds.value = next
}

/** 家长长按：到时置/撤家长指定权重位。孩子标记同时清掉，避免撤指定后残留孩子态 */
function toggleParentMark(id: string): void {
  const next = new Set(parentMarkedIds.value)
  const wasOn = next.has(id)
  if (wasOn) next.delete(id)
  else next.add(id)
  parentMarkedIds.value = next

  if (wasOn) {
    const kid = new Set(markedIds.value)
    kid.delete(id)
    markedIds.value = kid
  }
}

/** 长按计时：pointerdown 起表，到 PARENT_HOLD_MS 置家长指定；抬手/取消/移出未到时数则撤表（短按不误触发） */
let holdTimer: ReturnType<typeof setTimeout> | null = null

function clearHold(): void {
  if (holdTimer !== null) {
    clearTimeout(holdTimer)
    holdTimer = null
  }
}

function onNoDown(id: string): void {
  clearHold()
  holdTimer = setTimeout(() => {
    holdTimer = null
    toggleParentMark(id)
  }, PARENT_HOLD_MS)
}

/** 离页时撤表，避免定时器泄漏；无其它副作用 */
onBeforeUnmount(clearHold)

/** 进讲题流：push（非 replace），保留回退栈回作业桌；query 带 session + ids（Q3·A 精神） */
function startTeach(): void {
  const ids = teachNos.value
  if (ids.length === 0) return
  router.push({ name: 'teach', query: { session: sessionId.value, ids: ids.join(',') } })
}
</script>

<template>
  <div class="review">
    <header class="review-head">
      <h1 class="review-title">批改结果</h1>
      <p class="review-sub">墨痕摊开了，一题一题看。</p>
      <p v-if="captureMeta !== null" class="review-meta">{{ modeLabel }} · 这一叠 {{ captureMeta.count }} 张。</p>
      <p v-else class="review-meta">这一叠还没存下来，先看看题。</p>
    </header>

    <nav class="review-tabs">
      <button
        v-for="tab in TABS"
        :key="tab.key"
        class="review-tab"
        :class="{ 'is-on': activeTab === tab.key }"
        type="button"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </nav>

    <p class="review-count">这一屏 {{ visibleItems.length }} 题。</p>

    <ul class="review-list">
      <li
        v-for="item in visibleItems"
        :key="item.id"
        class="review-item"
        :class="[`is-${item.state}`, { 'is-fresh': freshId === item.id }]"
      >
        <span class="review-rail" aria-hidden="true"></span>

        <div class="review-body">
          <div class="review-top">
            <span
              class="review-no"
              :class="{ 'is-lit': isMarked(item.id) }"
              @pointerdown="onNoDown(item.id)"
              @pointerup="clearHold"
              @pointercancel="clearHold"
              @pointerleave="clearHold"
              @contextmenu.prevent
            >第 {{ item.no }} 题</span>
            <span class="review-badge">{{ stateLabel(item.state) }}</span>
            <button class="review-judge-btn" type="button" @click="toggleJudge(item.id)">⟲判一下？</button>
          </div>

          <p v-if="item.answer" class="review-answer">{{ item.answer }}</p>

          <div class="review-tags">
            <p class="review-line">🏷知识点：{{ item.knowledge }}（AI自动·只读）</p>
            <p class="review-line">🏷题型：{{ item.questionType }}（AI自动·只读）</p>
            <div class="review-line review-reason-row">
              <span class="review-ask">💬这题卡在哪了？</span>
              <div class="review-caps">
                <button
                  v-for="reason in REASONS"
                  :key="reason"
                  class="review-cap"
                  :class="{ 'is-on': item.reason === reason }"
                  type="button"
                  @click="toggleReason(item.id, reason)"
                >
                  {{ reason }}
                </button>
              </div>
            </div>
          </div>

          <!-- DEC-17 订正键：题卡左下角，就地展开行内输入区（非弹层 / 非新页 / 无 teleport） -->
          <div class="review-fix-row">
            <button
              class="review-fix-btn"
              type="button"
              @click="toggleFix(item.id)"
            >
              订正
            </button>
            <span class="review-fix-tip">订正完再看一眼。</span>

            <!-- DEC-17「要讲」键：题卡右下，与左下「订正」形成对角；家长指定过的题点不动（硬覆盖） -->
            <button
              class="review-mark-btn"
              :class="{ 'is-on': isMarked(item.id) }"
              type="button"
              @click="toggleMark(item.id)"
            >
              要讲
            </button>
          </div>

          <!-- 行内订正输入区：键盘输入 / 📷拍照上传 二选（DEC-17） -->
          <div v-if="fixOpenId === item.id" class="review-fix">
            <div class="review-fix-modes">
              <button
                class="review-fix-mode"
                :class="{ 'is-on': fixMode === 'keyboard' }"
                type="button"
                @click="switchFixMode('keyboard')"
              >
                键盘输入
              </button>
              <button
                class="review-fix-mode"
                :class="{ 'is-on': fixMode === 'photo' }"
                type="button"
                @click="switchFixMode('photo')"
              >
                📷拍照上传
              </button>
            </div>

            <input
              v-if="fixMode === 'keyboard'"
              v-model="fixText"
              class="review-fix-input"
              type="text"
              placeholder="写上答案"
            />

            <div v-else class="review-fix-photo">
              <label class="review-fix-pick">
                📷拍订正照
                <input class="review-fix-file" type="file" accept="image/*" @change="onPickPhoto" />
              </label>
              <span v-if="fixPhoto !== ''" class="review-fix-picked">{{ fixPhoto }}</span>
              <span v-else class="review-fix-picked is-none">还没选照片。</span>
            </div>

            <div class="review-fix-actions">
              <button class="review-fix-submit" type="button" @click="submitFix(item.id)">交上去</button>
              <button class="review-fix-cancel" type="button" @click="closeFix">先不写</button>
            </div>
          </div>

          <!-- DEC-16纠错浮层：题卡内绝对定位，不引传送门/全屏遮罩/独立路由，不引起布局重排 -->
          <div v-if="judgeOpenId === item.id" class="review-judge-layer">
            <span class="review-judge-ask">这道判得对吗？</span>
            <button
              class="review-judge-do"
              type="button"
              :disabled="item.state === 'empty'"
              @click="flipState(item.id)"
            >
              翻
            </button>
            <button class="review-judge-do" type="button" @click="closeJudge">保持</button>
            <button class="review-judge-close" type="button" @click="closeJudge">关掉</button>
          </div>
        </div>
      </li>
    </ul>

    <p v-if="visibleItems.length === 0" class="review-empty">这一叠都对上了。</p>

    <!-- REV-03 聚合簇区：空态是轻提示，非空时整块原位变身「开始讲题」钮（纯 computed 派生，无手动 toggle） -->
    <div class="review-cluster">
      <p v-if="!hasMarked" class="review-cluster-empty">还没挑要讲的题。</p>
      <button v-else class="review-cluster-btn" type="button" @click="startTeach">
        <span class="review-cluster-label">开始讲题</span>
        <span class="review-cluster-sub">挑了 {{ teachNos.length }} 题 · 第 {{ teachNoText }} 题</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* REV-01 批改结果页样式 · 仅本页 scoped，不动任何既有样式文件与既有选择器 */
/* 三态色轨：tokens.css 无绿/橙 token（WB 裁定②），本页根类集中定义一次，便于日后提升为全局 token。
   值取低饱和雾绿 / 暖橙，守儿童视觉安静红线；模板与逻辑代码零色值字面量。 */
.review {
  --state-correct: #86b08a; /* 雾绿 · 对上了 */
  --state-wrong: #dda16b; /* 暖橙 · 没对上 */

  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding-top: var(--space-2);
  padding-bottom: calc(var(--shell-bottom-h) + var(--space-3));
}

.review-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.review-title {
  margin: 0;
  font-size: var(--font-lg);
  font-weight: 600;
  font-family: var(--font-family);
  letter-spacing: 0.5px;
  color: var(--color-primary);
}
.review-sub {
  margin: 0;
  font-size: var(--font-sm);
  font-family: var(--font-family);
  color: var(--color-primary-soft);
}
.review-meta {
  margin: 0;
  font-size: var(--font-sm);
  font-family: var(--font-family);
  color: var(--violet-300);
}

/* 顶部 Tab · 浅底深字，激活态与未激活态可分辨；切换纯本地 filter，无路由跳转 */
.review-tabs {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}
.review-tab {
  padding: 6px var(--space-3);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-pill);
  background: var(--violet-100);
  color: var(--color-ink-soft);
  font-family: var(--font-family);
  font-size: var(--font-sm);
  cursor: pointer;
}
.review-tab.is-on {
  background: var(--color-primary-deep);
  border-color: var(--color-primary-deep);
  color: var(--color-ink);
  font-weight: 600;
}

.review-count {
  margin: 0;
  font-size: var(--font-sm);
  font-family: var(--font-family);
  color: var(--violet-300);
}

/* 题卡整批直铺：零 transition / 零 animation / 零 keyframes，真机滚动不抖动不重排 */
.review-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}
.review-item {
  position: relative;
  display: flex;
  gap: var(--space-2);
  padding: var(--space-2);
  padding-left: calc(var(--space-2) + 6px);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-sm);
  background: var(--color-card-bg);
  transition: background-color 0.18s ease;
}
/* REV-02 错→对 一次性微反馈：只淡入一次卡面底色，位移/缩放/旋转一律不做；
   时长沿用色轨同一档 0.18s，不新建 @keyframes */
.review-item.is-fresh {
  background: var(--violet-100);
}

/* 三态色轨（卡片左侧竖条）：随 state class 即时切换 */
.review-rail {
  position: absolute;
  left: 0;
  top: var(--space-2);
  bottom: var(--space-2);
  width: 6px;
  border-radius: var(--radius-sm);
  transition: background-color 0.18s ease;
}
.review-item.is-correct .review-rail {
  background: var(--state-correct);
}
.review-item.is-wrong .review-rail {
  background: var(--state-wrong);
}
.review-item.is-empty .review-rail {
  background: var(--color-ink-faint);
}

.review-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

/* 题卡主区右上角轻浮钮 ⟲判一下？（DEC-16） */
.review-top {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.review-no {
  position: relative;
  padding-right: 16px;
  font-size: var(--font-sm);
  font-weight: 600;
  font-family: var(--font-family);
  color: var(--color-ink);
  /* 长按题号时不触发原生选词/长按菜单，保证隐藏手势不被系统行为打断（禁 contextmenu 已在模板处理） */
  user-select: none;
  -webkit-user-select: none;
}
/* DEC-17 题号旁星芒：纯 CSS ::after 四角菱形光点（clip-path 静态形状），
   亮=已标记、灭=未标记。零 @keyframes、零 animation、零 transition、零新资源（不新增 SVG/图片/字体图标） */
.review-no::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 0;
  width: 10px;
  height: 10px;
  margin-top: -5px;
  clip-path: polygon(50% 0%, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0% 50%, 38% 38%);
  background: var(--color-ink-faint);
  opacity: 0.28;
}
.review-no.is-lit::after {
  background: var(--violet-400);
  opacity: 1;
}
.review-badge {
  padding: 2px 10px;
  border-radius: var(--radius-pill);
  background: var(--violet-100);
  color: var(--color-ink-soft);
  font-size: var(--font-sm);
  font-family: var(--font-family);
}
.review-judge-btn {
  margin-left: auto;
  padding: 4px 10px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-pill);
  background: var(--color-glass);
  color: var(--color-ink-soft);
  font-family: var(--font-family);
  font-size: var(--font-sm);
  cursor: pointer;
}

.review-answer {
  margin: 0;
  font-size: var(--font-base);
  font-family: var(--font-family);
  color: var(--color-ink);
  word-break: break-all;
}

/* 标签三行 · 独立分行、左对齐轻灰字（DEC-17） */
.review-tags {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.review-line {
  margin: 0;
  font-size: var(--font-sm);
  font-family: var(--font-family);
  color: var(--color-ink-soft);
}
.review-reason-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.review-ask {
  font-size: var(--font-sm);
  font-family: var(--font-family);
  color: var(--color-ink-soft);
}

/* 归因四胶囊 · 默认全灰未选，单选高亮，不强制必选（DEC-15） */
.review-caps {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.review-cap {
  padding: 4px 12px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-pill);
  background: var(--violet-100);
  color: var(--color-ink-soft);
  font-family: var(--font-family);
  font-size: var(--font-sm);
  cursor: pointer;
}
.review-cap.is-on {
  background: var(--color-primary-deep);
  border-color: var(--color-primary-deep);
  color: var(--color-ink);
  font-weight: 600;
}

/* DEC-16 半透浮层：绝对定位挂在题卡内，出现/消失不改文档流 */.review-judge-layer {
  position: absolute;
  top: 40px;
  left: calc(var(--space-2) + 6px);
  right: var(--space-2);
  z-index: 3;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-sm);
  background: var(--color-glass);
  box-shadow: var(--shadow-mist);
}
.review-judge-ask {
  font-size: var(--font-sm);
  font-family: var(--font-family);
  color: var(--color-ink-soft);
}
.review-judge-do {
  padding: 4px 14px;
  border: 1px solid var(--violet-300);
  border-radius: var(--radius-pill);
  background: var(--color-card-bg);
  color: var(--color-ink);
  font-family: var(--font-family);
  font-size: var(--font-sm);
  cursor: pointer;
}
.review-judge-do:disabled {
  border-color: var(--color-line);
  color: var(--color-ink-faint);
  cursor: default;
}
.review-judge-close {
  margin-left: auto;
  border: none;
  background: transparent;
  color: var(--color-ink-faint);
  font-family: var(--font-family);
  font-size: var(--font-sm);
  cursor: pointer;
}

/* ---- REV-02 订正（DEC-17）· 键在题卡左下，输入区就地展开 ---- */
.review-fix-row {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  margin-top: 2px;
}
/* DEC-17「要讲」键：题卡右下，与左下「订正」对角；不引发布局重排的 transition 一律不加 */
.review-mark-btn {
  margin-left: auto;
  padding: 4px 14px;
  border: 1px solid var(--violet-300);
  border-radius: var(--radius-pill);
  background: var(--color-card-bg);
  color: var(--color-ink);
  font-family: var(--font-family);
  font-size: var(--font-sm);
  cursor: pointer;
}
.review-mark-btn.is-on {
  background: var(--color-primary-deep);
  border-color: var(--color-primary-deep);
  color: var(--color-ink);
  font-weight: 600;
}
.review-fix-btn {
  padding: 4px 14px;
  border: 1px solid var(--violet-300);
  border-radius: var(--radius-pill);
  background: var(--color-card-bg);
  color: var(--color-ink);
  font-family: var(--font-family);
  font-size: var(--font-sm);
  cursor: pointer;
}
.review-fix-tip {
  font-size: var(--font-sm);
  font-family: var(--font-family);
  color: var(--color-ink-faint);
}

/* 行内输入区：普通文档流内就地插入，零 transition / 零 animation / 零 keyframes */
.review-fix {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-2);
  border: 1px dashed var(--color-line);
  border-radius: var(--radius-sm);
  background: var(--violet-100);
}
.review-fix-modes {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.review-fix-mode {
  padding: 4px 12px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-pill);
  background: var(--color-card-bg);
  color: var(--color-ink-soft);
  font-family: var(--font-family);
  font-size: var(--font-sm);
  cursor: pointer;
}
.review-fix-mode.is-on {
  background: var(--color-primary-deep);
  border-color: var(--color-primary-deep);
  color: var(--color-ink);
  font-weight: 600;
}
.review-fix-input {
  width: 100%;
  padding: 8px var(--space-2);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-sm);
  background: var(--color-card-bg);
  color: var(--color-ink);
  font-family: var(--font-family);
  font-size: var(--font-base);
}
.review-fix-input::placeholder {
  color: var(--color-ink-faint);
}
.review-fix-photo {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-1);
}
.review-fix-pick {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-pill);
  background: var(--color-card-bg);
  color: var(--color-ink-soft);
  font-family: var(--font-family);
  font-size: var(--font-sm);
  cursor: pointer;
}
.review-fix-file {
  max-width: 180px;
  font-family: var(--font-family);
  font-size: var(--font-sm);
  color: var(--color-ink-soft);
}
.review-fix-picked {
  font-size: var(--font-sm);
  font-family: var(--font-family);
  color: var(--color-ink-soft);
  word-break: break-all;
}
.review-fix-picked.is-none {
  color: var(--color-ink-faint);
}
.review-fix-actions {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}
.review-fix-submit {
  padding: 6px 16px;
  border: 1px solid var(--color-primary-deep);
  border-radius: var(--radius-pill);
  background: var(--color-primary-deep);
  color: var(--color-ink);
  font-family: var(--font-family);
  font-size: var(--font-sm);
  cursor: pointer;
}
.review-fix-cancel {
  padding: 6px 14px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-pill);
  background: var(--color-card-bg);
  color: var(--color-ink-soft);
  font-family: var(--font-family);
  font-size: var(--font-sm);
  cursor: pointer;
}

.review-empty {
  margin: 0;
  font-size: var(--font-sm);
  font-family: var(--font-family);
  color: var(--violet-300);
}

/* ---- REV-03 聚合簇区 · 空态轻提示 ⇄ 非空整块变身「开始讲题」 ----
   变身判据是 hasMarked computed，模板零手动 boolean toggle；样式零 transition / 零 keyframes */
.review-cluster {
  margin-top: var(--space-1);
}
.review-cluster-empty {
  margin: 0;
  padding: var(--space-2);
  border: 1px dashed var(--color-line);
  border-radius: var(--radius-sm);
  font-size: var(--font-sm);
  font-family: var(--font-family);
  color: var(--color-ink-faint);
}
.review-cluster-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 100%;
  padding: var(--space-2);
  border: 1px solid var(--color-primary-deep);
  border-radius: var(--radius-sm);
  background: var(--color-primary-deep);
  color: var(--color-ink);
  font-family: var(--font-family);
  cursor: pointer;
}
.review-cluster-label {
  font-size: var(--font-lg);
  font-weight: 600;
  letter-spacing: 0.5px;
}
.review-cluster-sub {
  font-size: var(--font-sm);
  color: var(--color-ink-soft);
}

/* hover 只给真正有鼠标的设备（链路⑨防返工备忘③：禁裸 :hover 承担交互反馈）；
   题卡仅换 border-color / box-shadow，不引起重排，过渡 ≤0.2s */
@media (hover: hover) and (pointer: fine) {
  .review-item:hover {
    border-color: var(--violet-300);
    box-shadow: var(--shadow-mist);
    transition: border-color 0.18s ease, box-shadow 0.18s ease;
  }
  .review-judge-btn:hover {
    border-color: var(--violet-400);
  }
  .review-cap:hover {
    border-color: var(--violet-400);
  }
  .review-tab:hover {
    border-color: var(--violet-400);
  }
  .review-fix-btn:hover {
    border-color: var(--violet-400);
  }
  .review-fix-mode:hover {
    border-color: var(--violet-400);
  }
  /* 长按题号是隐藏手势，无任何说明气泡；仅给极轻 hover 提示（标题 attribute 之外零 UI 负担） */
  .review-no:hover {
    opacity: 0.72;
  }
  .review-mark-btn:hover {
    border-color: var(--violet-400);
  }
  .review-cluster-btn:hover {
    border-color: var(--violet-400);
  }
}
</style>