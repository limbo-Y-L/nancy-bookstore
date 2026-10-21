<script setup lang="ts">
import FoxHint from '../components/FoxHint.vue'
</script>

<template>
  <div class="progress">
    <header class="progress-head">
      <span class="back" aria-hidden="true">🪶</span>
      <h1 class="progress-title">学情</h1>
    </header>
    <FoxHint>
      <span>走过的题，都在这里。</span>
    </FoxHint>
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
</style>
