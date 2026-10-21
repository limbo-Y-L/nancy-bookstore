<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import FoxHint from '../components/FoxHint.vue'
import { col } from '@/lib/db'
import { wireState } from '@/lib/llm'

interface MockWrong {
  id: string
  wrongType: string
  tags: string[]
  source: string
  ts: number
}

// mock 态：本地数组，不接 col().add（真写入留②-4末统一换线）
const mockWrongs = ref<MockWrong[]>([
  { id: 'm1', wrongType: '计算', tags: ['分数'], source: '作业本', ts: Date.now() - 86400000 },
  { id: 'm2', wrongType: '语文', tags: ['错别字'], source: '听写', ts: Date.now() - 3600000 }
])

const formType = ref('计算')
const formText = ref('')

// 单开关：全三页共用；mock 分支完全保留，real 走 col('WRONGS').add（schema 见 spec/02_schema.md）
const useMock = wireState === 'mock'

const submitWrong = async () => {
  const text = formText.value.trim()
  if (!text) return
  if (useMock) {
    mockWrongs.value.push({
      id: 'm' + Date.now(),
      wrongType: formType.value,
      tags: [],
      source: '手动记录',
      ts: Date.now()
    })
  } else {
    await col('WRONGS').add({
      familyId: 'f_pending',
      source: text,
      answer: '',
      wrongType: formType.value,
      tags: [],
      reviewed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }
  formText.value = ''
}

const router = useRouter()
// 列表项 click → /explain? id=...（mock 态，不接 col()）
const goExplain = (id: string) => router.push({ path: '/explain', query: { id } })
</script>

<template>
  <div class="wrongs">
    <header class="wrongs-head">
      <span class="back" aria-hidden="true">🪶</span>
      <h1 class="wrongs-title">错题本</h1>
    </header>

    <!-- 错题卡片列表 -->
    <div class="list">
      <article v-for="w in mockWrongs" :key="w.id" class="wrong-card" @click="goExplain(w.id)">
        <div class="row-top">
          <span class="type">{{ w.wrongType }}</span>
          <span class="src">{{ w.source }}</span>
        </div>
        <div class="tags">
          <span v-for="t in w.tags" :key="t" class="tag">{{ t }}</span>
          <span v-if="w.tags.length === 0" class="tag tag-empty">未分类</span>
        </div>
        <div class="ts">{{ new Date(w.ts).toLocaleDateString() }}</div>
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
