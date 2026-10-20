# MEMORY.md · 项目长期记忆（Nancy的奇妙书屋）

> 跨会话接续用。规约权威源：`notes/00_decisions.md`（宪法）+ `notes/01_wireframes.md`（线框登记）+ `spec/01_mvp.md`（Spec）
> 行为纪律：`02_playbook.md`【补丁区】（起稿硬门 / 阶段闸门 / 链路播报）+ `.codebuddy/rules.md`（CodeBuddy 侧约束）

## 一、工程身份

| 项 | 值 |
|---|---|
| 项目名 | 《Nancy的奇妙书屋》 |
| 技术栈 | Vue3 + Vite + TypeScript + vite-plugin-pwa |
| 包管理 | corepack pnpm 12.14.0，`pnpm-workspace.yaml` 已设 `allowBuilds.esbuild: true` |
| dev服务 | http://localhost:5173/（常驻） |
| 路由 | hash 路由：`#/`（首页）、`#/atelier`（妙语工坊）、`#/arena`（星练场） |
| 视觉基线 | **链路⑨ 方案Ⅱ「夜读纸窗」已定稿**，详见 §二 与 `notes/00_decisions.md` 专节 |

## 二、链路进度（截至 2026-10-20）

| 链路 | 状态 | 要点 |
|---|---|---|
| ① 地基宪法 | ✅ 封口 | DEC-09~26 + 骨架备忘 + 编号消歧注（20/22/24已交代） |
| ② 业务规约 | ✅ 封口 | 线框索引册3域已封 / spec/01_mvp.md 已消费 |
| ③ 技术实现 | ✅ 封存 | hash 三路由同壳无白屏，深度≤2 |
| ④ N2视觉精绘 | ✅ 三视图全封口 | HomeShell / AtelierView / ArenaView；style scoped 全程冻结 |
| ⑤ 交付验收 | ✅ 全绿通过 | — |
| ⑥ 内容层 | ✅ 全封口 | 工坊 museLines/foxHints · 星练 starQuests/arenaFoxHints · 首页 todayKnowledge 风线索闭环 |
| ⑦-₀ 铭牌补齐 | ✅ | `Shell.vue` `.plate` font-family 已切 |
| ⑦-A 小狐呼吸 | ✅ 全封口 | `foxBreathe 3.6s infinite` + pointerdown 脉冲 `foxPulse` |
| **⑨ 视觉精修方案Ⅱ** | **✅ 已封口 2026-10-20** | radial-gradient 星空 + 紫粉金主标题 + 暖米卡 + 暖雾紫毛玻璃底栏 + 微调⑫胶囊三处显式同源 |

**封存基线标记**：`v1.0-nancy-bookhouse` 纯净静态基线已封档。

### 链路⑨ 视觉基线（防返工 · 跨域不可推翻）

1. **星空禁用 `box-shadow` + `::after` 伪元素** —— WebKit / 华为 WebView 真机吞绘。锁定 `radial-gradient` 平铺 220×220（`.starfield` 实元素）。远层50点1px α.50~.55 + 近层30点2px α.8。
2. **底栏 fixed 祖先不得写 `transform`** —— 否则 fixed 被拐入包含块致下滑遮挡。锁定 `left:0;right:0;margin:0 auto` 无 translate 写法。
3. **iPad hover 必须用 `@media (hover:hover) and (pointer:fine)` 隔离** —— 禁止裸 `:hover` 承担交互反馈。
4. 主标题 `.plate` 紫粉金渐变是**唯一渐变标题，豁免字体统一**；`--font-base:16pt` 字号不动。
5. **板块名胶囊三处显式同源**（链路⑨微调⑫·2026-10-20）—— `HomeShell` / `AtelierView` / `ArenaView` 三处 `:deep(.soft-card-tag)` 必须**逐字符显式声明 7 项**（`background: rgba(232,223,245,.55)` / `color: #3A2E4D` / `font-weight: 600` / `font-family: var(--font-family)` / `padding: 4px 12px` / `border-radius: 999px` / `display: inline-block`），**禁止靠 `SoftCard.vue` 默认值巧合一致**——改默认值会静默漂移。

**零动区（封口冻结 · 后续非必要不碰）**：小狐高光描边 · 灵感提示铭牌手写体 · `--color-ink` 深字 · PWA ⑧-B/⑧-D 资产 · `manifest.webmanifest` · 路由结构。

**待办挂起（非阻塞）**：羽毛 🪶 emoji→可着色 SVG（需 template 改动，单独步）· 温故小灶竖向时间轴骨架 · `StarTrack.vue` 历史 `@keyframes breathe` 存量清理。

## 三、硬纪律（下轮必须继承）

1. **`md-touch: none`** —— 规约域（`notes/**`、`spec/**`、根级 `*.md`、`02_playbook.md`、`03_context.md`）零读写；CodeBuddy 侧仅 rules 只读引用。
2. **不碰命令行** —— 全部由 CodeBuddy 代执行，用户全程零手动命令。
3. **视觉层 style scoped 冻结** —— 非明确放开不重写；链路⑨ 零动区已冻结。
4. **无新增 `@keyframes`、无新依赖、正文 16pt 易读兜底**（`foxBreathe`/`foxPulse` 为链路⑨ 已封口例外）。
5. **手写体仅限标题与标签**，正文一律 `--font-base`。

## 四、用户画像与委托约定

- **用户**：孩子家长；孩子 9 岁女孩 Nancy，武汉·东湖高新区（光谷），公立体系约三年级。
- **委托模式**：「技术侧我不懂，你拍板」—— AI 端全权拍板，用户零手动命令。
- **节奏偏好**：慢节奏、不赶、**验收顺再推**；一轮一收口，不堆叠。
- **反馈习惯**：交付物习惯做减法；重构交付后追问原版与重构版差异及优劣。

## 五、下轮接续动作

1. 首条输出必播报链路步号（遵`02_playbook.md` 补丁C）。
2. **当前无活跃待办**——全工程空盘。下轮开场先问用户下一域指向，或从非阻塞挂起项接续。
3. 收回执时核 `md-touch: none`，非 none 即触发 §P10 复核矩阵「路径溢出派发范围」告警。
4. 规约疑点一律由 CodeBuddy 报「⚠️ 规约疑点」上行，WorkBuddy 落盘，CodeBuddy 不自行改 md。

## 六、工具分工定论（已实操验证 · 不得混发）

| 层 | 角色 | 职责 | 禁碰 |
|---|---|---|---|
| **CodeBuddy** | 代码执行层 | 读改 `src/` 源码、出 diff、热更 | 不写 memory、不碰规约域 |
| **WorkBuddy** | 记忆/存档层 | 写 memory、写规约落盘 | **不碰源码** |

- 两条通道**不混发**：代码类指令只投 CodeBuddy，记忆/规约类只由 WorkBuddy 执行。
- **例外备案**：2026-10-19 22:49 与 23:12 两轮链路⑨微调，用户明确转派 WB 代跑源码，WorkBuddy 直接改了 `src/`——**此为用户显式指令下的破例，非常态**。
- 用户全程**零命令行介入**，两侧输出对用户只呈现结论与观感。

### 摘要纠偏样本（纪律留存）

- **事实**：封档时的会话摘要曾把「Shell 铭牌手写切换」误写为**已交付**；核对源码后确认该项当时仍是**待启项**。
- **裁定**：选方案 2 —— 不动源码、只改摘要措辞（随后才正式放开执行 ⑦-₀ 单行补齐，现已无欠账）。
- **纪律沉淀**：**文档与源码必须同源**。摘要/记忆里的「已完成」不得凭转述采信，须回源码核对；发现不符先纠文档，再决定是否放行实现。
- 二次样本：小狐呼吸参数曾误记 `.82/1.8s`，回源码核为 `.35/.85/.6s`；`.fox-corner` 类名亦经源码核实为真。
- 三次样本（2026-10-20）：链路⑨ 封口快照称「板块名胶囊全页面统一」，回源码核 `AtelierView:108` / `ArenaView:113` 仍为 `font-family: var(--font-display)` 未套 `rgba(232,223,245,.55)` 胶囊底——**该口径与源码不同源，已按源码记账**。