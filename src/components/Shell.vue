<script setup lang="ts">
// 全局壳（spec §4 <Shell>）
// 左上铭牌固定 + 右上羽毛长按家长态(ParentGate) + 底栏三键常驻(hash 路由)
import { ref } from 'vue'
import ParentGate from './ParentGate.vue'
import ParentPanel from './ParentPanel.vue'

// 家长态开关（DEC-13 羽毛长按唤家长态 · PAR-01）：纯内存态，退出即清，不落任何持久化
const parentMode = ref(false)

// 小狐跨设备呼吸/按压反馈（pointer 事件，零全局 hack）
const foxPress = () => document.querySelector('.fox-corner')?.classList.add('is-press')
const foxRelease = () => document.querySelector('.fox-corner')?.classList.remove('is-press')
</script>

<template>
  <div class="shell">
    <!-- 星空实元素（真机兼容：独立合成层，防 WebKit/华为层叠吞绘） -->
    <div class="starfield" aria-hidden="true"></div>

    <!-- 顶栏：左铭牌 / 右羽毛(ParentGate 长按唤家长态) -->
    <header class="shell-top">
      <div class="plate">Nancy的奇妙书屋</div>
      <div class="top-right">
        <ParentGate @trigger="parentMode = true">
          <span class="feather" aria-label="家长态入口">🪶</span>
        </ParentGate>
        <div
          class="fox-corner"
          role="button"
          tabindex="0"
          aria-label="小狐狸"
          @pointerdown="foxPress"
          @pointerup="foxRelease"
          @pointerleave="foxRelease"
          @pointercancel="foxRelease"
        >🦊</div>
      </div>
    </header>

    <!-- 家长态薄条 · PAR-01：壳层顶栏正下方 inline 条（可叠加，不阻断孩子态交互） -->
    <ParentPanel v-if="parentMode" @exit="parentMode = false" />

    <!-- 内容插槽（路由视图挂载处） -->
    <main class="shell-main">
      <slot />
    </main>

    <!-- 底栏三键常驻 · hash 路由接管 -->
    <nav class="shell-bottom">
      <router-link to="/" class="nav-key">首页</router-link>
      <router-link to="/atelier" class="nav-key">妙语工坊</router-link>
      <router-link to="/arena" class="nav-key">星练场</router-link>
    </nav>
  </div>
</template>

<style scoped>
.shell {
  position: relative;
  z-index: 1;
  isolation: isolate;
  max-width: var(--shell-max-w);
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-bottom: var(--shell-bottom-h);
  background: transparent;
}

/* 夜读纸窗 · 全局星空层（铺满 viewport，z-index 垫底，纯 CSS 无图片、静态不闪、亮度极低） */
.shell::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -1;
  background: linear-gradient(160deg, #2E1F47 0%, #3A2E4D 38%, #D9CCEE 100%);
  pointer-events: none;
}
.starfield {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-color: transparent;
  background-image:
    radial-gradient(1px 1px at 107px 218px, rgba(255,255,255,0.52), transparent),
    radial-gradient(1px 1px at 169px 67px, rgba(255,255,255,0.51), transparent),
    radial-gradient(1px 1px at 176px 217px, rgba(255,255,255,0.53), transparent),
    radial-gradient(1px 1px at 214px 163px, rgba(255,255,255,0.54), transparent),
    radial-gradient(1px 1px at 141px 198px, rgba(255,255,255,0.51), transparent),
    radial-gradient(1px 1px at 7px 172px, rgba(255,255,255,0.52), transparent),
    radial-gradient(1px 1px at 89px 36px, rgba(255,255,255,0.52), transparent),
    radial-gradient(1px 1px at 151px 218px, rgba(255,255,255,0.51), transparent),
    radial-gradient(1px 1px at 33px 61px, rgba(255,255,255,0.51), transparent),
    radial-gradient(1px 1px at 218px 79px, rgba(255,255,255,0.55), transparent),
    radial-gradient(1px 1px at 50px 194px, rgba(255,255,255,0.55), transparent),
    radial-gradient(1px 1px at 31px 198px, rgba(255,255,255,0.53), transparent),
    radial-gradient(1px 1px at 218px 215px, rgba(255,255,255,0.53), transparent),
    radial-gradient(1px 1px at 155px 27px, rgba(255,255,255,0.50), transparent),
    radial-gradient(1px 1px at 133px 167px, rgba(255,255,255,0.53), transparent),
    radial-gradient(1px 1px at 200px 10px, rgba(255,255,255,0.51), transparent),
    radial-gradient(1px 1px at 146px 61px, rgba(255,255,255,0.53), transparent),
    radial-gradient(1px 1px at 179px 202px, rgba(255,255,255,0.52), transparent),
    radial-gradient(1px 1px at 28px 81px, rgba(255,255,255,0.54), transparent),
    radial-gradient(1px 1px at 142px 135px, rgba(255,255,255,0.51), transparent),
    radial-gradient(1px 1px at 31px 133px, rgba(255,255,255,0.54), transparent),
    radial-gradient(1px 1px at 89px 78px, rgba(255,255,255,0.52), transparent),
    radial-gradient(1px 1px at 178px 93px, rgba(255,255,255,0.51), transparent),
    radial-gradient(1px 1px at 42px 210px, rgba(255,255,255,0.53), transparent),
    radial-gradient(1px 1px at 52px 51px, rgba(255,255,255,0.52), transparent),
    radial-gradient(1px 1px at 167px 155px, rgba(255,255,255,0.54), transparent),
    radial-gradient(1px 1px at 146px 93px, rgba(255,255,255,0.51), transparent),
    radial-gradient(1px 1px at 146px 105px, rgba(255,255,255,0.54), transparent),
    radial-gradient(1px 1px at 151px 98px, rgba(255,255,255,0.50), transparent),
    radial-gradient(1px 1px at 40px 12px, rgba(255,255,255,0.52), transparent),
    radial-gradient(1px 1px at 144px 5px, rgba(255,255,255,0.50), transparent),
    radial-gradient(1px 1px at 37px 69px, rgba(255,255,255,0.51), transparent),
    radial-gradient(1px 1px at 212px 111px, rgba(255,255,255,0.50), transparent),
    radial-gradient(1px 1px at 103px 190px, rgba(255,255,255,0.52), transparent),
    radial-gradient(1px 1px at 36px 105px, rgba(255,255,255,0.52), transparent),
    radial-gradient(1px 1px at 54px 111px, rgba(255,255,255,0.52), transparent),
    radial-gradient(1px 1px at 193px 107px, rgba(255,255,255,0.55), transparent),
    radial-gradient(1px 1px at 171px 8px, rgba(255,255,255,0.53), transparent),
    radial-gradient(1px 1px at 196px 140px, rgba(255,255,255,0.54), transparent),
    radial-gradient(1px 1px at 145px 97px, rgba(255,255,255,0.55), transparent),
    radial-gradient(1px 1px at 99px 53px, rgba(255,255,255,0.51), transparent),
    radial-gradient(1px 1px at 149px 35px, rgba(255,255,255,0.53), transparent),
    radial-gradient(1px 1px at 23px 75px, rgba(255,255,255,0.53), transparent),
    radial-gradient(1px 1px at 63px 69px, rgba(255,255,255,0.55), transparent),
    radial-gradient(1px 1px at 90px 129px, rgba(255,255,255,0.54), transparent),
    radial-gradient(1px 1px at 15px 39px, rgba(255,255,255,0.53), transparent),
    radial-gradient(1px 1px at 19px 95px, rgba(255,255,255,0.53), transparent),
    radial-gradient(1px 1px at 204px 219px, rgba(255,255,255,0.52), transparent),
    radial-gradient(1px 1px at 103px 42px, rgba(255,255,255,0.55), transparent),
    radial-gradient(1px 1px at 115px 39px, rgba(255,255,255,0.52), transparent),
    radial-gradient(2px 2px at 33px 70px, rgba(255,255,255,0.8), transparent),
    radial-gradient(2px 2px at 8px 57px, rgba(255,255,255,0.8), transparent),
    radial-gradient(2px 2px at 22px 43px, rgba(255,255,255,0.8), transparent),
    radial-gradient(2px 2px at 27px 216px, rgba(255,255,255,0.8), transparent),
    radial-gradient(2px 2px at 90px 37px, rgba(255,255,255,0.8), transparent),
    radial-gradient(2px 2px at 8px 51px, rgba(255,255,255,0.8), transparent),
    radial-gradient(2px 2px at 48px 169px, rgba(255,255,255,0.8), transparent),
    radial-gradient(2px 2px at 211px 204px, rgba(255,255,255,0.8), transparent),
    radial-gradient(2px 2px at 155px 144px, rgba(255,255,255,0.8), transparent),
    radial-gradient(2px 2px at 154px 117px, rgba(255,255,255,0.8), transparent),
    radial-gradient(2px 2px at 92px 86px, rgba(255,255,255,0.8), transparent),
    radial-gradient(2px 2px at 165px 219px, rgba(255,255,255,0.8), transparent),
    radial-gradient(2px 2px at 77px 20px, rgba(255,255,255,0.8), transparent),
    radial-gradient(2px 2px at 117px 179px, rgba(255,255,255,0.8), transparent),
    radial-gradient(2px 2px at 39px 110px, rgba(255,255,255,0.8), transparent),
    radial-gradient(2px 2px at 110px 116px, rgba(255,255,255,0.8), transparent),
    radial-gradient(2px 2px at 45px 69px, rgba(255,255,255,0.8), transparent),
    radial-gradient(2px 2px at 148px 52px, rgba(255,255,255,0.8), transparent),
    radial-gradient(2px 2px at 107px 134px, rgba(255,255,255,0.8), transparent),
    radial-gradient(2px 2px at 177px 211px, rgba(255,255,255,0.8), transparent),
    radial-gradient(2px 2px at 135px 84px, rgba(255,255,255,0.8), transparent),
    radial-gradient(2px 2px at 16px 83px, rgba(255,255,255,0.8), transparent),
    radial-gradient(2px 2px at 55px 70px, rgba(255,255,255,0.8), transparent),
    radial-gradient(2px 2px at 78px 130px, rgba(255,255,255,0.8), transparent),
    radial-gradient(2px 2px at 212px 69px, rgba(255,255,255,0.8), transparent),
    radial-gradient(2px 2px at 93px 48px, rgba(255,255,255,0.8), transparent),
    radial-gradient(2px 2px at 33px 109px, rgba(255,255,255,0.8), transparent),
    radial-gradient(2px 2px at 113px 118px, rgba(255,255,255,0.8), transparent),
    radial-gradient(2px 2px at 52px 99px, rgba(255,255,255,0.8), transparent),
    radial-gradient(2px 2px at 179px 126px, rgba(255,255,255,0.8), transparent);
  background-repeat: repeat;
  background-size: 220px 220px;
}

/* 顶栏 */
.shell-top {
  position: relative;
  z-index: 1;
  flex: 0 0 auto;
  height: var(--shell-top-h);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-3);
}

/* 左上铭牌 · 链路⑨ 紫粉金渐变灯牌感 · 不交互 */
.plate {
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Hiragino Sans GB', sans-serif;
  font-size: var(--font-lg);
  font-weight: 600;
  letter-spacing: 0.5px;
  /* 紫粉金渐变：暖白 → 淡紫粉 → 暖金，灯牌感 */
  background: linear-gradient(120deg, #F5F0FA 0%, #DAB8FF 50%, #FFD6A5 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  user-select: none;
  pointer-events: none;
}

.top-right {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}
.feather {
  font-size: var(--font-lg);
  opacity: 0.7;
}
.fox-corner {
  position: relative;
  font-size: var(--font-base);
  opacity: 0.55;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  outline: 1px solid rgba(255, 255, 255, 0.55);
  outline-offset: 1px;
  box-shadow: inset 0 0 5px rgba(255, 255, 255, 0.5);
  animation: foxBreathe 3.6s ease-in-out infinite; /* 常驻呼吸，三端一致 */
}
/* 耳尖 / 尾尖微小高光点（伪元素，纯装饰，不增 DOM） */
.fox-corner::before,
.fox-corner::after {
  content: '';
  position: absolute;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.85);
  pointer-events: none;
}
.fox-corner::before {
  top: 1px;
  left: 2px;
}
.fox-corner::after {
  right: 1px;
  bottom: 2px;
}

/* 小狐按压脉冲：pointer 触发，覆盖常驻呼吸 */
.fox-corner.is-press {
  animation: foxPulse 0.6s ease-in-out 2;
}
@keyframes foxBreathe {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 2px 6px rgba(58, 46, 77, 0.25)); }
  50%      { transform: scale(1.04); filter: drop-shadow(0 4px 10px rgba(58, 46, 77, 0.35)); }
}
@keyframes foxPulse {
  0%, 100% { transform: scale(1.04); }
  50%      { transform: scale(1.10); }
}
/* hover 只给真正有鼠标的设备，避免 iPad 粘 hover */
@media (hover: hover) and (pointer: fine) {
  .fox-corner:hover {
    transform: scale(1.05);
  }
}

/* 内容区 */
.shell-main {
  position: relative;
  z-index: 1;
  flex: 1 1 auto;
  overflow-y: auto;
  padding: var(--space-3) var(--space-3) 72px; /* 底栏高度留白，防最后一条内容被盖 */
}

/* 底栏三键 · 链路⑨ 雾紫冷调「窗台」浮出 */
.shell-bottom {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  max-width: var(--shell-max-w);
  margin: 0 auto;
  height: var(--shell-bottom-h);
  z-index: 1000;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: var(--space-1);
  padding: 0 var(--space-3) calc(10px + env(safe-area-inset-bottom));
  background: rgba(232, 223, 245, 0.72); /* 暖雾紫玻璃感 · 去除黑条感 */
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.35); /* 上边缘细线浮出感 */
}

.nav-key {
  flex: 1;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  border: none;
  border-radius: var(--radius-pill);
  background: transparent;
  color: #9A8AA8; /* 未选态：灰紫退后（暖雾紫玻璃上的可读退后色） */
  font-family: var(--font-family);
  font-weight: 700; /* 底栏导航字重提至700（零动字号/色/背景） */
  font-size: var(--font-sm);
  cursor: pointer;
}
/* 当前路由高亮（仅样式，无守卫逻辑） */
.nav-key.router-link-active {
  background: rgba(255, 255, 255, 0.18); /* 微凸，不实心 */
  color: #5D4B6E; /* 选中态：暖雾紫深字 */
}

/* Shell.vue 小狐呼吸强效补丁 */
:deep(.fox-corner) {
  opacity: 0.35 !important; /* 日常半隐在雾里，强制防覆盖 */
  transition: opacity 0.6s ease-in-out !important; /* 缓动必须钉在基础态 */
  pointer-events: auto; /* 确保能接收鼠标事件 */
}

:deep(.fox-corner):hover,
:deep(.fox-corner):focus-visible {
  opacity: 0.85 !important; /* 交互时轻透，不拉满，保留雾感 */
}

/* 页面加载时的温柔初现（依然无 keyframes，靠初始渲染） */
</style>
