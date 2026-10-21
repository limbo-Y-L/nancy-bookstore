<script setup lang="ts">
// 应用根 · 全局壳包裹路由视图（hash 路由壳）
import { defineAsyncComponent, ref } from 'vue'
import Shell from './components/Shell.vue'

// 设置抽屉按需加载：其样式进独立 CSS chunk，主 CSS 体积与哈希不受影响（ADR-09 判据）
const SettingsDrawer = defineAsyncComponent(() => import('./views/SettingsDrawer.vue'))
const settingsOpen = ref(false)
</script>

<template>
  <Shell>
    <router-view />
    <!-- 设置入口 · 底栏区上方浮动按钮（底栏三键终封不动）· inline style 零新增 CSS 进主 CSS -->
    <button
      class="settings-trigger"
      type="button"
      aria-label="设置"
      tabindex="0"
      :style="{
        position: 'fixed',
        right: '16px',
        bottom: 'calc(var(--shell-bottom-h) + 12px)',
        zIndex: '1100',
        width: '44px',
        height: '44px',
        borderRadius: '999px',
        border: '1px solid var(--color-line)',
        background: 'var(--color-card-bg)',
        color: 'var(--color-ink)',
        fontSize: '20px',
        lineHeight: '1',
        cursor: 'pointer',
        boxShadow: 'var(--shadow-mist)'
      }"
      @click="settingsOpen = true"
      @keydown.enter="settingsOpen = true"
    >
      ⚙️
    </button>
    <SettingsDrawer :open="settingsOpen" @close="settingsOpen = false" />
  </Shell>
</template>
