// 桩数据 · 待OCR-L1 切片接入真源后替换
// 契约锚：03_context.md §3 ⑫ Q2 整包收齐 / DEC-15 归因四类 / DEC-16 三态批改结果 / DEC-17 订正后单题重判
// 纯 TypeScript 字面量，零依赖、零网络、零副作用。供 REV-01 批改结果页与 REV-02 订正重判消费。

/** 三态：正确 / 错题 / 空题 */
export type ReviewState = 'correct' | 'wrong' | 'empty'

/** 单题批改结果（题卡渲染单位） */
export interface MockReviewItem {
  id: string
  /** 题号，如 '1' / '2' … */
  no: string
  state: ReviewState
  /** 知识点（AI打标·只读） */
  knowledge: string
  /** 题型（AI打标·只读） */
  questionType: string
  /** 简要答案/说明（可有可无；只给结果，不给讲解步骤） */
  answer?: string
}

/** 归一化订正文本：去首尾空白 + 去掉所有空白（含全角空格）+ 全角数字/字母折半角。
 *  纯函数、确定性、零副作用。 */
function normalizeFixText(raw: string): string {
  return raw
    .replace(/\s+/gu, '')
    .replace(/[\uFF10-\uFF19]/gu, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/[\uFF21-\uFF3A\uFF41-\uFF5A]/gu, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) - 0xfee0).toLowerCase()
    )
}

/**
 * 从 `item.answer` 抽取「正确结果关键字」。
 * 规则（确定性）：
 *  1. 取最后一个 `=` 之后的尾段；无 `=` 则整串作为尾段；
 *  2. 去掉全部空白与中英文标点；
 *  3. 尾段里若含数字串，取**最后一个**数字串为关键字（'47 × 6 = 282'→'282'，'一共 12 本'→'12'）；
 *  4. 不含数字则取去标点后的整段（如 '等于二分之一'→'等于二分之一'）；
 *  5. `item.answer` 缺省或抽不出关键字 → 返回 ''，表示「本题无桩参照答案」。
 */
function keywordOf(item: MockReviewItem): string {
  const source = (item.answer ?? '').trim()
  if (source === '') return ''
  const eq = source.lastIndexOf('=')
  const tail = (eq >= 0 ? source.slice(eq + 1) : source).replace(/[\s。，、；：,.()（）]/gu, '')
  if (tail === '') return ''
  const digits = tail.match(/\d+(?:\.\d+)?/gu)
  if (digits !== null && digits.length > 0) return digits[digits.length - 1]
  return tail
}

/**
 * 订正后单题重判（桩判定 · REV-02）。
 * 真判留待 OCR 切片接入真源；本函数只保证「同一输入恒等同一结果」，绝不随机。
 * 规则（按序，命中即返回）：
 *  1. 订正文本归一化后为空（未填/只填了空白）→ **原样返回 `item.state`**，不改状态；
 *  2. 本题抽不出关键字（无桩参照答案）→ `'wrong'`：已作答但无从核对，桩判定从严记「没对上」；
 *  3. 归一化文本**包含**正确结果关键字 → `'correct'`；
 *  4. 其余（非空但不含关键字）→ `'wrong'`。
 * 空题（`item.state === 'empty'`）只要填了非空文本就走第 2–4 条，与错题同一路径。
 */
export function judgeStub(item: MockReviewItem, answer: string): ReviewState {
  const given = normalizeFixText(answer)
  if (given === '') return item.state
  const keyword = keywordOf(item)
  if (keyword === '') return 'wrong'
  return given.includes(keyword) ? 'correct' : 'wrong'
}

/**
 * 桩题整包（三态全覆盖：correct×2 / wrong×2 / empty×2）。
 * 供 REV-01 整包一次赋值后整批直铺（Q2），不做 stagger；REV-02 订正重判在内存里原地改 state。
 */
export const mockReviewItems: MockReviewItem[] = [
  {
    id: 'mock-1',
    no: '1',
    state: 'wrong',
    knowledge: '两位数乘一位数',
    questionType: '排队问题',
    answer: '47 × 6 = 282'
  },
  {
    id: 'mock-2',
    no: '2',
    state: 'empty',
    knowledge: '分数初步认识',
    questionType: '图形计数'
  },
  {
    id: 'mock-3',
    no: '3',
    state: 'correct',
    knowledge: '表内乘法口诀',
    questionType: '口算',
    answer: '8 × 7 = 56'
  },
  {
    id: 'mock-4',
    no: '4',
    state: 'wrong',
    knowledge: '归一问题',
    questionType: '应用题',
    answer: '一共 12 本'
  },
  {
    id: 'mock-5',
    no: '5',
    state: 'empty',
    knowledge: '差倍问题',
    questionType: '应用题'
  },
  {
    id: 'mock-6',
    no: '6',
    state: 'correct',
    knowledge: '两位数减法',
    questionType: '竖式计算',
    answer: '90 − 27 = 63'
  }
]