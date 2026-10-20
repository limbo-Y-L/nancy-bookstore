<script setup lang="ts">
// 首页静态素壳 · 严格按 notes/01_wireframes 首页素壳登记布局
// 顺序：顶氛围区 → 作业桌双钮 → 开眼界轻卡 → 弧线星轨小灶进度占位 → 星练轻卡入口
// 组合式引用 StarTrack / SoftCard / FoxHint（FoxHint 仅槽位占位，home 不显）。
// 自身只留布局顺序编排，不内联样式块（样式由 tokens.css 全局类 + 子组件承载）。
import SoftCard from '../components/SoftCard.vue'
import StarTrack from '../components/StarTrack.vue'
import FoxHint from '../components/FoxHint.vue'
import { useRouter } from 'vue-router'
// ParentGate 依 DEC-13 居 Shell 右上羽毛长按，不在此页内联。
// 欢迎语（按本地时钟固定切段）与铭牌句（随机轻抽）统一从文案常量层取，模板不写死句子。
import { welcomePhrase, pickPlatePhrase } from '../constants/voice'

// CAP-01 双入口行为接线：作业桌两钮跳采集页（壳层零改动，仅接线）
const router = useRouter()

// 首页「今日小知识」温柔科普短句静态库（纯字面量，无 computed/watch/random；与星练场「风的形状」轻呼应）
const todayKnowledge = '小知识：风没有形状，但树叶知道它来过。' as const

// 顶部欢迎语：按时段固定，不随机（notes/02_voice.md §6）
const welcome = welcomePhrase()

// 铭牌句：SoftCard 内随机轻抽 1 句；同屏三卡逐张排重不撞（assets/voice-phrases.md 抽取策略）
const used: string[] = []
const plateEye = pickPlatePhrase(used)
used.push(plateEye)
const plateKitchen = pickPlatePhrase(used)
used.push(plateKitchen)
const plateArena = pickPlatePhrase(used)
used.push(plateArena)
</script>

<template>
  <div class="home">
    <!-- 1. 顶氛围区（欢迎词 + 日期天气轻显） -->
    <section class="ambient">
      <span class="ambient-hi welcome-line">{{ welcome }}</span>
      <p class="ambient-hi">你好呀，Nancy ～</p>
      <p class="ambient-sub">今天也是书香满满的一天</p>
    </section>

    <!-- 2. 作业桌双钮 -->
    <section class="desk">
      <button class="desk-btn" type="button" @click="router.push('/capture?mode=hw')">📚 作业批改</button>
      <button class="desk-btn" type="button" @click="router.push('/capture?mode=mt')">✏️ 口算批改</button>
    </section>

    <!-- 3. 开眼界轻卡 -->
    <SoftCard tag="每日开眼界">
      <p class="card-title">今日小知识</p>
      <p class="card-sub">{{ todayKnowledge }}</p>
      <p class="card-sub">{{ plateEye }}</p>
    </SoftCard>

    <!-- 4. 弧线星轨小灶进度占位（六节点串行） -->
    <SoftCard tag="温故小灶">
      <StarTrack />
      <p class="card-sub">六节点星轨 · 进度占位</p>
      <p class="card-sub">{{ plateKitchen }}</p>
    </SoftCard>

    <!-- 5. 星练轻卡入口 -->
    <SoftCard tag="星练场">
      <p class="card-title">去星练场练一练</p>
      <p class="card-sub">点亮你的小小星芒</p>
      <p class="card-sub">{{ plateArena }}</p>
    </SoftCard>

    <!-- 小狐气泡：仅槽位占位，home 不显（DEC-21 / spec §4） -->
    <FoxHint />
  </div>
</template>

<style scoped>
/* N2 视觉精绘 · 仅刷视觉层，结构顺序一字不改 */

/* 顶氛围区：淡紫雾渐变底（纵向极浅两阶，无背景图） */
.ambient {
  background: linear-gradient(180deg, var(--violet-100), var(--violet-200));
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-2);
}

/* StarTrack 星轨 current 态：由纯呼吸光晕升级为 opacity 1.2s ease-in-out 缓动
   （仅 transition，无 @keyframes 重负载；覆盖子组件内 breathing） */
.star-track :deep(.node.current) {
  animation: none;
  box-shadow: 0 0 10px 2px rgba(184, 161, 217, 0.3);
  transition: opacity 1.2s ease-in-out, box-shadow 1.2s ease-in-out;
}

/* SoftCard 统一挂雾感弥散阴影，去除纯平感 */
:deep(.soft-card) {
  box-shadow: var(--shadow-mist);
}

/* 首页板块名称胶囊 · 链路⑨微调⑫补 全页面显式同源（与 Atelier/Arena :deep(.soft-card-tag) 像素级一致）
   消除"靠 SoftCard 默认值巧合一致"；字色深墨 #3A2E4D、统一族 var(--font-family) */
.home :deep(.soft-card-tag) {
  background: rgba(232, 223, 245, 0.55);
  color: #3A2E4D;
  font-weight: 600;
  font-family: var(--font-family);
  padding: 4px 12px;
  border-radius: 999px;
  display: inline-block;
}
</style>
