<script setup lang="ts">
// 圆角淡底无阴影统一容器（spec §4 <SoftCard>）
// 仅承载布局容器与可选标签，无业务逻辑。
defineProps<{ tag?: string }>()
</script>

<template>
  <section class="soft-card">
    <span v-if="tag" class="soft-card-tag">{{ tag }}</span>
    <slot />
  </section>
</template>

<style scoped>
.soft-card {
  background: var(--color-card-bg);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-lg);
  padding: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.soft-card-tag {
  align-self: flex-start;
  font-size: var(--font-sm);
  color: var(--color-primary-deep);
  background: var(--color-primary);
  border-radius: var(--radius-pill);
  padding: 2px 12px;
}
</style>
