<script setup lang="ts">
import FoxHint from '../components/FoxHint.vue'
</script>

<template>
  <div class="explain">
    <header class="explain-head">
      <span class="back" aria-hidden="true">🪶</span>
      <h1 class="explain-title">讲题</h1>
    </header>
    <FoxHint>
      <span>这一题，先说说你是怎么想的。</span>
    </FoxHint>
  </div>
</template>

<style scoped>
.explain {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding-top: var(--space-2);
  padding-bottom: calc(var(--shell-bottom-h) + var(--space-3));
}
.explain-head {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.back {
  font-size: var(--font-base);
  opacity: 0.6;
}
.explain-title {
  margin: 0;
  font-size: var(--font-lg);
  font-weight: 600;
  color: #F5F0FA;
  font-family: var(--font-family);
}
</style>
