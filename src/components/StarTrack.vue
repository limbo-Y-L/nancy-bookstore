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
    <span class="rail"></span>
    <span
      v-for="(state, i) in nodes"
      :key="i"
      class="node"
      :class="state"
    ></span>
  </div>
</template>

<style scoped>
.star-track {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 40px;
  margin: var(--space-1) 0;
}
.rail {
  position: absolute;
  left: 9%;
  right: 9%;
  top: 50%;
  height: 2px;
  transform: translateY(-50%);
  background: linear-gradient(to right, var(--color-primary-deep), var(--color-line));
  border-radius: var(--radius-pill);
  z-index: 0;
}
.node {
  position: relative;
  z-index: 1;
  width: 18px;
  height: 18px;
  border-radius: 50%;
}
/* 弧线起伏（占位，非精绘）；rail 为第1子，节点自第2子起 */
.node:nth-child(2) { transform: translateY(7px); }
.node:nth-child(3) { transform: translateY(2px); }
.node:nth-child(4) { transform: translateY(-2px); }
.node:nth-child(5) { transform: translateY(-2px); }
.node:nth-child(6) { transform: translateY(2px); }
.node:nth-child(7) { transform: translateY(7px); }

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
