// 小狐脉冲钩子 · CAP-01 / Q1「小狐微态占住等待态」
// 复用 Shell.vue 既有 `.fox-corner.is-press { animation: foxPulse .6s ease-in-out 2 }`
// 与既有 @keyframes foxPulse（src/components/Shell.vue:232-242）。
// 零新增 keyframes、零动画库、零 spinner、零 setTimeout 兜动画。

const FOX_SELECTOR = '.fox-corner'
const PRESS_CLASS = 'is-press'

/**
 * 触发一次小狐按压脉冲。
 * @param reason 触发来源标记（如 'ocr-pending'），仅作本地记录，不参与任何样式生成。
 */
export function pulseFox(reason: string): void {
  const fox = document.querySelector<HTMLElement>(FOX_SELECTOR)
  if (!fox) return

  // 来源标记：仅 dataset + debug，便于后续切片判别触发源，不生成任何样式
  fox.dataset.pulseReason = reason
  console.debug('[fox] pulse', reason)

  // 先摘 class 再挂，保证同一动画可被重复触发
  fox.classList.remove(PRESS_CLASS)
  // 强制一次回流，让浏览器把移除后的同一动画名重新视为新动画
  void fox.offsetWidth
  fox.classList.add(PRESS_CLASS)

  // 动画自然结束后再摘 class；只认小狐自身动画冒泡，不做定时兜底
  const onEnd = (event: Event) => {
    fox.removeEventListener('animationend', onEnd)
    if (event.target !== fox) return
    fox.classList.remove(PRESS_CLASS)
  }
  fox.addEventListener('animationend', onEnd)
}