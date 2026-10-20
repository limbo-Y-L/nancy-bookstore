<script setup lang="ts">
// 星练场 · 阶段B第4步（收官步）静态素壳（spec §4 域：星练场双轨，一期仅占位）
// 纯静态：无真实数据、无 mock 消费、无请求、无计数逻辑、无路由跳转。
// 顶铭牌/底栏由 Shell 外层接管，本视图不重复渲染。
// 与 AtelierView 对称层级，样式语义一致。
import SoftCard from '../components/SoftCard.vue'
import FoxHint from '../components/FoxHint.vue'

// 星练场样例题壳静态库（纯字面量，无 computed/watch/random；无判题无对错无状态机）
const starQuests = [
  { id: 1, tag: '温柔观察', title: '窗外的风今天是什么形状？', hint: '不用写长，三个字也可以。' },
  { id: 2, tag: '想象漫游', title: '如果月亮是个小动物，它会在晚上做什么？', hint: '小狐猜它在打哈欠 🦊' },
] as const

const arenaFoxHints = [
  '星练场不考试，只陪你发呆',
  '写不出就换一题，没有标准答案',
  '每颗星星都接住你的一句',
] as const

// 12 颗小星芒静态排布（前 3 颗已点亮），硬编码占位，无计数逻辑
const stars = [true, true, true, false, false, false, false, false, false, false, false, false]
</script>

<template>
  <div class="arena">
    <!-- 顶部轻标题行：星练场 + 返回首页文字链（左向羽毛，仅视觉无逻辑） -->
    <header class="arena-head">
      <span class="back" aria-hidden="true">🪶</span>
      <h1 class="arena-title">星练场</h1>
      <span class="back-link">返回首页</span>
    </header>

    <!-- ① 星芒进度轻卡（SoftCard 承载） -->
    <SoftCard tag="星芒进度" class="progress">
      <p class="progress-text">已点亮 3 / 12 颗小星芒</p>
      <div class="stars" aria-hidden="true">
        <span
          v-for="(lit, i) in stars"
          :key="i"
          class="star"
          :class="{ lit }"
        ></span>
      </div>
    </SoftCard>

    <!-- ② 练题入口双钮区：两个圆角 SoftCard 并列，仅视觉轮廓，无点击/无跳转 -->
    <div class="entry-row">
      <SoftCard v-for="q in starQuests" :key="q.id" :tag="q.tag" class="entry">
        <p class="entry-title">{{ q.title }}</p>
        <p class="entry-sub">{{ q.hint }}</p>
      </SoftCard>
    </div>

    <!-- ③ 底部小狐轻声提示气泡（单 FoxHint 空槽引用，一句占位短句） -->
    <div class="whisper">
      <FoxHint><span>{{ arenaFoxHints[0] }}</span></FoxHint>
      <FoxHint><span>{{ arenaFoxHints[1] }}</span></FoxHint>
      <FoxHint><span>{{ arenaFoxHints[2] }}</span></FoxHint>
    </div>
  </div>
</template>

<style scoped>
/* N2 视觉精绘 · 仅视觉层，template 与 script 原样不动，不重定义 token */

/* 视图根容器：与工坊同档轻雾底，与首页形成“首页最深→工坊/星练场更轻”的层级呼吸 */
.arena {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding-top: var(--space-2);
  /* 消解固定底栏微遮：内容底部留足滚动余量 */
  padding-bottom: calc(var(--shell-bottom-h) + var(--space-3));
  background: transparent;
}

/* 顶部轻标题行 */
.arena-head {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.back {
  font-size: var(--font-base);
  opacity: 0.6;
}
.arena-title {
  margin: 0;
  font-size: var(--font-lg);
  font-weight: 600;
  color: #F5F0FA; /* 链路⑨ 夜空标题提亮 */
  font-family: var(--font-family);
  letter-spacing: 0.5px;
}
.back-link {
  margin-left: auto;
  font-size: var(--font-sm);
  color: #F5F0FA; /* 链路⑨ 与标题同色保一致 */
  text-decoration: none;
}

/* 练习主题卡 / 占位壳（SoftCard 与入口卡）：淡紫底 + 雾感阴影 + 极淡描边 */
:deep(.soft-card) {
  background: var(--color-card-bg);
  border: 1px solid var(--violet-300); /* 极淡描边，无硬线 */
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-mist);
  transition: box-shadow 0.3s ease; /* 仅缓动，无 @keyframes */
}

/* 板块名胶囊 · 链路⑨微调⑫ 全页面统一（同 HomeShell :deep(.soft-card-tag)）
   字体由 var(--font-display) 改统一族 var(--font-family)；字色改深墨 #3A2E4D */
:deep(.soft-card-tag) {
  background: rgba(232, 223, 245, 0.55);
  color: #3A2E4D;
  font-weight: 600;
  font-family: var(--font-family);
  padding: 4px 12px;
  border-radius: 999px;
  display: inline-block;
}
.progress-text {
  margin: 0;
  font-family: var(--font-family);
  font-size: var(--font-base);
  color: var(--color-ink);
}

/* 星芒进度圆点：淡紫圆点，仅 transition 缓动，无呼吸闪动（星轨 breathing 在首页组件内，本步不碰） */
.stars {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  margin-top: var(--space-2);
}
.star {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: transparent;
  border: 2px solid var(--violet-300); /* 未点亮：极淡描边 */
  transition: background 0.3s ease, border-color 0.3s ease, opacity 0.3s ease;
}
.star.lit {
  background: var(--violet-400); /* 已点亮：淡紫实心 */
  border-color: var(--violet-400);
}

/* 练题入口双钮区 */
.entry-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2);
}
.entry {
  min-height: 88px;
  justify-content: center;
}
.entry-title {
  margin: 0;
  font-family: var(--font-family); /* 题目：易读基准字 */
  font-size: var(--font-lg);
  color: var(--color-ink);
}
.entry-sub {
  margin: 4px 0 0;
  font-family: var(--font-family);
  font-size: var(--font-sm);
  color: var(--color-ink-soft);
}

/* 底部小狐轻声提示：淡底圆角，仅缓动无关键帧 */
.whisper {
  margin-top: var(--space-1);
  display: flex;
  flex-direction: column;
  gap: 1.25rem; /* 纵向间距基线（后续 AI 聊天框间距沿用此值） */
}
/* 异侧翻转气泡额外 +4px：后续 AI 聊天框 flip 侧再补间距避免贴边（当前静态未启用 flip） */
.whisper :deep(.fox-bubble.flip) {
  margin-top: 4px;
}
:deep(.fox-bubble) {
  background: var(--violet-100);
  border-radius: var(--radius-md);
  transition: box-shadow 0.3s ease;
}
</style>
