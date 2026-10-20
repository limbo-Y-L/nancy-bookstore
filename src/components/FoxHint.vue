<script setup lang="ts">
// 小狐气泡（spec §4 <FoxHint>）
// 仅条件渲染槽位：父级未提供内容时自身不主动显隐（DEC-21 / spec §4：仅讲题/翻转收束出现，不全局飘）。
</script>

<template>
  <div v-if="$slots.default" class="fox-hint">
    <span class="fox-face" aria-hidden="true">🦊</span>
    <div class="fox-bubble"><slot /></div>
  </div>
</template>

<style scoped>
.fox-hint {
  display: flex;
  align-items: flex-start;
  gap: var(--space-1);
}
.fox-face {
  font-size: var(--font-lg);
  line-height: 1.2;
}
.fox-bubble {
  background: var(--color-card-bg);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-md);
  padding: var(--space-2);
  color: var(--color-ink);
  font-size: var(--font-sm);
}
</style>
