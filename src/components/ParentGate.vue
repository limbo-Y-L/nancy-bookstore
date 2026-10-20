<script setup lang="ts">
// 家长态入口（spec §4 <ParentGate> · DEC-13 右上羽毛长按唤家长态）
// 长按 ≥800ms 触发占位，无按钮 DOM，仅事件壳；不承载业务、不写逻辑，仅 emit。
import { ref } from 'vue'

const emit = defineEmits<{ trigger: [] }>()

const HOLD_MS = 800
let timer: ReturnType<typeof setTimeout> | undefined
const holding = ref(false)

function start() {
  holding.value = true
  timer = setTimeout(() => emit('trigger'), HOLD_MS)
}
function cancel() {
  holding.value = false
  if (timer) {
    clearTimeout(timer)
    timer = undefined
  }
}
</script>

<template>
  <span
    class="parent-gate"
    :class="{ 'is-holding': holding }"
    @pointerdown.prevent="start"
    @pointerup="cancel"
    @pointerleave="cancel"
    @pointercancel="cancel"
  ><slot /></span>
</template>

<style scoped>
.parent-gate {
  display: inline-flex;
  cursor: pointer;
  touch-action: none;
  user-select: none;
}
.parent-gate.is-holding {
  opacity: 0.6;
}
</style>
