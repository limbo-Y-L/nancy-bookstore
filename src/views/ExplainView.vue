<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import FoxHint from '../components/FoxHint.vue'
import { callLLM } from '@/lib/llm'

interface MockWrong {
  id: string
  wrongType: string
  tags: string[]
  source: string
  ts: number
}

// mock 态：本地镜像（不接 col()，真读留②-4末换线）
const mockWrongs: MockWrong[] = [
  { id: 'm1', wrongType: '计算', tags: ['分数'], source: '作业本', ts: Date.now() - 86400000 },
  { id: 'm2', wrongType: '语文', tags: ['错别字'], source: '听写', ts: Date.now() - 3600000 }
]

const route = useRoute()
const id = route.query.id as string
const raw = mockWrongs.find(w => w.id === id) ?? mockWrongs[0]

// wireState 仍 mock：callLLM 返回占位串，不真发请求
const explanation = ref('')
onMounted(async () => {
  explanation.value = await callLLM(`讲一讲这道${raw.wrongType}题`)
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
      <span class="type">{{ raw.wrongType }}</span>
      <span class="src">{{ raw.source }}</span>
    </div>

    <!-- 主体：讲解段落（whitespace-pre-line 保留换行） -->
    <article class="explain-body">{{ explanation }}</article>

    <!-- 底部羽毛标记：本包不绑 click（可点留②-4末） -->
    <div class="foot-mark" aria-hidden="true">🪶</div>
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
