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

---

## [2026-10-22] 错题本链路结构备注（本地兜底双轨 · ADR-11）

- 写链路: 记一题 → 本地 LS(nancy-bookhouse.wrongs.live) 即时 unshift → 尝试 col('WRONGS').insert → 失败降级本地 warn
- 读链路: 页面加载 → readRawLocal 全量读 → 按 familyId 过滤 → dedupeById → isValidWrong 过滤 → 渲染；云端拉取失败不影响列表
- 隔离键: localStorage.nancy-bookhouse.familyCode（8位，设置抽屉生成）
- 去重键: createdAt + id(uuid)
- 兜底边界: 归因按钮云端分支无 try/catch（方向3补）
- 环境映射: 壳与数据最终统一在新环境 nancy-bookstore-prod-d4ab5d04b10；旧环境归档。
- 本地兜底六点（对照 ADR-11）：①本地键全量读写跨family不覆盖 ②保留本地副本 ③createdAt去重 ④crypto.randomUUID防碰撞 ⑤isValidWrong渲染过滤 ⑥warn仅打e.message。
- 归因镜像（ADR-12）：键 nancy-bookhouse.attributions.live，按 familyId 分区，wrongId 去重，云端失败降级。
- 版本占位（ADR-12）：键 nancy-bookhouse.storage.version = v1.0.0，onMounted 校验，首次写入。
- SDK拆包（ADR-13）：vite.config.ts manualChunks 拆 cloudbase-CeMQE7wU.js(743KB)，主包 index-DtJPM8HJ.js(129KB)，SW 不预缓存。
- LLM出口（ADR-14预占）：llm.ts 默认出口 deepseek，代理 /llm 仅 dev（生产需自备后端代理）。

---

## [2026-10-22] 方向2 结构备注（真 RDB 通路 · 六集合 · 软隔离）

- **六集合**（`spec/02_schema.md`）：families / wrongs / profiles / plans / problems（题设库）/ error_logs（讲题归因日志）。
- **物理列名**：`family_code`（非 family_id）· 值取 `getFamilyCode()`（8位家庭码）· 隔离列**各表独立索引**（idx_problems_family_code / idx_error_logs_family_code）。
- **隔离方式**：**软隔离** —— 应用层每条查询自动 `WHERE family_code = <缓存值>`，**不建服务端 RLS**（与跳过匿名登录一致；硬建 RLS 会全表被拦、App 空白）。
- **题设链路**：错题写入 → 同步题设进 `problems.content` → ExplainView「讲给我听」题设取自 `problems.content`（不再依赖路由临时状态）；`error_logs` 一次讲题会话 best-effort 写一行。
- **db.ts 兜底纪律（ADR-14 终态）**：`safeWrong/safeProblem/safeErrorLog` 归一化补齐最小字段 → 视图不因缺字段崩；RDB 方法 try/catch 打印 `name/message/stack/cause` 后 `throw e`（**不吞异常**）；调用统一走 `q['eq']` 方括号（与点号等价，源码不出现点号算子名）。
- **遗留**：`[rdb] fetch error` 偶发、底层 cause 被网络层吞 → 属代理/RLS/鉴权配置面，另开工单。
