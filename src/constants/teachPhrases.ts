// 讲题流页桩文案 · TCH-01
// 调性锚：notes/02_voice.md（温·留·不·真；主句 ≤18 字；禁感叹号；禁「小朋友」「宝贝」）
// 纯 TypeScript 常量，零依赖、零网络；只被 TeachView 消费，不参与任何模型调用。

/** 引导段苏格拉底式追问 · 4 句 · 按题序取模轮换（无随机，DEC-19 只追问不直给） */
export const SOCRATIC_QUESTIONS: readonly string[] = [
  '这一步你当时怎么想的。',
  '条件里哪句先读到的。',
  '先别算，看看题目在问什么。',
  '这一步卡在哪儿了。'
]

/** 引导走通后的翻转触发句 · 温度软话，无评分结论、无判定词 */
export const FLIP_TRIGGER: string = '翻过来，这题自己亮了。'

/** 主讲段静听提示 · 不打断、不纠错、不逐句评价 */
export const LISTEN_HINT: string = '慢慢讲，我不插嘴。'

/** 三段推进按钮文案（孩子端零决策：只做/继续/收，无二选一 · DEC-11） */
export const GUIDE_NEXT: string = '说完了'
export const FLIP_NEXT: string = '嗯，接着'
export const LISTEN_DONE: string = '收起来'
export const BACK_HOME: string = '← 回去'