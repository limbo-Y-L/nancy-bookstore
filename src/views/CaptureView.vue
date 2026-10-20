<script setup lang="ts">
// 采集页 · CAP-01 行为接入切片（壳 + 行为一次做）
// 契约锚：03_context.md §3 ⑫ Q1 小狐微态 / Q2 整批直铺 / DEC-11·16·17·19
// 本切片只做「选图 → 原图直读 → 落 IndexedDB → 跳 review 占位页」，不做 OCR、不发网络。
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MAX_CAPTURE } from '../constants/ocr'
import { pulseFox } from '../composables/useFoxPulse'
import { useOcr } from '../composables/useOcr'
import { saveCapture } from '../stores/captureStore'
import type { CaptureImageMeta, CaptureMode, CapturePayload } from '../types/review'

const route = useRoute()
const router = useRouter()

/** 模式取自路由 query（/capture?mode=hw|mt），缺省落作业批改 */
const mode = computed<CaptureMode>(() => (route.query.mode === 'mt' ? 'mt' : 'hw'))

/** 顶部轻标题：按模式切换（notes/02_voice.md 温·留·不·真，句末用句号，无感叹号） */
const title = computed(() => (mode.value === 'mt' ? '口算批改' : '作业批改'))
const titleLine = computed(() => (mode.value === 'mt' ? '这一叠口算页，慢慢翻。' : '这一叠作业页，慢慢翻。'))

/** 已选原图（整批一次赋值，Q2 整批直铺，无 stagger） */
const picked = ref<CaptureImageMeta[]>([])

/** OCR-L1 调用层（触发即用，不订阅任何响应式态） */
const { triggerOcr } = useOcr()

/** 本地轻提示（不引第三方 toast，最小 scoped 样式，自动消失） */
const hint = ref('')
let hintTimer: ReturnType<typeof setTimeout> | null = null
function showHint(text: string): void {
  hint.value = text
  if (hintTimer !== null) clearTimeout(hintTimer)
  hintTimer = setTimeout(() => {
    hint.value = ''
    hintTimer = null
  }, 2200)
}
onBeforeUnmount(() => {
  if (hintTimer !== null) clearTimeout(hintTimer)
})

const fileInput = ref<HTMLInputElement | null>(null)
function openPicker(): void {
  fileInput.value?.click()
}

/** 本地 sessionId：优先 crypto.randomUUID，非安全上下文回退 getRandomValues v4 */
function newSessionId(): string {
  const c = globalThis.crypto
  if (typeof c?.randomUUID === 'function') return c.randomUUID()
  const bytes = new Uint8Array(16)
  c.getRandomValues(bytes)
  bytes[6] = (bytes[6]! & 0x0f) | 0x40
  bytes[8] = (bytes[8]! & 0x3f) | 0x80
  const hex: string[] = []
  for (let i = 0; i < 16; i += 1) hex.push(bytes[i]!.toString(16).padStart(2, '0'))
  return (
    hex.slice(0, 4).join('') +
    '-' +
    hex.slice(4, 6).join('') +
    '-' +
    hex.slice(6, 8).join('') +
    '-' +
    hex.slice(8, 10).join('') +
    '-' +
    hex.slice(10, 16).join('')
  )
}

/** 选图：原图直读（arrayBuffer 原始字节，零 canvas / toBlob / resize），超 MAX_CAPTURE 截断并轻提示 */
async function onPick(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  input.value = ''
  if (files.length === 0) return

  const room = MAX_CAPTURE - picked.value.length
  const accepted = files.slice(0, Math.max(room, 0))
  const dropped = files.length - accepted.length

  const batch: CaptureImageMeta[] = []
  for (const file of accepted) {
    batch.push({
      id: newSessionId(),
      name: file.name,
      type: file.type,
      size: file.size,
      buffer: await file.arrayBuffer()
    })
  }

  picked.value = [...picked.value, ...batch]
  if (dropped > 0) showHint(`最多 ${MAX_CAPTURE} 张哦。`)
}

function removeAt(index: number): void {
  picked.value = picked.value.filter((_, i) => i !== index)
}

/** 提交：脉冲 → 落 IndexedDB → 跳 review（不做 OCR、不 loading 遮罩、不发网络） */
async function submit(): Promise<void> {
  if (picked.value.length === 0) return
  const sessionId = newSessionId()
  // 1. 小狐脉冲占住等待态（Q1）
  pulseFox('ocr-pending')
  // 2. 整批原图落 IndexedDB（红线：仅本地）
  const payload: CapturePayload = {
    sessionId,
    mode: mode.value,
    images: picked.value,
    createdAt: new Date().toISOString()
  }
  await saveCapture(payload)
  // 3. 触发 OCR-L1 归一（fire-and-forget：不 await、不阻塞跳转；失败静默回落桩）
  void triggerOcr(payload)
  // 4. 跳批改结果页（当前为占位页）
  await router.push({ name: 'review', query: { session: sessionId } })
}
</script>

<template>
  <div class="capture">
    <header class="capture-head">
      <h1 class="capture-title">{{ title }}</h1>
      <p class="capture-sub">{{ titleLine }}</p>
    </header>

    <section class="pick">
      <button class="pick-btn" type="button" @click="openPicker">选照片</button>
      <span class="pick-count">已选 {{ picked.length }} / {{ MAX_CAPTURE }} 张</span>
      <input
        ref="fileInput"
        class="pick-input"
        type="file"
        accept="image/*"
        multiple
        hidden
        @change="onPick"
      />
    </section>

    <p v-if="hint" class="pick-hint" role="status">{{ hint }}</p>

    <ul class="picked">
      <li v-for="(img, i) in picked" :key="img.id" class="picked-item">
        <span class="picked-name">{{ img.name }}</span>
        <button class="picked-drop" type="button" @click="removeAt(i)">去掉</button>
      </li>
    </ul>

    <button class="submit" type="button" :disabled="picked.length === 0" @click="submit">提交批改</button>
  </div>
</template>

<style scoped>
/* CAP-01 新增视图样式 · 仅本页 scoped，不动任何既有样式文件与既有选择器 */

.capture {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding-top: var(--space-2);
  padding-bottom: calc(var(--shell-bottom-h) + var(--space-3));
}

.capture-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.capture-title {
  margin: 0;
  font-size: var(--font-lg);
  font-weight: 600;
  font-family: var(--font-family);
  letter-spacing: 0.5px;
  color: #F5F0FA;
}
.capture-sub {
  margin: 0;
  font-size: var(--font-sm);
  font-family: var(--font-family);
  color: #F5F0FA;
}

/* 选图区 */
.pick {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.pick-btn {
  height: 44px;
  padding: 0 var(--space-3);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  background: var(--color-card-bg);
  color: var(--color-ink);
  font-family: var(--font-family);
  font-size: var(--font-base);
  cursor: pointer;
}
.pick-count {
  font-size: var(--font-sm);
  font-family: var(--font-family);
  color: #F5F0FA;
}

/* 本地轻提示：仅 opacity 过渡，无 @keyframes，无遮罩 */
.pick-hint {
  margin: 0;
  font-size: var(--font-sm);
  font-family: var(--font-family);
  color: #F5F0FA;
  opacity: 0.92;
  transition: opacity 0.3s ease;
}

/* 已选列表 */
.picked {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin: 0;
  padding: 0;
  list-style: none;
}
.picked-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-2);
  border: 1px solid var(--violet-300);
  border-radius: var(--radius-sm);
  background: var(--color-card-bg);
}
.picked-name {
  flex: 1;
  font-size: var(--font-sm);
  font-family: var(--font-family);
  color: var(--color-ink);
  word-break: break-all;
}
.picked-drop {
  border: none;
  background: transparent;
  color: var(--color-ink-soft);
  font-family: var(--font-family);
  font-size: var(--font-sm);
  cursor: pointer;
}

/* 提交 */
.submit {
  height: 48px;
  border: 1px solid var(--violet-300);
  border-radius: var(--radius-md);
  background: var(--color-card-bg);
  color: var(--color-ink);
  font-family: var(--font-family);
  font-size: var(--font-base);
  cursor: pointer;
  transition: opacity 0.3s ease;
}
.submit:disabled {
  opacity: 0.45;
  cursor: default;
}
</style>