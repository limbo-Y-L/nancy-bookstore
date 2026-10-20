<script setup lang="ts">
// 妙语工坊 · 阶段B第3步静态素壳（spec §4 域：习作辅导 / 素材库 / 朗读过关，一期仅占位）
// 纯静态：无真实数据、无 mock 消费、无请求、无 v-model、无导航逻辑。
// 顶铭牌/底栏由 Shell 外层接管，本视图不重复渲染。
import SoftCard from '../components/SoftCard.vue'
import FoxHint from '../components/FoxHint.vue'

// 工坊灵感语料静态库（纯字面量，无 computed/watch/random；v-for 静态切片呈现）
const museLines = [
  '如果云朵会写日记，它今天会写什么？',
  '星星掉进墨水瓶，会写出什么颜色的话？',
  '小狐狸说：先写一句就好，不用写完。',
  '风翻过这一页的时候，偷偷帮你改了一个标点。',
  '把今天最亮的一件事，说给纸听。',
] as const

const foxHints = [
  '写歪了也没关系，小狐不扣分 🦊',
  '一句就够，剩下的留给明天的自己',
  '纸很软，接得住所有没说出口的话',
] as const
</script>

<template>
  <div class="atelier">
    <!-- 顶部轻标题行：妙语工坊 + 返回首页文字链（左向羽毛，仅视觉无逻辑） -->
    <header class="atelier-head">
      <span class="back" aria-hidden="true">🪶</span>
      <h1 class="atelier-title">妙语工坊</h1>
      <span class="back-link">返回首页</span>
    </header>

    <!-- ① 灵感提示卡（SoftCard 承载，一句占位妙语 prompt） -->
    <SoftCard tag="灵感提示" class="inspire">
      <p v-for="line in museLines.slice(0, 2)" :key="line" class="prompt">{{ line }}</p>
    </SoftCard>

    <!-- ② 输入区占位：圆角文本域壳，非真实 textarea，仅视觉轮廓 + 灰字 placeholder -->
    <div class="input-shell">
      <span class="input-ph">写一写你的妙语……</span>
    </div>

    <!-- ③ 输出气泡区：三错落 FoxHint（两填一空，仅视觉占位） -->
    <div class="bubbles">
      <FoxHint class="b1">
        <span>{{ foxHints[0] }}</span>
      </FoxHint>
      <FoxHint class="b2">
        <span>{{ foxHints[1] }}</span>
      </FoxHint>
      <FoxHint class="b3">
        <span>{{ foxHints[2] }}</span>
      </FoxHint>
    </div>
  </div>
</template>

<style scoped>
/* N2 视觉精绘 · 仅视觉层，template 与 script 原样不动，不重定义 token */

/* 视图根容器：比首页更浅一档的淡紫雾底，区分“工坊”次级层级 */
.atelier {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding-top: var(--space-2);
  /* 消解固定底栏微遮：内容底部留足滚动余量 */
  padding-bottom: calc(var(--shell-bottom-h) + var(--space-3));
  background: transparent;
}

/* 顶部轻标题行 */
.atelier-head {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.back {
  font-size: var(--font-base);
  opacity: 0.6;
}
.atelier-title {
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

/* 灵感提示卡（SoftCard）+ 输入区壳：淡紫底 + 雾感阴影 */
:deep(.soft-card) {
  background: var(--color-card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-mist);
  transition: box-shadow 0.3s ease; /* 仅缓动，无 @keyframes */
}
.inspire {
  margin-top: var(--space-1);
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
.prompt {
  margin: 0;
  font-family: var(--font-family);
  font-size: var(--font-base);
  color: var(--color-ink);
}

/* 输入区占位壳：极淡描边 + 圆角 + 雾感阴影，无硬线 */
.input-shell {
  min-height: 96px;
  background: var(--color-card-bg);
  border: 1px solid var(--violet-300);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-mist);
  padding: var(--space-3);
  display: flex;
  align-items: flex-start;
  transition: box-shadow 0.3s ease;
}
.input-ph {
  font-size: var(--font-base);
  color: var(--color-ink-faint);
}

/* 输出气泡错落排布（仅视觉节奏，无位移动画） */
.bubbles {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.b1 {
  align-self: flex-start;
  max-width: 85%;
}
.b2 {
  align-self: flex-end;
  max-width: 85%;
  margin-top: var(--space-1); /* 错落微调 */
}
.b3 {
  align-self: center;
  max-width: 70%;
}
/* 小狐气泡：淡底圆角 + 左角标留白，仅缓动无关键帧 */
:deep(.fox-bubble) {
  background: var(--violet-100);
  border-radius: var(--radius-md);
  transition: box-shadow 0.3s ease;
}
</style>
