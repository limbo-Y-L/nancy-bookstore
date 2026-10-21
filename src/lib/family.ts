// 家庭码 · ②-5 设置抽屉
// 守门（wireState='mock' 期间）：家庭码只落 localStorage，绝不触 col()、绝不外发、绝不进 URL。
// 作用：替代登录体系 —— 家庭码即数据分区键（familyId），跨设备填同一个码就能找到孩子的记录。

const STORAGE_KEY = 'nancy-bookhouse.familyCode'

/** 字母数字表：剔除 I/O/0/1 等易混字符，避免家长手抄家庭码时抄错 */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

/** 生成 8 位家庭码（字母数字，统一大写） */
export function generateFamilyCode(length = 8): string {
  let out = ''
  for (let i = 0; i < length; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  }
  return out
}

/** 校验：仅允许 8 位字母数字 */
export function isValidFamilyCode(code: string): boolean {
  return /^[A-Z0-9]{8}$/.test(code)
}

/** 读取家庭码；没有就生成一枚并持久化（首次打开抽屉即落盘） */
export function getFamilyCode(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && isValidFamilyCode(saved)) return saved
    const created = generateFamilyCode()
    localStorage.setItem(STORAGE_KEY, created)
    return created
  } catch {
    // localStorage 不可用（隐私模式等）时退化为内存态，不抛栈
    return generateFamilyCode()
  }
}

/** 写入家庭码；非法值直接拒绝并返回当前有效值 */
export function setFamilyCode(code: string): string {
  const normalized = (code || '').trim().toUpperCase()
  if (!isValidFamilyCode(normalized)) return getFamilyCode()
  try {
    localStorage.setItem(STORAGE_KEY, normalized)
  } catch {
    // 忽略：写不进去时仍返回规范化后的值，本次会话内有效
  }
  return normalized
}

/** 换一枚新的并覆盖 */
export function regenerateFamilyCode(): string {
  return setFamilyCode(generateFamilyCode())
}
