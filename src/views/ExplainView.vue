<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FoxHint from '../components/FoxHint.vue'
import { callLLM, wireState } from '@/lib/llm'
import { col } from '@/lib/db'

interface MockWrong {
  id: string
  subject: string
  tags: string[]
  source: string
  ts: number
}

// mock 态：本地镜像（不接 col()，真读留②-4末换线）
const mockWrongs: MockWrong[] = [
  { id: 'm1', subject: '计算', tags: ['分数'], source: '作业本', ts: Date.now() - 86400000 },
  { id: 'm2', subject: '语文', tags: ['错别字'], source: '听写', ts: Date.now() - 3600000 }
]

const route = useRoute()
const router = useRouter()
const id = route.query.id as string
// 单开关：全三页共用；mock 走本地镜像，real 走 col('WRONGS').doc(id).get()
const useMock = wireState === 'mock'

const raw = ref<MockWrong>(mockWrongs[0])
const explanation = ref('')

onMounted(async () => {
  if (!useMock) {
    try {
      const res = await col('WRONGS').select().eq('id', id).limit(1).get()
      const d = (res.data[0] ?? {}) as { subject: string; source: string; createdAt: string }
      raw.value = { id, subject: d.subject, tags: [], source: d.source, ts: new Date(d.createdAt).getTime() }
    } catch (e: any) {
      // 读取失败：保持 raw 为 mock 默认值，页面可用
      console.warn('[Explain] 云端读取失败，使用本地兜底', e)
    }
  } else {
    raw.value = mockWrongs.find(w => w.id === id) ?? mockWrongs[0]
  }
  // wireState 仍 mock：callLLM 返回占位串，不真发请求
  explanation.value = await callLLM(`讲一讲这道${raw.value.subject}题`)
})
</script>

<template>
  <div class="explain">
    <header class="explain-head">
      <span class="back" aria-hidden="true">🪶</span>
      <h1 class="explain-title">讲题</h1>
    </header>

    <!-- 小狐气泡（≤18字·无叹号，notes/02_voice 合规） -->
    <FoxHint>
      <span>慢慢讲，不赶。</span>
    </FoxHint>

    <!-- 原题小字：题型 + 来源 -->
    <div class="meta">
      <span class="type">{{ raw.subject }}</span>
      <span class="src">{{ raw.source }}</span>
    </div>

    <!-- 主体：讲解段落（whitespace-pre-line 保留换行） -->
    <article class="explain-body">{{ explanation }}</article>

    <!-- 底部羽毛标记：🪶 统一返回（tabindex+click+enter，图标不改） -->
    <div class="foot-mark" tabindex="0" role="button" aria-label="返回" @click="router.back()" @keydown.enter="router.back()">🪶</div>
  </div>
</template>

<style scoped>
.explain {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding-top: var(--space-2);
  padding-bottom: calc(var(--shell-bottom-h) + var(--space-3));
}
.explain-head {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.back {
  font-size: var(--font-base);
  opacity: 0.6;
}
.explain-title {
  margin: 0;
  font-size: var(--font-lg);
  font-weight: 600;
  color: #F5F0FA;
  font-family: var(--font-family);
}
.meta {
  display: flex;
  gap: var(--space-2);
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
.explain-body {
  background: var(--color-card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-mist);
  padding: var(--space-3);
  color: var(--color-ink);
  font-size: var(--font-base);
  white-space: pre-line;
}
.foot-mark {
  align-self: flex-start;
  font-size: var(--font-base);
  opacity: 0.5;
}
</style>
