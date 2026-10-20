// 文案常量与取词器 · 链路⑩
// 规约锚：notes/02_voice.md §6（欢迎语切换）+ §3（铭牌尺度）
// 资产源：assets/voice-phrases.md（铭牌池 v0.1 · M01~M11）
// 纯 TypeScript，零第三方依赖，零网络请求；只用本地时钟 new Date()。

/** 欢迎语时段键 */
export type WelcomeSlot = '晨' | '午' | '暮' | '夜'

/**
 * 时段 → 锁定句（规约 §6 锁定值，非 mock 文案）。
 * 轮替策略：固定句，不随机；小狐彩蛋句走独立触发通道，不混入此位。
 */
export const WELCOME_BY_HOUR: Readonly<Record<WelcomeSlot, string>> = Object.freeze({
  晨: '灯收了，光自己进来。',
  午: '光落在摊开的那页。',
  暮: '影子长过书脊的时候。',
  夜: '灯还亮着，页还没翻完。'
})

/** 时段起始分钟数（含左不含右）；00:00–05:59 归夜，由 else 兜底 */
const SLOT_START_MINUTES: ReadonlyArray<readonly [number, WelcomeSlot]> = [
  [6 * 60, '晨'], // 06:00 ≤ t
  [11 * 60 + 30, '午'], // 11:30 ≤ t
  [16 * 60 + 30, '暮'], // 16:30 ≤ t
  [19 * 60 + 30, '夜'] // 19:30 ≤ t
]

/** 灵感铭牌池 v0.1 · 顺序严格照 assets/voice-phrases.md M01 → M11，文案一字不改 */
export const PLATE_PHRASES = [
  '这一行，本来就不急着懂。', // M01
  '墨痕淡的地方，刚好停一下。', // M02
  '翻过去也行，不翻也行。', // M03
  '纸纹里藏了一句没写出的。', // M04
  '檐影移了一点，没数。', // M05
  '有些页，读慢了才显出来。', // M06
  '灯芯矮下去的时候字会软。', // M07
  '不必从第一句开始的。', // M08
  '窗缝漏进来的那点，够了。', // M09
  '批注写到一半，搁笔了。', // M10
  '晚风翻到这儿，就这儿吧。' // M11
] as const

/**
 * 取当前时段欢迎语。纯本地时钟切段，无地理 API、无网络。
 * 边界含左不含右：11:30 归午、16:30 归暮、19:30 归夜；00:00–05:59 归夜。
 */
export function welcomePhrase(): string {
  const now = new Date()
  const minutes = now.getHours() * 60 + now.getMinutes()
  let slot: WelcomeSlot = '夜'
  for (const [start, key] of SLOT_START_MINUTES) {
    if (minutes >= start) slot = key
    else break
  }
  return WELCOME_BY_HOUR[slot]
}

/**
 * 随机轻抽 1 句铭牌。exclude 去重；池耗尽回退 PLATE_PHRASES[0]，不抛异常。
 */
export function pickPlatePhrase(exclude?: string[]): string {
  const blocked = new Set(exclude ?? [])
  const pool = PLATE_PHRASES.filter((p) => !blocked.has(p))
  if (pool.length === 0) return PLATE_PHRASES[0]
  const index = Math.floor(Math.random() * pool.length)
  return pool[index] ?? pool[0]
}