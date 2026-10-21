# notes/04_structure.md · 结构弹性规约

> 内容结构层软约束 · 与视觉基线（链路⑨）分卷管理
> status: open

## 骨皮解耦声明

> 视觉基线（链路⑨）约束**皮与壳**；内容条数、排列顺序、空态呈现均属**可注入态**，不在视觉封口冻结范围内。

- 「皮」= 视觉层：色值、字体栈、圆角、阴影、星空技法、底栏形态 —— 链路⑨ 已封口冻结，非必要不碰。
- 「骨」= 内容结构层：条数、顺序、空态、栅格列数 —— 随内容共创阶段演进，由本册规约约束。
- 判定依据：内容骨架层（`.shell-main` / `.soft-card`）**无硬高、无 overflow 截断**，纵向可自由生长，骨皮解耦成立。

## 结构弹性三则（链路⑩ 2026-10-20 自检结论）

### ① 视图层禁 slice 截断
除 `AtelierView.vue:35` 一期刻意 `slice(0, 2)` 外，全工程 `v-for` **不得视图层强制截断**；加语料同步解此处。

### ② 双列硬栅格属「双入口」语义约定
`.entry-row`（ArenaView 练题双钮）/ `.desk`（全局作业双钮）的 `grid-template-columns: 1fr 1fr` 是**双入口语义约定**，扩入口数量须**显式改 grid 列数**，不默认可自适应。

### ③ SoftCard 当前仅 default slot，无 empty slot
空态 / 扩展位设计**延至真实数据形态确定后二期统一给**；**禁止现阶段临时写 `v-if` 整节隐藏**。

## 自检事实依据（2026-10-20 · 只读扫描）

| 检查点 | 事实 |
|---|---|
| 高度锁死 | `.soft-card` 零硬高零 overflow；`.shell-main` 仅 `flex:1` + `overflow-y:auto`；全工程 0 处 `max-height` |
| v-for 截断 | 视图层仅 1 处（`AtelierView:35`）；其余为数据层静态 mock 字面量（正常） |
| 空态 | 无 `v-if="list.length===0"`、无骨架屏、无 empty slot、无空文案兜底 |
| scroll-snap | 全工程 0 命中 |
| slot 清单 | `SoftCard.vue` 仅 default + `tag` prop；`FoxHint.vue` 仅 default（带 slot 自守卫） |

## 规约

- 本册只收**结构层软约束**，不装视觉值、不装业务逻辑。
- 视觉值回链 `notes/00_decisions.md` 链路⑨ 专节；线框登记回链 `notes/01_wireframes.md`。
- 封册信号：结构弹性三则被实际突破或被二期方案取代 → 文件头写 `status: sealed YYYY-MM-DD`。

---

## [2026-10-21 EOB] 迁转⑬进度锚

- ②-1✅ ②-2✅ ②-3✅ ②-4a✅ ②-4b✅ ②-4c✅ ②-4末✅ ②-4.5✅
- 线上: *.tcloudbaseapp.com (②-4.5 mock态, PWA 176KiB)
- 源码: main分支 ahead 0 (11提交已push)
- 下一刀: ②-5 设置抽屉(familyId+Key+导出+归因UI)
- 闸门: G2(wireState='live')独立, 等②-5收完+真机冒烟绿
- 挂件: SDK chunk瘦身(独立步) / 旧哈希prune(下次deploy)
