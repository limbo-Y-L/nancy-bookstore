<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import FoxHint from '../components/FoxHint.vue'
import { col } from '@/lib/db'
import { wireState } from '@/lib/llm'
import { cbApp } from '@/lib/cloudbase'
import { getFamilyCode } from '@/lib/family'
import { saveLocalWrongs } from '@/lib/export'

interface MockWrong {
  id: string
  subject: string
  tags: string[]
  source: string
  wrongType?: string
  ts: number
}

// 归因四类（DEC-15 归因四类：概念不清 / 粗心失误 / 方法不会 / 审题偏差）
const ATTR_OPTIONS = [
  { key: 'concept', label: '概念不清' },
  { key: 'careless', label: '粗心失误' },
  { key: 'method', label: '方法不会' },
  { key: 'misread', label: '审题偏差' }
] as const

// mock 态：本地数组，不接 col().add（真写入留②-4末统一换线）
const mockWrongs = ref<MockWrong[]>([
  { id: 'm1', subject: '计算', tags: ['分数'], source: '作业本', ts: Date.now() - 86400000 },
  { id: 'm2', subject: '语文', tags: ['错别字'], source: '听写', ts: Date.now() - 3600000 }
])

const formType = ref('计算')
const formText = ref('')

// 单开关：全三页共用；mock 分支完全保留，real 走 col('WRONGS').add（schema 见 spec/02_schema.md）
const useMock = wireState === 'mock'

// 批次③-1：live 态从 CloudBase 拉真实错题；mock 态保留本地数组（不接 col() 读，仅写走 col()）
const liveWrongs = ref<Array<Record<string, any>>>([])
const liveLoading = ref(false)
const liveError = ref('')

// 归因标签反查（key → 中文标签）
const attrLabel = (key: string): string => {
  const o = ATTR_OPTIONS.find(x => x.key === key)
  return o ? o.label : key
}

// 列表统一出口：mock 走本地数组，live 走云端拉取（模板只认 displayList）
const displayList = computed<Array<Record<string, any>>>(() =>
  useMock ? (mockWrongs.value as unknown as Array<Record<string, any>>) : liveWrongs.value
)

const loadLiveWrongs = async () => {
  liveLoading.value = true
  liveError.value = ''
  try {
    const res = await col('WRONGS').select().order('createdAt', 'desc').limit(50).get()
    const list = (res.data || []) as Array<Record<string, any>>
    // 归一化：云端 _id → id（供 goExplain / setAttribution 复用既有逻辑）
    list.forEach(w => { if (w._id && !w.id) w.id = w._id })
    // 原图临时 URL：仅对带 imageFileID 的记录批量换取（不泄露 fileID，仅挂临时 URL）
    const withImg = list.filter(w => w.imageFileId)
    if (withImg.length) {
      const tmp: any = await cbApp.getTempFileURL({ fileList: withImg.map(w => w.imageFileId) })
      const urlMap = new Map<string, string>()
      ;(tmp.fileList || []).forEach((f: any) => { if (f.fileID && f.tempFileURL) urlMap.set(f.fileID, f.tempFileURL) })
      list.forEach(w => { if (w.imageFileId) w.imageUrl = urlMap.get(w.imageFileId) || '' })
    }
    liveWrongs.value = list
  } catch (e: any) {
    // 鉴权未通（如 LOGIN_MANNER_UNREGISTED / 400）：降级为空态，不显示红字
    console.warn('[Wrongs] 云端读取失败，使用本地兜底', e)
    liveWrongs.value = []
  } finally {
    liveLoading.value = false
  }
}

// wireState 为 'live' 时挂载即拉取（ADR-07：无登录态依赖，直接读库）
onMounted(() => {
  if (useMock) return
  loadLiveWrongs()
})

const submitWrong = async () => {
  const text = formText.value.trim()
  if (!text) return
  if (useMock) {
    mockWrongs.value.push({
      id: 'm' + Date.now(),
      subject: formType.value,
      tags: [],
      source: '手动记录',
      ts: Date.now()
    })
  } else {
    await col('WRONGS').insert({
      familyId: getFamilyCode(),
      source: text,
      answer: '',
      subject: formType.value,
      tags: [],
      reviewed: false,
      imageUrl: '',
      imageThumbUrl: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }
  formText.value = ''
}

const router = useRouter()
// 列表项 click → /explain? id=...（mock 态，不接 col()）
const goExplain = (id: string) => router.push({ path: '/explain', query: { id } })

// 归因浮层：当前正在归因的题 id（null = 关闭）
const attrOpenId = ref<string | null>(null)

/** 归因快捷切换：mock 态只切本地数组；live 态走 col().doc().update 并同步本地镜像 */
const setAttribution = async (id: string, key: string) => {
  if (useMock) {
    const item = mockWrongs.value.find(w => w.id === id)
    if (item) item.wrongType = key
  } else {
    await col('WRONGS').eq('id', id).update({ wrongType: key })
    const item = liveWrongs.value.find(w => w.id === id)
    if (item) item.wrongType = key
  }
  attrOpenId.value = null
}

// 本地镜像：mock 态数据同步给设置抽屉导出用（零 col()）
watch(
  mockWrongs,
  v => {
    if (useMock) saveLocalWrongs(v)
  },
  { deep: true, immediate: true }
)
</script>

<template>
  <div class="wrongs">
    <header class="wrongs-head">
      <span class="back" aria-hidden="true">🪶</span>
      <h1 class="wrongs-title">错题本</h1>
      <div
        class="mode-tag"
        :style="{
          color: '#fff',
          background: wireState !== 'mock' ? '#16a34a' : '#9ca3af',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold',
          position: 'absolute',
          top: '8px',
          right: '12px',
          zIndex: 10,
          boxShadow: '0 1px 3px rgba(0,0,0,.2)'
        }"
      >
        {{ wireState !== 'mock' ? 'LIVE' : 'MOCK' }}
      </div>
    </header>

    <!-- 错题卡片列表（mock / live 统一出口 displayList） -->
    <div class="list">
      <p v-if="!useMock && liveLoading" class="list-hint">正在从云端拉取错题…</p>
      <p v-else-if="!useMock && liveError" class="list-hint list-hint-err">云端读取失败：{{ liveError.toString() }}</p>
      <p v-else-if="displayList.length === 0" class="list-hint">还没有错题，记一题吧。</p>
      <article
        v-for="(w, i) in displayList"
        :key="w.id"
        class="wrong-card"
        @click="goExplain(w.id)"
      >
        <div class="row-top">
          <span class="type">题 {{ i + 1 }} · {{ w.subject }}</span>
          <span class="src">{{ w.source || '' }}</span>
        </div>
        <img v-if="w.imageThumbUrl" :src="w.imageThumbUrl" class="wrong-thumb" alt="缩略图" />
        <span v-else class="no-img">无图</span>
        <div class="tags">
          <span v-for="t in (w.tags || [])" :key="t" class="tag">{{ t }}</span>
          <span v-if="w.wrongType" class="tag">{{ attrLabel(w.wrongType) }}</span>
          <span v-if="(w.tags || []).length === 0 && !w.wrongType" class="tag tag-empty">未分类</span>
        </div>
        <div class="row-foot">
          <span class="ts">{{ w.createdAt ? new Date(w.createdAt).toLocaleDateString() : (w.ts ? new Date(w.ts).toLocaleDateString() : '') }}</span>
          <!-- 归因快捷入口 · 四选项浮层 -->
          <button
            class="attr-btn"
            type="button"
            :aria-expanded="attrOpenId === w.id"
            aria-label="归因"
            @click.stop="attrOpenId = attrOpenId === w.id ? null : w.id"
          >
            归因
          </button>
        </div>
        <div v-if="attrOpenId === w.id" class="attr-pop" role="group" aria-label="归因选项">
          <button
            v-for="o in ATTR_OPTIONS"
            :key="o.key"
            type="button"
            class="soft-card-tag attr-opt"
            :class="{ picked: w.wrongType === o.key }"
            @click.stop="setAttribution(w.id, o.key)"
          >
            {{ o.label }}
          </button>
        </div>
      </article>
    </div>

    <!-- 记一题轻表单（mock 态，仅 push 本地数组） -->
    <div class="add-form">
      <select v-model="formType" class="sel" aria-label="题型">
        <option value="计算">计算</option>
        <option value="语文">语文</option>
        <option value="英语">英语</option>
        <option value="其他">其他</option>
      </select>
      <input v-model="formText" class="inp" placeholder="记一句这题卡在哪…" />
      <button class="btn" @click="submitWrong">记一题</button>
    </div>

    <!-- 小狐气泡（notes/02_voice 调性：无感叹号/无宝贝/无小朋友） -->
    <FoxHint>
      <span>错题不急，慢慢来。</span>
    </FoxHint>

    <!-- 底部羽毛标记：🪶 统一返回（tabindex+click+enter，图标不改） -->
    <div class="foot-mark" tabindex="0" role="button" aria-label="返回" @click="router.back()" @keydown.enter="router.back()">🪶</div>
  </div>
</template>

<style scoped>
.wrongs {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding-top: var(--space-2);
  padding-bottom: calc(var(--shell-bottom-h) + var(--space-3));
}
.wrongs-head {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.back {
  font-size: var(--font-base);
  opacity: 0.6;
}
.wrongs-title {
  margin: 0;
  font-size: var(--font-lg);
  font-weight: 600;
  color: #F5F0FA;
  font-family: var(--font-family);
}
.wrong-thumb {
  margin-top: var(--space-2);
  max-width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: var(--radius-md);
  display: block;
}
.no-img {
  margin-top: var(--space-2);
  font-size: var(--font-sm);
  color: var(--color-ink-faint);
}
.list-hint {
  font-size: var(--font-sm);
  color: var(--color-ink-soft);
}
.list-hint-err {
  color: #b3453b;
}
.list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.wrong-card {
  background: var(--color-card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-mist);
  padding: var(--space-3);
}
.row-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.type {
  font-weight: 600;
  color: var(--color-ink);
}
.src {
  font-size: var(--font-sm);
  color: var(--color-ink-soft);
}
.tags {
  margin-top: var(--space-1);
  display: flex;
  gap: var(--space-1);
  flex-wrap: wrap;
}
.tag {
  font-size: var(--font-sm);
  color: var(--color-ink-soft);
  background: rgba(232, 223, 245, 0.55);
  border-radius: var(--radius-pill);
  padding: 2px 10px;
}
.tag-empty {
  opacity: 0.6;
}
.ts {
  margin-top: var(--space-1);
  font-size: var(--font-sm);
  color: var(--color-ink-faint);
}
.row-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  margin-top: var(--space-1);
}
.attr-btn {
  border: 1px solid var(--color-line);
  background: var(--color-primary);
  color: var(--color-ink);
  font-family: var(--font-family);
  font-size: var(--font-sm);
  border-radius: var(--radius-pill);
  padding: 2px 12px;
  cursor: pointer;
}
.attr-pop {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  margin-top: var(--space-2);
}
/* 归因胶囊 · 与 HomeShell / AtelierView / ArenaView 三处显式同源（7 项逐字符一致） */
.attr-pop :deep(.soft-card-tag) {
  background: rgba(232, 223, 245, 0.55);
  color: #3a2e4d;
  font-weight: 600;
  font-family: var(--font-family);
  padding: 4px 12px;
  border-radius: 999px;
  display: inline-block;
}
.attr-opt {
  border: none;
  cursor: pointer;
  font-size: var(--font-sm);
}
.attr-opt.picked {
  background: var(--color-primary-deep);
  color: var(--color-ink);
}
.foot-mark {
  align-self: flex-start;
  font-size: var(--font-base);
  opacity: 0.5;
  cursor: pointer;
}
.add-form {
  display: flex;
  gap: var(--space-2);
  align-items: center;
  background: var(--color-card-bg);
  border-radius: var(--radius-lg);
  padding: var(--space-2);
  box-shadow: var(--shadow-mist);
}
.sel,
.inp {
  font-family: var(--font-family);
  font-size: var(--font-base);
  color: var(--color-ink);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  padding: var(--space-1) var(--space-2);
  background: #fff;
}
.inp {
  flex: 1 1 auto;
}
.btn {
  font-family: var(--font-family);
  font-size: var(--font-base);
  color: #F5F0FA;
  background: #5D4B6E;
  border: none;
  border-radius: var(--radius-md);
  padding: var(--space-1) var(--space-3);
  cursor: pointer;
}
:deep(.fox-bubble) {
  transition: box-shadow 0.3s ease;
}
</style>
