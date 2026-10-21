# 03_context.md · 事实快照（随项目推进更新，重投最新版）

> 投喂组合：本文件 + 02_playbook.md
> 漂移急救：全文重贴这两份即恢复全记忆

## §1 意图摸底（N0 结论）

- 定位：AI策 · 小初高渐进式 · 小圈子自用伴学系统《Nancy的奇妙书屋》；短期自用→中期≤20亲友；Web主站+PWA包装，Pad优先手机并重电脑兜底；桌面图标直达，无商店分发
- 受众：R1家长端（编排/投喂/审视）、R2孩子端（9岁女孩，执行/对话）、R3亲友首版不单独建模
- 存量：全新冷启，无历史遗留
- 气质：书屋系温柔向导，童话感不幼稚，可长周期用到高中；游戏化命名（副本/挑战塔/开花期/智慧星/温故小灶/藏书架）**N2已定稿，见链路④全封口**
- 负向：非公网非商业化非刷题机非冷工具风；知识库明确不走RAG
- 全量摘要：家长自研自用伴学系统《Nancy的奇妙书屋》，9岁女孩武汉·东湖高新区（光谷），小学语数英三科底座长陪伴至高中；Web+PWA壳Pad优先；全局聊天窗+拍照语音双模态；元认知横切；家长投喂非RAG知识库；批改页原图保真三态流式+延迟聚合讲题+家长异步二审；一期做通拍照批改讲题闭环，二期拓口语/出题/深度学情。

## §2 已拍板结论 + 依据（含来源锚）

| 结论 | 依据 | 来源锚 |
| --- | --- | --- |
| 产品名《Nancy的奇妙书屋》 | 用户命名，全站调性母题 | 00_decisions / N0-1 / 终封 |
| Web主站+PWA壳（非原生App非商店） | 用户明示PWA模式，小圈子免上架 | N0-1 / 终封 |
| Pad优先、手机并重、电脑兜底 | 用户"Pad可能更优先"校准 | N0-1 / 修正封存 |
| 知识库家长投喂、不走RAG | 用户明文"不需要RAG" | N0-1 / 终封 |
| 计划三态：AI草稿→家长确认→推送执行 | 多轮自述推导一致 | N0-1 / 终封 |
| 分期：MVP小学三科底座；口语/自适应出题/习作二期 | 用户"渐进嵌入"明示 | N0-1 / 终封 |
| 跨学年数据连续不按学期清 | "陪伴到高中毕业"推导锁定 | N0-1 / 终封推演锚 |
| 元认知横切非独立Tab | 用户"嵌入各环节潜移默化" | N0-1 / 终封 |

> 说明：移除原"拍板时点"，改"来源锚"= 指向 00_decisions 总锚 / 分册（如 01_content）/ 节点（N0-X）/ 切面（步级收口等），便于追溯结论归属与回查；不强制时间戳，以结构定位为主。

## §3 当前进度锚

- 阶段：阶段A·业务规约侧 ✅ 已封口（DEC总锚+线框索引+spec成文三件齐）；阶段B·技术实现侧 ✅ 已贯通；**架构迁转⑬ 进行中（2026-10-21 起：Cloudflare Pages → CloudBase，见 DEC-2026-10-21-ADR07）**
- 已终封域：批改页/讲题页线框（历史锁）；N2视觉精绘三视图（HomeShell/AtelierView/ArenaView）全封口；链路⑥内容层全封口（工坊语料+星练题壳+首页科普，跨页风线索闭环）；**链路⑨视觉精修方案Ⅱ「夜读纸窗」全封口**（radial-gradient星空+紫粉金主标题+暖米卡+暖雾紫毛玻璃底栏，build绿）
- 已封档：v1.0-nancy-bookhouse 纯净静态基线（2026-10-19封档，无欠账）—— **封存态保留，不因架构迁转解封、不回溯**
- 链路⑦新链路已开（开新不碰旧）→ **✅ 全封口**；⑦-₀ Shell铭牌--font-display补齐 ✅；⑦-A小狐呼吸彩蛋 ✅已封口（Shell.vue `<style scoped>` 小狐呼吸终稿：常态 .35 / hover·focus-visible .85 / transition .6s，无 init，零 JS 零 keyframes，单点壳层全站继承）
- 下一步实开：**架构迁转⑬ 三批推进为主线**（①底座通 → ②核心闭环 → ③规划打磨，用户只拍板不答题）；非阻塞挂起项不变（温故小灶🟡二期线框域 + 羽毛SVG化 + StarTrack 历史 breathe 清理）

> 主链实装骨架封 · 2026-10-20 · CAP-01→REV-01→REV-02→REV-03→TCH-01→PAR-01 全片 impl-done；主黄金路径闭环；下一阶段待开：OCR-L1真源切片（独立非阻塞）/ 链路⑪线框域 / 托管部署准备（三选待用户定序）
> OCR-L1真源切片已落 · 2026-10-20 · 架构分层「浏览器fetch → 无状态Edge(/api/ocr) → 腾讯云极速OCR(L1) → 归一OcrNormalized → 既有captures表一次put」；前端零AK零直连腾讯endpoint；真源异常静默回落mockReview桩不白屏；vue-tsc 0错·CSS 34644(±0严判)·JS +1075·PWA 8
> 部署形态（历史记录）· 2026-10-20 · 曾锁定 Cloudflare Pages、functions/ 原位复用 —— 2026-10-21 起该形态降为历史记录，**不再作为当前态**
> 当前底座 · 2026-10-21 · **迁转中 · 目标 CloudBase**（DEC-2026-10-21-ADR07：弃境外 CF 迁国内 CloudBase；静态壳复用 + ocr 云函数 + 前端直连 LLM + family_code 分区；旧 CF 链路整条弃用不双轨）
> git 主链封口 · 2026-10-20 · 本地 main 分支（初始提交 b1e163d「main-chain sealed」·60文件）+ 远端 GitHub Public 空仓，push -u origin main 成功闭环；CodeBuddy 不代执行有外部后果操作（git push/远端写/授权），此类动作用户手控

## §3.1 当前快照 · 迁转选型（2026-10-21 · DEC-2026-10-21-ADR07）

| 选型项 | 快照值 | 说明 |
|---|---|---|
| 底座 | **CloudBase**（弃 Cloudflare Pages） | 静态壳复用，不重写前端；国内节点就近 |
| 存储 | **四集合** | ①`families` 家庭档案（家庭码 family_code、家庭成员与偏好） ②`wrongs` 错题与讲题（采集原图元数据+批改结果、订正重判、讲题事件 append-only） ③`profiles` 学情与投喂（家长投喂知识库非RAG、知识点/题型打标、学情画像） ④`plans` 计划（每日/周计划草稿与家长确认态） |
| 分区 | **家庭码 family_code** | 每家庭一码，四集合一律按 family_code 分区；**替代登录体系**（不建注册/登录/账号） |
| 调用 | **callLLM 前端直连** | 模型密钥不落我方服务端；前端直连模型方，服务端只留存储与 ocr 云函数 |
| 兜底 | **本地缓存兜底** | IndexedDB 优先 + 网络异常回落本地缓存；JSON 导入导出兜底 |

- 云函数：`ocr` 云函数承接既有 OCR-L1 口径，密钥置云函数环境变量，**不入前端包**。
- 旧链路：CF Pages / Pages Functions / wrangler / _routes 口径**弃用**，`functions/` 目录内实装随迁转改造后退役。
- 禁止项：弃 CF 链路 / 弃买域名 NS / 弃服务端代调 LLM / 弃登录体系（详 `02_playbook.md §P13`）。
- 交付节奏：迁转按三批推进（①底座通 → ②核心闭环 → ③规划打磨，2026-10-21 对账校正权威口径），用户**只拍板不答题**（详 `02_playbook.md §P11`）。
- 实测托管域名 nancy-bookstore-d3fnn33i4766c7dc-1511708160.tcloudbaseapp.com，2026-10-21 11:20 冒烟200

## 2026-10-20 会话追加（主链心流共识登记）

- 主黄金路径口播共识落定（步序0→7全流口播，DEC-11/16/17/19/15合订复述确认，无修订、无推翻）
- 共识确认项（非新DEC，属复述固化）：
  ① 主链实装入口锚定：作业桌双入口壳已有、行为未接，为⑫首刀位
  ② 讲题内容严格隔离于独立讲题页、批改结果页零泄露（DEC-16复述确认）
  ③ 家长二审物理并行时间解耦定位复述确认（DEC-15修订语义再固化）
  ④ 星练场一期不阻塞主上线（会话重申，与DEC-26无冲突）
- 讨论路径选择记录：用户选B（先主链心流后线框）
- 下一步候选：⑪线框域待开，温故小灶六节点串行优先候选

## 2026-10-20 ⑫三拧点最终裁定（会话定稿·不可回滚）

| 拧点 | 裁定 | 备注 |
|---|---|---|
| Q1 等待过渡态 | B · 小狐微态占住（复用既有呼吸机制，无loading转圈，ocr-pending态脉冲触发钩子复用链路⑦-A） | 不新写keyframes |
| Q2 渲染节奏 | 整包收齐 → 一次赋值 → 整批直铺；无stagger、无transition-group、无错峰 | 腾讯云极速OCR-L1单次返回现实；「伪流式裸生长」分支会话内正式作废，不预留开关 |
| Q3 讲题退出落点 | A · 退回作业桌 | 不耦合温故小灶，路由解耦 |

- 三拧点全封，⑫主链行为契约具备派发条件。
- 作废登记：伪流式裸生长方案 · 2026-10-20 会话弃选。

## §4 目录与文档现状（前缀体系）

- 根：
  - 01_WEB-START.md（给人看说明书，不投喂，仅本地翻）
  - 02_playbook.md（行为契约+补丁区，固定投）
  - 03_context.md（本文件，事实层，重投最新版）
  - 00_notes.md（根笔记/索引，status: seed）← 2026-10-19 新建，2026-10-19 补索引
- notes/：
  - 00_decisions.md（总锚，永存，收录跨域核心结论）← 本次新建
  - 01_wireframes.md（线框索引册，status:seed）← 2026-10-19 新建
  - 02_voice.md（文案调性规约，status:open · 温留不真四字诀+句式硬约束+三类容器尺度）← 2026-10-20 新建
  - 04_structure.md（结构弹性规约，status:open · 骨皮解耦声明 + 弹性三则）← 2026-10-20 新建
  - NN_话题简写.md（分册，如 01_content / 02_visual；封册写 status:sealed YYYY-MM-DD）
- assets/（资产层 · 与 notes/ 规约册分离，句/素材不内联规约正文）：
  - voice-phrases.md（文案资产 · 灵感铭牌池 v0.1 · 11 句打底 + 欢迎语锁定句常量源）← 2026-10-20 新建
- spec/：
  - 01_mvp.md（MVP轻量Spec，已消费·链路③已贯通）← 2026-10-19 新建
- .codebuddy/：
  - rules.md（CodeBuddy本地规则自动注入：规约域只读禁写+消费纪律+md-touch回执+五锚定文件只读引用）← 2026-10-19 新建
- src/：工程源码域（v1.0-nancy-bookhouse 已封档）—— CodeBuddy 唯一可写域，WorkBuddy 不碰
  - components/（Shell / StarTrack / SoftCard / FoxHint / ParentGate）· views/（HomeShell / AtelierView / ArenaView）· App.vue
- .workbuddy/memory/：记忆层（MEMORY.md 跨会话长期记忆 + YYYY-MM-DD.md 当日流水）—— 仅 WorkBuddy 写
- 2026-10-21 ②-1 SDK底座落，cbApp/db单例就位（src/lib/cloudbase.ts 新建 + @cloudbase/js-sdk 入 deps；零业务逻辑/零集合读写）

## §5 协同与回执状态（三协同审核闭环）

- 最近 →粘WB/CB 块：2026-10-19 快照（§1–§3 全量覆写 + notes/00_decisions.md 新建 + 00_notes.md 建壳 status:seed）
- 最近回显：changed:[03_context.md, notes/00_decisions.md, 00_notes.md]｜state:ok｜diff-summary:§1意图与§2结论表全量落定，§3进N0-2，总锚与根笔记建壳完成
- 2026-10-19批次：N0-3终封快照+DEC-09/10写入；state:ok
- 2026-10-19 N0-4终封落盘批次 · state:ok
- 2026-10-19 归因语义修订（DEC-15）· state:ok
- 2026-10-19 批改页线框修正（删讲题预览前置/纠错显式化/DEC-16）· state:ok
- 2026-10-19 批改页命名修订（订正/要讲/三行标签·DEC-17）· state:ok
- 2026-10-19 DEC-09 最终态补注（append 冷存·不做结构化扩展）· state:ok
- 2026-10-19 模型调度策略（单主力模型+场景能力槽预留·DEC-18）· state:ok
- 2026-10-19 歧义收口（二审非必填显式覆盖 + 点亮措辞统一）· state:ok
- 2026-10-19 小狐IP锁定+家长指定硬覆盖优先级显式化·DEC-19修订/DEC-21·state:ok
- 2026-10-19 二级限制作废注 + 口算去按钮 + 星练场定稿三键终封（DEC-11注/DEC-25修/DEC-26）· state:ok
- 2026-10-19 DEC-13底栏旧措辞就地对齐星练场终稿·清尾·state:ok
- 2026-10-19 DEC-13第3条桥接注补齐，宪法层全文自洽终封·state:ok
- 2026-10-19 §3进度锚刷新，消除「首刀批改页」过时标记歧义·state:ok
- 2026-10-19 建 notes/01_wireframes.md 索引壳，线框已封域登记归档，会话终封态首次可审计化·state:ok
- 2026-10-19 playbook补丁·线框起稿硬门写入，根因闭环·state:ok
- 2026-10-19 首页素壳骨架会话定稿登记入01_wireframes，title铭牌左上定稿/弧线星轨进度/活时段欢迎句/星练轻卡全按推演锁定·state:ok
- 2026-10-19 DEC-23补录总锚+DEC-22合流注，溯源缺口闭合·state:ok
- 2026-10-19 总锚编号消歧注补齐（20/22/24），编号表全交代无跳号歧义·state:ok
- 2026-10-19 spec/01_mvp.md 落盘（MVP范围/黄金路径/技术栈Vue3+Vite+TS/5公共组件/验收6条/CodeBuddy首刀指令）·state:ok
- 2026-10-19 阶段A封口·闸门已开（A→B唯一硬信号触发；总策须输出「A封口清单+B待走步骤+可派活状态」）·state:ok
- 2026-10-19 playbook补丁C·链路步号显式播报写入（链路①~⑤总图+每轮首条前置播报+三场景重播）·state:ok
- 2026-10-19 .codebuddy/rules.md 落盘（三角权责落地：CodeBuddy规约域只读禁写+疑点上报WorkBuddy+md-touch回执）·state:ok
- 2026-10-19 N2视觉精绘三视图全封口（链路④）·state:ok
- 2026-10-19 链路⑥内容层三刀全封口（工坊+星练+首页科普）·state:ok
- 2026-10-19 v1.0-nancy-bookhouse封档裁定（摘要纠偏闭环，文档源码同源纪律样本）·state:ok
- 2026-10-19 ⑦-₀铭牌单行补齐（Shell.vue .plate切--font-display）·state:ok
- 2026-10-19 工具分工定论落记忆（CodeBuddy代码/WB记忆双轨）·state:ok
- 2026-10-19 ⑦-A小狐呼吸彩蛋封口（Shell.vue scoped `:deep(.fox-corner)` opacity .35/hover .85/transition .6s，零keyframes零JS，检查点保留落盘）·state:ok
- 2026-10-19 03_context §3终刷（⑦-A状态对齐真实态，空盘标记写入）·state:ok
- 2026-10-19 §3链路⑦全封口+小狐呼吸终稿参数对齐（.35/.85/.6s·无init·零JS零keyframes）·state:ok
- 2026-10-19 温故小灶登记注落盘（notes/01_wireframes 标非阻塞二期域，§3/登记册口径温差闭环）·state:ok
- 2026-10-19 文档体检23条同步执行（H1~H5高优 + M1~M11中优 + L1~L7低优全改完；.fox-corner 类名回源码核实为真）·state:ok
- 2026-10-20 链路⑨方案Ⅱ「夜读纸窗」全封口（视觉基线定稿入00_decisions + 三条防返工技法备忘 + 零动区冻结 + 三项待办挂起）·state:ok
- 2026-10-20 链路⑨微调⑫·板块名胶囊三处显式同源补刀完成·state:ok
- 2026-10-20 链路⑩结构弹性规约固化（notes/04_structure.md 新建 + 00_decisions 骨皮解耦结论回链，源码零改动）·state:ok
- 2026-10-20 notes/02_voice.md 文案调性规约落定（温·留·不·真四字诀+句式硬约束+三类容器尺度+反例对照）·state:ok
- 2026-10-20 文案资产分离（新建 assets/voice-phrases.md 铭牌池v0.1 + 02_voice 附录锚指向 + §4 assets 段登记）·state:ok
- 2026-10-20 会话追加落档（§3 主链心流共识登记 + 01_wireframes 增「主链黄金路径行为契约」行 + memory 流水追加）·state:ok
- 2026-10-20 ⑫三拧点最终裁定落档（Q1=B小狐微态 / Q2整批直铺 / Q3=A退回作业桌；伪流式裸生长作废）·state:ok
- 2026-10-20 ⑫CAP-01 采集页行为接入完成（新建6文件+改动2文件；vue-tsc 0错·CSS+2302归因新页scoped·JS+3990·PWA 8·deps 0·网络0·新keyframes 0）·state:ok
- 2026-10-20 ⑫REV-01 批改结果页实装完成（新建mockReview桩6条+ReviewView改写447行；Q2整包直铺·Tab本地filter·四胶囊toggle·⟲就地浮层翻转色轨随动；vue-tsc 0错·CSS+5029归因本页scoped·JS+4182·PWA 8·零transition-group/Teleport/网络/新keyframes）·state:ok
- 2026-10-20 ⑫REV-02订正重判 + REV-03要讲聚合 串行完成（订正就地行内区+桩judgeStub单题原地重判；要讲键+静态星芒::after+家长长按600ms硬覆盖+簇区computed变身「开始讲题」+teach占位路由；vue-tsc 0错·CSS+2999/+2036·JS+4421/+1674·PWA 8·零transition-group/Teleport/网络/新keyframes）·state:ok
- 2026-10-20 ⑫TCH-01讲题流页实装完成（Q3首次落地：三入口统一退出·replace('/home')历史不堆叠；苏格拉底4句按题序取模无随机；独立库nancy-bookhouse-teach/teach-events纯append；零题面消费零色轨类零评分）·state:ok
- 2026-10-20 ⑫PAR-01家长二审通道完成+【主链实装骨架封】（家长态薄条inline非全屏·默认全直过·归因四选一append diff·退出即清态；captures字节级零变化/teach-events只增不改/ls·ss零写入实测通过）·state:ok
- 2026-10-20 OCR-L1真源切片完成（新建functions/api/ocr.ts无状态Edge+_shared归一+src/types/ocr.ts+useOcr.ts；TC3签名自实现零SDK；Edge六分支全200静默回落；CSS±0严判通过·src内Secret类0命中）·state:ok
- 2026-10-20 部署准备DEP完成（CF Pages锁定·functions/原位·deploy-notes落盘仅列变量名零secret泄露·gitignore新建·DEP-01 _routes.json生成零依赖插件·CSS/JS/precache三项零变化）·state:ok
- 2026-10-20 git主链封口落档（本地main+远端GitHub push成功·CodeBuddy不代执行外部后果操作纪律首立·deploy-notes production_branch回填完成）·state:ok
- 2026-10-21 迁转批次·全源层同步（playbook §P11~§P13 节奏+权切分+禁止项 / context §3 阶段·底座·封存态 + §3.1 迁转选型快照 / 00_decisions DEC-2026-10-21-ADR07 / spec §3 存储行 / META DOMESTIC-PRIORITY 补丁 + §B§C§D§I）·state:ok（WB 落盘完成，回显待元宝 §P10 对账）
- 审核结果：落盘确认✓（待用户回执）

## §6 校准协议（漂移急救）

- 贴入 03_context（本文件最新版）+ 02_playbook（含补丁区）+ notes/（00_decisions 总锚 / 01_wireframes 索引册）+ spec/01_mvp.md 即全恢复
- 用户说"飘了/校准"→ 重贴全文，元宝复读 §1+§2+§3 摘要确认

> 技术纪律锚（2026-10-20，同源META PH-tech）：技术题元宝直判直给主张与理由，用户零技术门槛只做认受；冷启动重建记忆时本锚与META置顶同读。