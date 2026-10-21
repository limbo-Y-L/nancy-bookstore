<script setup lang="ts">
// 弧线星轨进度（spec §4 <StarTrack>）
// 三态 CSS-only：done 实心紫 / current 呼吸光晕 / todo 浅灰描边
// 纯静态 props 入参，无逻辑。
type NodeState = 'done' | 'current' | 'todo'

withDefaults(
  defineProps<{
    nodes?: NodeState[]
  }>(),
  {
    nodes: () => ['done', 'current', 'todo', 'todo', 'todo', 'todo']
  }
)
</script>

<template>
  <div class="star-track" aria-hidden="true">
    <div class="track-inner">
      <span class="rail"></span>
      <span
        v-for="(state, i) in nodes"
        :key="i"
        class="node"
        :class="state"
      ></span>
    </div>
  </div>
</template>

<style scoped>
.star-track {
  position: relative;
  height: 40px;
  margin: var(--space-1) 0;
}
/* 轨道区=100% 宽（取消内缩）并占满容器高，使 top:50% 垂直居中；
   作为节点/rail 的绝对定位上下文 */
.track-inner {
  position: relative;
  height: 100%;
}
.rail {
  position: absolute;
  left: 10px;
  right: 10px;
  top: 50%;
  height: 2px;
  transform: translateY(-50%);
  background: linear-gradient(to right, var(--color-primary-deep), var(--color-line));
  border-radius: var(--radius-pill);
  z-index: 0;
}
.node {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  width: 16px;
  height: 16px;
  border-radius: 50%;
}
/* 六节点圆心精确落在轨道线起止点：translate(-50%) 使圆心=left 值，
   故首末 left:10px / calc(100% - 10px) 与 rail 端点(各 inset 10px)重合；中间等距 */
.node:nth-child(2) { left: 10px;                             top: calc(50% + 4px); }
.node:nth-child(3) { left: calc(10px + (100% - 20px) * 0.2); top: calc(50% + 2px); }
.node:nth-child(4) { left: calc(10px + (100% - 20px) * 0.4); top: calc(50% - 2px); }
.node:nth-child(5) { left: calc(10px + (100% - 20px) * 0.6); top: calc(50% - 2px); }
.node:nth-child(6) { left: calc(10px + (100% - 20px) * 0.8); top: calc(50% + 2px); }
.node:nth-child(7) { left: calc(10px + (100% - 20px));       top: calc(50% + 4px); }

/* done 实心紫 / current 呼吸 / todo 浅灰描边 */
.node.done {
  background: var(--color-primary-deep);
}
.node.current {
  background: var(--color-primary-deep);
  animation: breathe 2.4s ease-in-out infinite;
}
.node.todo {
  background: transparent;
  border: 2px solid var(--color-line);
}
@keyframes breathe {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(201, 184, 232, 0.5);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(201, 184, 232, 0);
  }
}
</style>
