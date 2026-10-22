<script setup lang="ts">
// 设置抽屉 · ②-5（浮层，不设独立路由）
// 五区：家庭码 / API Key / 归因 / 导出 / 关闭
// 守门：wireState='mock' 期间 —— 家庭码只写 localStorage、API Key 只存 localStorage、
//      归因只切本地、导出只导本地数组；全链路零 col() 真读写。
// 视觉：复用既有 CSS 变量，零新增变量；底部滑出；归因胶囊用 .soft-card-tag（同源 7 项显式声明）。
import { onMounted, ref, watch } from 'vue'
import { getFamilyCode, regenerateFamilyCode, setFamilyCode } from '@/lib/family'
import { exportWrongs } from '@/lib/export'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const API_KEY_STORAGE = 'nancy-bookhouse.apiKey'
const ATTR_STORAGE = 'nancy-bookhouse.defaultAttribution'

/** 归因四类（DEC-15 归因四类：概念不清 / 粗心失误 / 方法不会 / 审题偏差） */
const ATTR_OPTIONS = [
  { key: 'concept', label: '概念不清' },
  { key: 'careless', label: '粗心失误' },
  { key: 'method', label: '方法不会' },
  { key: 'misread', label: '审题偏差' }
] as const

const familyCode = ref('')
const codeInput = ref('')
const apiKey = ref('')
const keyMsg = ref('')
const defaultAttr = ref('')
const exportMsg = ref('')
const familyMsg = ref('')

/** 从 localStorage 同步三项本地设置（不进 col） */
const syncFromStorage = () => {
  familyCode.value = getFamilyCode()
  codeInput.value = ''
  familyMsg.value = ''
  try {
    apiKey.value = localStorage.getItem(API_KEY_STORAGE) || ''
    defaultAttr.value = localStorage.getItem(ATTR_STORAGE) || ''
  } catch {
    apiKey.value = ''
    defaultAttr.value = ''
  }
}

onMounted(syncFromStorage)
watch(
  () => props.open,
  v => {
    if (v) syncFromStorage()
  }
)

const applyCode = () => {
  const next = setFamilyCode(codeInput.value)
  familyCode.value = next
  codeInput.value = ''
  familyMsg.value = `已切换到家庭 ${next}`
}

const regenCode = () => {
  familyCode.value = regenerateFamilyCode()
}

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(familyCode.value)
    exportMsg.value = '家庭码已复制。'
  } catch {
    exportMsg.value = '这台设备不让复制，手动记一下也一样。'
  }
}

const saveKey = () => {
  try {
    localStorage.setItem(API_KEY_STORAGE, apiKey.value.trim())
    keyMsg.value = apiKey.value.trim() ? '已存在这台设备里。' : '已清空。'
  } catch {
    keyMsg.value = '存不进去，可能是浏览器不让写。'
  }
}

const pickAttr = (key: string) => {
  defaultAttr.value = key
  try {
    localStorage.setItem(ATTR_STORAGE, key)
  } catch {
    // 忽略：写不进去时本次会话内仍生效
  }
}

const doExport = async () => {
  try {
    const res = await exportWrongs()
    exportMsg.value = `已导出 ${res.count} 道 · ${res.filename}`
  } catch {
    exportMsg.value = '导出没成功，再试一次。'
  }
}
</script>

<template>
  <!-- 遮罩 -->
  <div class="mask" :class="{ open: props.open }" @click="emit('close')"></div>

  <!-- 抽屉：底部滑出（transition 驱动，零 @keyframes） -->
  <aside
    class="drawer"
    :class="{ open: props.open }"
    role="dialog"
    aria-modal="true"
    aria-label="设置"
    @keydown.esc="emit('close')"
  >
    <header class="drawer-head">
      <h2 class="drawer-title">设置</h2>
      <button class="drawer-x" type="button" aria-label="关闭" @click="emit('close')">✕</button>
    </header>

    <!-- 区一 · 家庭码 -->
    <section class="blk">
      <h3 class="blk-title">家庭码</h3>
      <p class="blk-sub">这台设备的数据分区码，换设备时填同一个码，就能找到孩子的记录。</p>
      <div class="row">
        <code class="code">{{ familyCode }}</code>
        <button class="btn" type="button" @click="copyCode">复制</button>
        <button class="btn" type="button" @click="regenCode">换一个</button>
      </div>
      <div class="row">
        <input
          v-model="codeInput"
          class="inp"
          maxlength="8"
          placeholder="手填一个 8 位码"
          aria-label="手填家庭码"
        />
        <button class="btn" type="button" @click="applyCode">用这个</button>
      </div>
      <p v-if="familyMsg" class="hint">{{ familyMsg }}</p>
    </section>

    <!-- 区二 · API Key -->
    <section class="blk">
      <h3 class="blk-title">API Key</h3>
      <p class="blk-sub">只存在这台设备的浏览器里，不上传、不进代码、不写进错题本。</p>
      <form class="row" @submit.prevent>
        <input
          v-model="apiKey"
          class="inp"
          type="password"
          placeholder="填入模型 Key（可留空）"
          aria-label="模型 API Key"
        />
        <button class="btn" type="button" @click="saveKey">保存</button>
      </form>
      <p v-if="keyMsg" class="hint">{{ keyMsg }}</p>
    </section>

    <!-- 区三 · 归因 -->
    <section class="blk">
      <h3 class="blk-title">默认归因</h3>
      <p class="blk-sub">新记的错题先按这一类标好，之后在错题本里随时能改。</p>
      <div class="chips">
        <button
          v-for="o in ATTR_OPTIONS"
          :key="o.key"
          type="button"
          class="soft-card-tag chip"
          :class="{ picked: defaultAttr === o.key }"
          @click="pickAttr(o.key)"
        >
          {{ o.label }}
        </button>
      </div>
    </section>

    <!-- 区四 · 导出 -->
    <section class="blk">
      <h3 class="blk-title">导出</h3>
      <p class="blk-sub">把错题全导成一个 JSON 文件，换设备或备份都用得上。</p>
      <button class="btn" type="button" @click="doExport">导出错题 JSON</button>
      <p v-if="exportMsg" class="hint">{{ exportMsg }}</p>
    </section>

    <!-- 区五 · 关闭 -->
    <section class="blk blk-tail">
      <button class="btn btn-primary" type="button" @click="emit('close')">收好，去学习</button>
    </section>
  </aside>
</template>

<style scoped>
.mask {
  position: fixed;
  inset: 0;
  background: rgba(46, 31, 71, 0.42);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease;
  z-index: 1150;
}
.mask.open {
  opacity: 1;
  pointer-events: auto;
}
.drawer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1200;
  max-width: var(--shell-max-w);
  margin: 0 auto;
  max-height: 78vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  background: var(--color-card-bg);
  /* 圆角 16px · 复用既有变量 --space-3（=16px）· 零新增变量 */
  border-radius: var(--space-3) var(--space-3) 0 0;
  box-shadow: var(--shadow-mist);
  padding: var(--space-3);
  padding-bottom: calc(var(--shell-bottom-h) + var(--space-3));
  transform: translateY(100%);
  visibility: hidden;
  transition: transform 0.25s ease, visibility 0.25s ease;
}
.drawer.open {
  transform: translateY(0);
  visibility: visible;
}
.drawer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.drawer-title {
  margin: 0;
  font-size: var(--font-lg);
  font-weight: 600;
  color: var(--color-ink);
  font-family: var(--font-family);
}
.drawer-x {
  border: none;
  background: transparent;
  color: var(--color-ink-soft);
  font-size: var(--font-base);
  cursor: pointer;
  padding: var(--space-1);
}
.blk {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  border-top: 1px solid var(--color-line);
  padding-top: var(--space-2);
}
.blk-tail {
  align-items: flex-start;
}
.blk-title {
  margin: 0;
  font-size: var(--font-base);
  font-weight: 600;
  color: var(--color-ink);
  font-family: var(--font-family);
}
.blk-sub {
  margin: 0;
  font-size: var(--font-sm);
  color: var(--color-ink-soft);
}
.row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}
.code {
  font-family: var(--font-family);
  font-size: var(--font-lg);
  font-weight: 600;
  letter-spacing: 2px;
  color: var(--color-ink);
  background: var(--color-primary);
  border-radius: var(--radius-pill);
  padding: 2px 12px;
}
.inp {
  flex: 1 1 160px;
  min-width: 0;
  font-family: var(--font-family);
  font-size: var(--font-base);
  color: var(--color-ink);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-sm);
  padding: var(--space-1) var(--space-2);
  background: #fff;
}
.btn {
  font-family: var(--font-family);
  font-size: var(--font-sm);
  color: var(--color-ink);
  background: var(--color-primary);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-sm);
  padding: var(--space-1) var(--space-2);
  cursor: pointer;
}
.btn-primary {
  color: #f5f0fa;
  background: #5d4b6e;
  border-color: #5d4b6e;
  font-size: var(--font-base);
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}
.hint {
  margin: 0;
  font-size: var(--font-sm);
  color: var(--color-ink-faint);
}
/* 归因胶囊 · 与 HomeShell / AtelierView / ArenaView 三处显式同源（7 项逐字符一致） */
.chips :deep(.soft-card-tag) {
  background: rgba(232, 223, 245, 0.55);
  color: #3a2e4d;
  font-weight: 600;
  font-family: var(--font-family);
  padding: 4px 12px;
  border-radius: 999px;
  display: inline-block;
}
.chip {
  border: none;
  cursor: pointer;
  font-size: var(--font-sm);
}
.chip.picked {
  background: var(--color-primary-deep);
  color: var(--color-ink);
}
</style>
