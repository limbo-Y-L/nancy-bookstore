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

// 批次③-1：live 态优先本地镜像（带 family_id）即时显示 + 强刷不丢；云端拉取成功后合并
// 本地镜像 key（与云端同一 family_id 隔离维度）
const LIVE_LOCAL_KEY = 'nancy-bookhouse.wrongs.live'

// 读原始全量数组（跨 family 全部条目，写入前需保留其他 family 数据）
const readRawLocal = (): Array<Record<string, any>> => {
  try {
    const raw = localStorage.getItem(LIVE_LOCAL_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    // JSON 解析异常 / 隐私模式：静默返回空
    return []
  }
}
// 按 id 去重（保留先出现的「最新」项，避免重复 id 阻断渲染）
const dedupeById = (arr: Array<Record<string, any>>): Array<Record<string, any>> => {
  const seen = new Set<string>()
  const out: Array<Record<string, any>> = []
  for (const w of arr) {
    if (!w || !w.id) continue
    if (seen.has(w.id)) continue
    seen.add(w.id)
    out.push(w)
  }
  return out
}
// 按当前 familyId 过滤（读取/展示用），并按 id 去重
const loadLocalWrongs = (familyId: string): Array<Record<string, any>> =>
  dedupeById(readRawLocal().filter((w: any) => w.familyId === familyId))

// 写回全量数组（确保传入为有效数组，跨 family 数据不丢）
const persistLocalWrongs = (items: Array<Record<string, any>>): void => {
  try {
    localStorage.setItem(LIVE_LOCAL_KEY, JSON.stringify(Array.isArray(items) ? items : []))
  } catch {
    // 隐私模式等场景不可用：静默跳过
  }
}

const liveWrongs = ref<Array<Record<string, any>>>([])
const liveLoading = ref(false)
const liveError = ref('')

// 归因标签反查（key → 中文标签）
const attrLabel = (key: string): string => {
  const o = ATTR_OPTIONS.find(x => x.key === key)
  return o ? o.label : key
}

// 渲染前过滤：剔除异常/非标准对象（无 id 或无 source/question/subject），避免 Error 对象误入数组导致渲染红字
const isValidWrong = (w: any): boolean =>
  !!w && typeof w === 'object' && !!w.id && !!(w.source || w.question || w.subject)

// 列表统一出口：mock 走本地数组，live 走云端拉取；渲染前过滤非标准对象（模板只认 displayList）
const displayList = computed<Array<Record<string, any>>>(() =>
  (useMock ? (mockWrongs.value as unknown as Array<Record<string, any>>) : liveWrongs.value).filter(isValidWrong)
)

// 方向3 · 归因本地镜像（独立键，与 wrongs 兜底六点互不干扰）
// 结构：ATTR_KEY 存分区数组 [{ familyId, list: [{ wrongId, wrongType, updatedAt }] }]
const ATTR_KEY = 'nancy-bookhouse.attributions.live'

// 方向4 · 存储版本号（独立版本键，不触碰 ATTR_KEY / LIVE_LOCAL_KEY 数据；本次基线仅占位，不删旧数据）
const VERSION_KEY = 'nancy-bookhouse.storage.version'
const CURRENT_VERSION = 'v1.0.0' // 归因本地镜像 + wrongs 兜底六点基线

// 读全部分区（跨 family），解析失败静默返回空数组
const readAttrRaw = (): Array<{ familyId: string; list: Array<{ wrongId: string; wrongType: string; updatedAt: number }> }> => {
  try {
    const raw = localStorage.getItem(ATTR_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}
// 取当前 family 分区的 list
const loadAttrList = (familyId: string): Array<{ wrongId: string; wrongType: string; updatedAt: number }> => {
  const part = readAttrRaw().find(p => p.familyId === familyId)
  return part ? part.list : []
}
// 写回：把归因合并进当前 family 分区（按 wrongId 去重，新覆盖旧），写全部（跨 family 不覆盖）
const persistAttr = (familyId: string, wrongId: string, wrongType: string): void => {
  try {
    const partitions = readAttrRaw()
    const idx = partitions.findIndex(p => p.familyId === familyId)
    const entry = { wrongId, wrongType, updatedAt: Date.now() }
    if (idx >= 0) {
      const list = partitions[idx].list.filter(x => x.wrongId !== wrongId)
      list.unshift(entry)
      partitions[idx].list = list
    } else {
      partitions.unshift({ familyId, list: [entry] })
    }
    localStorage.setItem(ATTR_KEY, JSON.stringify(partitions))
  } catch (e: any) {
    console.warn('[Wrongs] 归因本地写入失败：', (e && e.message) || e)
  }
}
// 方向4 · 存储版本校验（独立版本键，不删 ATTR_KEY / LIVE_LOCAL_KEY 数据；本次基线不删旧数据，仅写回版本号）
const checkStorageVersion = (): void => {
  try {
    const prev = (() => {
      try { return localStorage.getItem(VERSION_KEY) } catch { return null }
    })()
    if (prev !== CURRENT_VERSION) {
      console.warn('[Wrongs] 存储版本迁移：', prev || '无', '→', CURRENT_VERSION)
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION)
    }
  } catch (e: any) {
    console.warn('[Wrongs] 版本校验失败：', (e && e.message) || e)
  }
}
// 渲染前补值：云端无归因字段时，用本地镜像 wrongType 补（只改视图层，不触发写云端）
const applyAttrMirror = (familyId: string): void => {
  try {
    const mirror = new Map(loadAttrList(familyId).map(a => [a.wrongId, a.wrongType]))
    if (mirror.size === 0) return
    liveWrongs.value = liveWrongs.value.map((w: any) => {
      if (!w.wrongType && mirror.has(w.id)) {
        return { ...w, wrongType: mirror.get(w.id) }
      }
      return w
    })
  } catch (e: any) {
    console.warn('[Wrongs] 归因镜像补值失败：', (e && e.message) || e)
  }
}

const loadLiveWrongs = async () => {
  const familyId = getFamilyCode()
  liveLoading.value = true
  liveError.value = ''
  // 1) 先以本地镜像即时渲染：强刷不丢；云端不可达时仍有数据
  liveWrongs.value = loadLocalWrongs(familyId)
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
    // 2) 合并：云端记录 + 本地兜底中“云端没有”的项；按 createdAt 去重避免与云端同条重复（本地副本永不清空）
    const cloudCreated = new Set((list as Array<Record<string, any>>).map(w => w.createdAt))
    const localOnly = loadLocalWrongs(familyId).filter(w => !cloudCreated.has(w.createdAt))
    liveWrongs.value = localOnly.length ? [...localOnly, ...list] : list
  } catch (e: any) {
    // 鉴权未通 / 网络异常：维持本地镜像兜底，不显示红字（云端为 best-effort，待方向2接通；降级为 debug 避免红色告警刷屏）
    console.debug('[Wrongs] 云端读取未通（best-effort，已用本地兜底，待方向2接通）：', (e && e.message) || e)
  } finally {
    liveLoading.value = false
  }
  // ③ 本地归因镜像补值（云端无归因时用本地补，只改视图层，不触发写云端）
  applyAttrMirror(familyId)
}

// 应用初始化入口：版本校验（方向4）→ 加载错题兜底 + 补归因镜像（方向3，applyAttrMirror 在 loadLiveWrongs 末尾）
onMounted(() => {
  checkStorageVersion()
  if (useMock) return
  loadLiveWrongs()
})

const submitWrong = async () => {
  const text = formText.value.trim()
  if (!text) return
  const familyId = getFamilyCode()
  if (useMock) {
    mockWrongs.value.push({
      id: 'm' + Date.now(),
      subject: formType.value,
      tags: [],
      source: '手动记录',
      ts: Date.now()
    })
  } else {
    // 本地兜底项（带 family_id，取当前 localStorage 的 nancy-bookhouse.familyCode）
    // id 用 crypto.randomUUID() 防主键碰撞（现代浏览器原生支持，无额外依赖）
    const localItem: Record<string, any> = {
      id: crypto.randomUUID(),
      familyId,
      source: text,
      answer: '',
      subject: formType.value,
      tags: [],
      reviewed: false,
      imageUrl: '',
      imageThumbUrl: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    // ① 本地先落盘（独立 try/catch，云端异常绝不中断本地写入）
    try {
      const all = readRawLocal()
      all.unshift(localItem)
      persistLocalWrongs(all)
    } catch (e: any) {
      console.warn('[Wrongs] 本地写入失败：', (e && e.message) || e)
    }
    // 即时显示（去重 + 过滤非标准对象，避免任何异常对象混入渲染）
    liveWrongs.value = dedupeById([localItem, ...liveWrongs.value.filter(isValidWrong)])
    formText.value = ''
    // ② 云端写入：成败不阻断（失败仅 warn，本地已兜底，不抛红、不删本地副本）
    try {
      await col('WRONGS').insert({
        familyId,
        source: text,
        answer: '',
        subject: formType.value,
        tags: [],
        reviewed: false,
        imageUrl: '',
        imageThumbUrl: '',
        createdAt: localItem.createdAt,
        updatedAt: localItem.updatedAt
      })
    } catch (e: any) {
      console.warn('[Wrongs] 云端写入失败，已降级本地存储：', (e && e.message) || e)
    }
  }
}

const router = useRouter()
// 列表项 click → /explain? id=...（mock 态，不接 col()）
const goExplain = (id: string) => router.push({ path: '/explain', query: { id } })

// 归因浮层：当前正在归因的题 id（null = 关闭）
const attrOpenId = ref<string | null>(null)

/** 归因快捷切换：mock 态只切本地数组；live 态云端最佳努力 + 本地镜像必落盘（RLS 拦截也不丢） */
const setAttribution = async (id: string, key: string) => {
  if (useMock) {
    const item = mockWrongs.value.find(w => w.id === id)
    if (item) item.wrongType = key
  } else {
    const familyId = getFamilyCode()
    // ① 云端 update 最佳努力：RLS 拦截仅 warn，不抛红、不阻断本地
    try {
      await col('WRONGS').eq('id', id).update({ wrongType: key })
    } catch (e: any) {
      // 云端为 best-effort（rdb 链路待方向2对齐 + RLS anon 待放通），失败仅静默降级到本地镜像
      console.debug('[Wrongs] 云端归因写入未通（best-effort，已降级本地镜像，待方向2接通）：', (e && e.message) || e)
    }
    // ② 内存即时显示
    const item = liveWrongs.value.find(w => w.id === id)
    if (item) item.wrongType = key
    // ③ 本地镜像持久化（按 familyId 分区，跨 family 不覆盖）
    persistAttr(familyId, id, key)
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
