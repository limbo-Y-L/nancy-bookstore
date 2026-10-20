<script setup lang="ts">
// 应用根 · 全局壳包裹路由视图（hash 路由壳）
import Shell from './components/Shell.vue'
</script>

<template>
  <Shell>
    <router-view />
  </Shell>
</template>
