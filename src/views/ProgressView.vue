<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import FoxHint from '../components/FoxHint.vue'
import { useRouter } from 'vue-router'
import { col } from '@/lib/db'
import { wireState } from '@/lib/llm'

interface MockWrong {
  id: string
  wrongType: string
  tags: string[]
  source: string
  ts: number
}

// mock 态：本地镜像（与 ExplainView 同源副本，不接 col()）
const mockWrongs: MockWrong[] = [
  { id: 'm1', wrongType: '计算', tags: ['分数'], source: '作业本', ts: Date.now() - 86400000 },
  { id: 'm2', wrongType: '语文', tags: ['错别字'], source: '听写', ts: Date.now() - 3600000 }
]

// 单开关：全三页共用；mock 走本地镜像，real 走 col('WRONGS').get() 聚合
const useMock = wireState === 'mock'
const cloudWrongs = ref<MockWrong[]>([])
const router = useRouter()

onMounted(async () => {
  if (!useMock) {
    const res = await col('WRONGS').get()
    cloudWrongs.value = (res.data as Array<{ _id: string; wrongType: string; source: string; createdAt: string }>).map(d => ({
      id: d._id,
      wrongType: d.wrongType,
      tags: [],
      source: d.source,
      ts: new Date(d.createdAt).getTime()
    }))
  }
})

// 数据源按开关切换：mock→本地镜像，real→CloudBase 拉取
const source = computed<MockWrong[]>(() => (useMock ? mockWrongs : cloudWrongs.value))

const stats = computed(() =>
  source.value.reduce(
    (acc, w) => {
      acc[w.wrongType] = (acc[w.wrongType] ?? 0) + 1
      return acc
    },
    { 计算: 0, 语文: 0, 英语: 0, 其他: 0 } as Record<string, number>
  )
)

const total = computed(() => source.value.length)

// 纯本地日期标签，不引 dayjs / 不引新包
const dayLabel = (ts: number) => new Date(ts).toLocaleDateString('zh-CN')

const since = computed(() => {
  const first = source.value[0]
  return first?.ts ? dayLabel(first.ts) : '尚无记录'
})
</script>

<template>
  <div class="progress">
    <header class="progress-head">
      <span class="back" aria-hidden="true">🪶</span>
      <h1 class="progress-title">学情</h1>
    </header>

    <!-- 小狐气泡（14字·无叹号，notes/02_voice 合规） -->
    <FoxHint>
      <span>这周算错最多，咱们慢慢来。</span>
    </FoxHint>

    <!-- 三枚数字卡（卡底 --color-card-bg · 文字 --color-ink · 字号 --font-sm） -->
    <div class="cards">
      <div class="card">
        <span class="num">{{ stats.计算 }}</span>
        <span class="lab">计算</span>
      </div>
      <div class="card">
        <span class="num">{{ stats.语文 }}</span>
        <span class="lab">语文</span>
      </div>
      <div class="card">
        <span class="num">{{ stats.英语 }}</span>
        <span class="lab">英语</span>
      </div>
    </div>

    <!-- 次行小字（--color-ink-faint） -->
    <p class="sub">共 {{ total }} 道 · 最早记录 {{ since }}</p>

    <!-- 底部羽毛标记：🪶 统一返回（tabindex+click+enter，图标不改） -->
    <div class="foot-mark" tabindex="0" role="button" aria-label="返回" @click="router.back()" @keydown.enter="router.back()">🪶</div>
  </div>
</template>

<style scoped>
.progress {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding-top: var(--space-2);
  padding-bottom: calc(var(--shell-bottom-h) + var(--space-3));
}
.progress-head {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.back {
  font-size: var(--font-base);
  opacity: 0.6;
}
.progress-title {
  margin: 0;
  font-size: var(--font-lg);
  font-weight: 600;
  color: #F5F0FA;
  font-family: var(--font-family);
}
.cards {
  display: flex;
  gap: var(--space-2);
}
.card {
  flex: 1 1 0;
  background: var(--color-card-bg);
  color: var(--color-ink);
  font-size: var(--font-sm);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-mist);
  padding: var(--space-3);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
}
.num {
  font-weight: 600;
}
.sub {
  margin: 0;
  font-size: var(--font-sm);
  color: var(--color-ink-faint);
}
.foot-mark {
  align-self: flex-start;
  font-size: var(--font-base);
  opacity: 0.5;
}
</style>
