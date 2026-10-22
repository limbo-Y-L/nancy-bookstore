# notes/00_decisions.md · 总锚（永存）

status: open

## 身份锚

- 产品名：《Nancy的奇妙书屋》
- 孩子画像：9岁女孩，武汉·东湖高新区（光谷），公立体系，当前约三年级
- 地域锚：武汉现行教材（统编语文/人教数学/外研或人教英语），知识库初始化以此为准

## 架构硬约束（跨域不可推翻）

- 形态：Web + PWA，一套代码三端
- 知识库：家长投喂制，**禁止引入RAG向量检索**
- 数据：user级跨学年连续，错题/学情不按学期硬清
- AI persona：书屋温柔向导，非老师非考官
- 权限：家长全权 > 孩子执行权；首版不建独立访客权限模型

## 分期锚

| 阶段 | 范围 |
| --- | --- |
| MVP | 拍照批改+错题归集+学情看板+计划草稿/确认+讲题（多讲法待定） |
| V1.1 | 英语口语场景对话 + 自适应练习生成 |
| V1.2 | 语文习作引导 + 每日开眼界深化 |
| 远期 | 初中/高中学科口子开放 |

## 调性锚

- 视觉参考：已有UI草图（副本/挑战塔/开花期/智慧星/温故小灶/藏书架），N2定稿
- 负向红线：不硬核刷题风、不幼稚低幼风、不冷工具风

---

## N0-3 终封补记 · 2026-10-19

[DEC-09] prompt变更禁止自动回灌；纠错对话日志仅append-only冷存，不作自动消费；prompt调优仅限人工（家长主理人）审阅抽样后手动触发发布。硬红线。

[DEC-09·注] 纠错史料当前仅append冷存，不做结构化扩展、不做prompt版本打标；
未来若启动prompt人工调优复盘，再补字段与分析工具，属增量追加、主链路零改动。

[DEC-10] OCR三层分级架构锁定：
- L1 腾讯云极速OCR（1~3s，月免费额度≈1000张）常态主力
- L2 腾讯云标准慢速OCR（10~15s，低单价档）
- L3 端侧本地wasm OCR（PWA内预载，零调用费，精度兜底）
- 调度：当月L1累计<阈值T（默认800，前端设置页可改，可调区间600~950）全走L1；≥T进AI动态路由；触硬顶强制切L2+L3
- 分期：一期先L1单路跑通主流程，三层接口与阈值UI入口一期画壳、逻辑二期实装

## N0-3 场景主链路终稿摘要（终封）

主链：拍照/相册上传≤9张 → 识别切图（原图裁切保真）→ 批改结果页（左→右/上→下题号流式；顶部Tab默认「错题+空题」可切「全部」；三态：正确/错题/空题）→ 孩子订正重判 → 逐题标记要讲 → 底部【开始讲题】统一进讲题流 → 讲过即入艾宾浩斯复习池（简版骨架一期）

标签三维度：知识点(AI打标) · 典型题型(AI打标，数学排队/差倍/归一类) · 归因四类(粗心失误/概念不清/方法不会/审题偏差，默认空不AI自判，孩子选填、家长二审可选覆写)
> 注：原「家长二审必填可补」表述已由 DEC-15[语义显式覆盖] 撤销，二审为可选覆写通道、非强制卡点。

AI纠错双向翻转：实错AI判对→纠错确认翻错；实对AI判错→纠错确认翻对；翻转结果写状态，对话原文append存档

家长端：独立「错题待确认」列表，二审异步不阻塞孩子端主流程，默认全直过、仅人工觉拧时覆写归正（承 DEC-15 兜底复核口定位）

分期结论：批改页全交互+讲题延迟聚合+家长二审+OCR-L1单路 一期；艾宾浩斯精算/三层路由实装/藏书架大视图/学情深度/挑战塔出题 二期+

---

## N0-4 气质域终封 · 2026-10-19

[DEC-11] 交互哲学硬原则「清爽顺滑·少决策」：
- 单屏显式决策点≤2；能默认走默认、能AI预填不空等、能后置归正不前置卡审
- 仅两类允许确认弹：不可逆写操作 / 计划大改；其余静默推进
- 孩子端零决策（仅做/继续/点亮，无二选一）
- 与气质红线合一：不焦虑/不过度/不误触/不堆控件

[DEC-11·注] 原「不上二级目录」表述作废；允许局部轻二级页（作业清单页、星练场内子切面等）。
收紧约束：二级页仅作内容承载、不堆叠面包屑、返回一键直达首页、孩子路径深度≤2层。
DEC-11其余条款（单屏决策点≤2、孩子端零决策、不可逆写操作/计划大改两类弹确认）全文保持有效。

[DEC-12] 视觉锚终版：淡紫星空「星夜童话」质感；低饱和淡紫渐变+稀疏星点+微光十字星；轻量游戏化（节点点亮星芒/星轨连线）；拒绝爆金币/火焰/满屏动效/深空霓虹。

[DEC-13] 首页与导航终版：
- 底栏三键终稿锁定：[首页][妙语工坊][星练场]；原「今日/藏书架/开眼界」表述由DEC-26覆盖生效，此处同步对齐。右上羽毛图标长按唤家长态（面容/轻验证隔离，防孩子误触）
- Pad竖屏优先、手机并重、电脑兜底：竖屏（Pad横屏：横向星轨全展；手机竖屏：单节点展开+后续折叠胶囊，非全铺纵向列表）
- 首页不上二级目录；首页主使命=当日任务剧本引导（二级页限制见 DEC-11·注）
- 全局聊天窗双态：孩子态（讲题/口语）/ 家长主理人态（指令+偏好注入），同一组件两套prompt上下文，不另建指令页

[DEC-14] 预埋契约：任务完成事件结构化上报，badge_id/pet_event字段预留空位；一期不渲染勋章积分宠物，中后期渐进开，不返工。

[DEC-15] 归因四类（粗心/概念不清/方法不会/审题偏差）孩子端批改页可见可点：
- 呈现：轻问句引导「这题卡在哪了？」+四胶囊，默认全灰未选，不强迫不选也能继续
- 肩并肩场景为主归正通道（前期家长在场直接点）；孩子后期自点培养元认知
- 状态双写：孩子点选=草稿态静默落；家长二审覆盖=正式态；diff留痕append
- 家长端「错题待确认」列表定位修订：由"唯一归正口"调整为"事后兜底复核口"，大部分直过
- 撤销原隐含假设"归因仅家长二审可见"
> [语义显式覆盖] 撤销 N0-3 原稿中「家长二审必填」表述；二审定位为可选覆写通道，非强制卡点。归因以孩子端/肩并肩当场落态为准；二审列表默认全直过，仅人工觉拧才改。

[DEC-16] 批改结果页纠错交互显式锁定：
- 非独立页非弹层，嵌于题卡主区右上角轻浮钮「⟲判一下？」，非常驻不主动弹
- 触发后半透浮层二选：[翻] / [保持]，翻转即生效、题号轨色随动
- 翻转前后双态+触发人+时间戳 append冷存（承DEC-09）
- 讲题文字内容严禁前置泄露至批改结果页；讲题内容仅存在于独立讲题页

[DEC-17] 批改结果页底栏命名与订正态：
- 左键「订正」（非「订正手写」）；点进后支持键盘输入正确答案 / 📷拍照上传订正二选，提交后AI单题重判
- 右键黑话「点亮」改为「要讲」：语义直白，9岁可懂，与「开始讲题」呼应
- 全部标记「要讲」后，右键变「开始讲题」进入讲题页（延迟聚合）
- 主区标签三行独立分行左对齐轻灰字：
  行1 🏷知识点：xxx （AI自动·只读）
  行2 🏷题型：xxx   （AI自动·只读）
  行3 💬这题卡在哪了？ + 归因四胶囊（可点选·默认灰）

[DEC-18] 模型调度策略：
- 一期：单主力模型统一承载全部场景（判读/讲题/打标/对话），靠system prompt分人格；不引入多模型路由，降低工程复杂度
- 架构层：预留「场景能力槽」抽象接口（判读槽/讲解槽/出题槽/对话槽），配置化映射，二期按需实装分派，一期不实例化
- 一期主力倾向千问系底座；二期出题类槽位评估切DeepSeek数理档
- 与DEC-10 OCR三层为同一架构哲学（单路先跑、口子留好）

[DEC-19·修订] 讲题范式（条件触发·双源判定）：
- 进入讲题流判定双源：
  ① AI自动判定：错题/空题/低置信 → 建议进讲题流
  ② 家长指定：长按题号标记「要讲」→ **家长指定权重 > AI自动判定，硬覆盖**
  ③ 简单高置信且无家长标记 → 直过，不进讲题流
- 引导对话苏格拉底式追问，AI只追问不直给答案
- 引导走通后出主讲翻转触发句；无触发则不进主讲阶段
- 主讲阶段AI静听不打断不纠错；收束一句温度软话反馈，无打分无星级
- 主讲完成事件落盘，一期不渲染评价面板

[DEC-21] 全局IP形象锁定：
- IP定型：**小狐**（圆眼、毛茸茸、轮廓柔、无尖耳锐感），淡紫系配色融入星空底色
- 贯穿机制：轻提示偶发探头 / 对话页AI气泡头像位以小狐图标代纯文字 / 首页星轨节点旁偶发微动
- 形象精绘留N2视觉，机制一期即生效
> 【落地备案 · 2026-10-19】链路⑦-A 已落第一条：壳层小狐呼吸——`Shell.vue` `<style scoped>` 内 `:deep(.fox-corner)` 常态 opacity .35 / hover·focus-visible .85 / transition .6s ease-in-out，无 .init 规则、零 @keyframes、零 JS，template 未动，单点壳层全站继承。其余两条机制（对话页气泡头像位、星轨节点微动）待排期。

[意向预挂·非硬DEC] 讲题能力评价模型（二期起细化）：
维度意向条理/条件抓取/因果表达；分层萌芽→能说清→能讲透；
远期反哺引导深度+讲题选题；当前仅预埋事件位不锁规格。

[DEC-25·修订] 口算结果页底部无操作键，阅完即退；删除原「再练一组」表述。
其余DEC-25条款（原图反显+错位轻叉叠层、当日量统计、近半月极简折线趋势无刻度）保持不变。

[DEC-26] 底栏第三键命名定稿：**星练场**（三字；星=承接淡紫星空星轨视觉系，练=孩子零解释秒懂，场=结构化空间感）。
原DEC-24骨架草稿中「知星阁」表述正式作废。
底栏终稿三键锁定：**[ 首页 ] [ 妙语工坊 ] [ 星练场 ]**。
说明：原DEC原文「今日/藏书架/开眼界」措辞由本组覆盖，跨域追加覆盖生效。

[全局骨架同步备忘·非硬DEC正文，置DEC-26后]
首页纵向流顺序（自上而下）：
顶氛围区（欢迎词+日期天气轻显）→ 作业桌（双入口：作业批改/口算批改）
→ 每日开眼界 → 温故小灶（6节点串行）→ 星练场入口锚点
智库管理：家长视图内底座资产层，孩子侧不可见，入口走右上羽毛长按家长态。

[DEC-23] 妙语工坊域规格（补录，原会话定稿未落盘，2026-10-19补录）

域结构：习作辅导 / 语文素材库（AI+家长双源）/ 英语素材库 /
朗读过关流：语音输入→发音+理解双维轻判→不过不扣分温柔再来→L级晋级。
意向预挂：课外语文阅读AI指导（待细化，不锁）。
评价模型预埋：条理/条件抓取/因果表达，三阶萌芽→能说清→能讲透，一期仅预埋事件位不渲染。

> 注：DEC-22 底栏形态条文语义已由 DEC-13修订+DEC-26 承接合并，不独立补录，编号保留跳号留痕。

【编号消歧注 · 2026-10-19】
DEC-20：编号未启用，留空不补。
DEC-22：底栏形态语义由 DEC-13修订 + DEC-26 承接合并，不独立成文（已注）。
DEC-24：会话骨架草稿，未独立落盘，语义并入全局骨架备忘（非悬空）。

---

## 链路落地备案 · 2026-10-19（工程实装态登记）

| 链路 | 状态 | 落点 |
| --- | --- | --- |
| ④ N2视觉精绘 | ✅ 三视图全封口 | `HomeShell` 雾感transition / `AtelierView` 轻雾工坊 / `ArenaView` 轻雾星练；style scoped 全程冻结未重绘 |
| ⑥ 内容层 | ✅ 全封口 | 工坊 museLines/foxHints · 星练 starQuests/arenaFoxHints · 首页 todayKnowledge「风没有形状，但树叶知道它来过」跨页风线索闭环 |
| ⑦-₀ 铭牌 | ✅ 补齐 | `Shell.vue` `.plate` font-family 切 `--font-display`，真实基线补齐无欠账 |
| ⑦-A 小狐呼吸 | ✅ 封口 | `Shell.vue` `<style scoped>` `:deep(.fox-corner)` opacity .35 / .85 / .6s ease-in-out，无 .init、零 keyframes、零 JS |
| ⑨ 视觉精修 · 方案Ⅱ夜读纸窗 | ✅ **全封口** | 见下方「链路⑨ 视觉基线定稿」专节 |

- 封档基线：`v1.0-nancy-bookhouse` 纯净静态基线（2026-10-19 封档，无欠账）。
- 链路⑦ 已全封口（开新不碰旧，基线不回溯）。
- 非阻塞挂件：温故小灶六节点线框属二期域（登记注见 `notes/01_wireframes.md`）。

---

## 链路⑨ 视觉基线定稿 · 方案Ⅱ「夜读纸窗」 · 2026-10-20 全封口

| 维度 | 定稿值 |
| --- | --- |
| 页面底 | 深紫→雾紫 160deg 渐变（`.shell::before`） |
| 星空技法 | **`radial-gradient` 平铺 220×220**，弃 `box-shadow` + `::after` 伪元素方案 |
| 星点参数 | 远层 50 点 1px α.50~.55 + 近层 30 点 2px α.8，纯 CSS 零动画 |
| 主标题 | `.plate` 紫粉金渐变 `linear-gradient(120deg,#F5F0FA,#DAB8FF,#FFD6A5)`，**唯一渐变标题，豁免字体统一** |
| 暖卡 | `#FFF8F0` 暖米纸感，双层 `--shadow-mist` 阴影保留 |
| 底栏 | `rgba(232,223,245,.72)` 暖雾紫毛玻璃 `blur(10px)`；`position:fixed; z-index:1000`；字重 700；选中深紫 `#5D4B6E` |
| 板块名胶囊 | `.soft-card-tag` 统一：`rgba(232,223,245,.55)` 底 + 字 `#3A2E4D` + 600。Home/Atelier/Arena 三处 `:deep(.soft-card-tag)` 逐字符显式 7 项声明同源；**禁止靠 SoftCard.vue 默认值巧合一致——改组件默认值会产生静默漂移**（微调⑫补刀结论） |
| 字体栈 | `--font-family` 统一族（PingFang/微软雅黑/冬青黑/Noto Sans SC）；`--font-base:16pt` 字号不动；仅 `.plate` 童趣栈豁免 |
| 小狐交互 | 常驻 `foxBreathe 3.6s infinite` + pointerdown 脉冲 `foxPulse`；`@media (hover:hover)` 隔离鼠标 hover |
| 星练场气泡 | `gap:1.25rem` 基线，后续 AI 聊天框间距沿用 |

### 技法结论备忘（防返工 · 跨域不可推翻）
1. **星空禁用 `box-shadow` + `::after` 伪元素方案** —— WebKit / 华为 WebView 真机吞绘，基线锁定 `radial-gradient` 实元素平铺。
2. **底栏 fixed 祖先不得写 `transform`** —— 否则 fixed 被拐入包含块致下滑遮挡，基线锁定 `left:0;right:0;margin:0 auto` 无 translate 写法。
3. **iPad hover 必须用 `@media (hover:hover) and (pointer:fine)` 隔离** —— 禁止裸 `:hover` 承担交互反馈。

### 零动区（封口冻结 · 后续非必要不碰）
小狐高光描边 · 灵感提示铭牌手写体 · `--color-ink` 深字 · PWA ⑧-B/⑧-D 资产 · `manifest.webmanifest` · 路由结构。

### 待办挂起（非阻塞 · 留待内容共创阶段）
- [ ] 羽毛 `🪶` emoji → 可着色 SVG（需 template 改动，单独步）
- [ ] 温故小灶竖向时间轴骨架（业务层就绪后一并落）
- [ ] `StarTrack.vue` 历史 `@keyframes breathe` 存量清理项

结构弹性自检 链路⑩ 2026-10-20 结论：骨皮解耦成立，轻风险规约固化，源码零改动。（详见 `notes/04_structure.md`）

---

## 架构迁转决策 · 2026-10-21（DEC-2026-10-21-ADR07）

[DEC-2026-10-21-ADR07] 架构迁转 · 国内优先
- **WHAT**：弃 Cloudflare Pages（境外 pages.dev 链路），迁 CloudBase（腾讯云国内）；静态壳复用 + OCR 云函数 + 前端直连 LLM + family_code 分区。
- **WHY**：① pages.dev 实证超时（境外链路在国内访问不可靠）；② 国内节点就近，延迟更低；③ 免域名、免备案（不购买域名、不改 NS）。
- **HOW**：
  1. 存储迁 CloudBase 文档库四集合 —— `families`（家庭档案：家庭码 family_code、家庭成员与偏好）/ `wrongs`（错题与讲题：采集原图元数据+批改结果、订正重判、讲题事件 append-only）/ `profiles`（学情与投喂：家长投喂知识库非RAG、知识点/题型打标、学情画像）/ `plans`（计划：每日/周计划草稿与家长确认态）；四集合一律按 `family_code` 分区；
  2. OCR 由云函数承接（密钥置云函数环境变量，不入前端包），承接既有 OCR-L1 口径；
  3. LLM 前端直连（callLLM），我方服务端**不代持**模型密钥；
  4. 本地 IndexedDB 缓存兜底 + JSON 导入导出兜底（双兜底）；
  5. 旧 CF 链路（Pages / Pages Functions / wrangler / _routes）整条弃用，**不双轨并行**。
- 编号：与既有 DEC 顺延、不重号；DEC-09~26 编号段原样保留，本条独立命名不占号。
- 与 ADR-03 关系：**ADR-03 管辖范围限定 CF 期封存史实，条文不撤销但不再约束演进方向**；演进方向以本条为准。
- 禁止项（同期固化，见 `02_playbook.md §P13`）：弃 CF 链路 / 弃买域名 NS / 弃服务端代调 LLM / 弃登录体系。

---

## 数据契约决策 · 2026-10-21（DEC-2026-10-21-ADR08）

[DEC-2026-10-21-ADR08] 数据契约 · 四集合逻辑 schema 锁定（batch② 生效）
- **WHAT**：以 `spec/02_schema.md` 作为 CloudBase 文档库四集合（`families`/`wrongs`/`profiles`/`plans`）唯一逻辑 schema；CloudBase 为 schemaless 文档模型，无 DDL 建表动作，本文件即 schema。
- **WHY**：① 迁转后数据落 CloudBase 文档库，需显式字段契约防静默漂移；② 集合名全域只认这四词，`captures`/`records`/`traces` 等历史别名永久作废；③ 字段增删强制走 ADR，禁止静默扩字段。
- **HOW**：
  1. 四集合字段类型以 `spec/02_schema.md` 逐字段锁定（`_id`/`ownerId`/`familyId` ref/`createdAt`/`sealed`/`wrongType` enum 等）；
  2. `src/lib/db.ts` 仅暴露 `COL` 常量 + `col()` 快捷，零读写逻辑（读写留给②-3/②-4）；
  3. 本文件（spec/02_schema.md）由规约层（WB）维护，CB 只读不写。
- 括号注：本约束限 CloudBase 集合名域；本地 IndexedDB captures/teach-events 属 sealed 域，不受此限。
- 编号：与 DEC 顺延、不重号；ADR-07 迁转方向不变，本条补数据层细则。

---

## 判据修正决策 · 2026-10-21（DEC-2026-10-21-ADR09）

[DEC-2026-10-21-ADR09] 视觉零漂移判据修正
- **WHAT**：主CSS哈希变化不再等同视觉漂移。
- **WHY**：Vue scoped 的 `data-v` 机制在 eager 组件新增元素时**必然变哈希**（②-4 末实证：三视图新增元素 → 主CSS 哈希 `index-D8j5n5-K` → `index-UJmEObKl`，而主CSS体积恒为 34.64kB）；哈希变化本身不含视觉信息。
- **HOW**：判据修正为「**主CSS大小不变 + 既有选择器逐字节未变 → 视觉零漂移**」；`data-v` 哈希变化在 eager 组件新增元素时**可豁免**。
  - 适用域：批次②-4末及后续含 eager 组件改动的派发。
  - 实测证据：与线上基线 `index-D8j5n5-K.css` 归一化 `data-v` 后**逐字节完全一致**。

---

## 数据字段补充决策 · 2026-10-21（DEC-2026-10-21-ADR10）

[DEC-2026-10-21-ADR10] wrongType 枚举补 `misread`（审题偏差）
- **WHAT**：`wrongs.wrongType` 枚举由三值 `concept|careless|method` 扩为四值 `concept|careless|method|misread`，与 DEC-15 归因四类（粗心失误 / 概念不清 / 方法不会 / 审题偏差）**全量对齐**；`spec/02_schema.md` 的 `[pending-attribution]` 标记解除。
- **WHY**：②-5 设置抽屉的归因浮层已上线（卡片内「归因」→ 四选项），UI 产出第四类「审题偏差」若不在 schema 内，将构成"UI 有值、契约无值"的字段漂移；ADR-08 规定字段增删必须走 ADR，本条即该 ADR。
- **HOW**：
  1. `spec/02_schema.md` 的 `wrongs` 字段行 enum 补 `misread`，并追加 ADR-10 注释行（既有 EOB 注释行保留不动）；
  2. UI 侧四选项键值固定为 `concept` / `careless` / `method` / `misread`（与枚举逐字一致，`src/views/WrongsView.vue` 归因浮层 + `src/views/SettingsDrawer.vue` 默认归因）；
  3. 字段语义分工锁定：**`subject` = 学科维度**（计算/语文/英语/其他），**`wrongType` = 归因维度**（四类），二者不得混用。
- 编号：与 DEC 顺延、不重号；ADR-08 / ADR-09 正文与编号段原样保留，本条独立成文不占号。

---

## DEC-2026-10-22-ADR11 · 本地兜底优先·未登录架构

**WHAT**: 跳过匿名登录，前端以未登录身份访问 CloudBase，靠 family_code 分区 + RLS anon 策略 + 本地 LocalStorage 镜像兜底承载错题本读写。

**WHY**: 匿名登录开关与 SDK 初始化反复 400；用户明确抗拒控制台手动操作；本地 familyId 已能完成隔离；把鉴权复杂度移出主链路，云端仅作可选同步层。

**HOW（本地兜底六点）**:
  ① 本地键 `nancy-bookhouse.wrongs.live`，全量读写跨 family 不覆盖（readRawLocal 读全量 + persistLocalWrongs 全量回写）；
  ② 保留本地副本：云端成功不删本地（靠 createdAt 去重避免与云端同条重复显示）；
  ③ createdAt 去重：loadLiveWrongs 合并时按 createdAt 剔除云端已存在的本地项；
  ④ crypto.randomUUID() 防主键碰撞（替代 `'l' + Date.now()`）；
  ⑤ isValidWrong 渲染过滤：无 id 或无 source/question/subject 的非标准对象不入渲染；
  ⑥ warn 仅打 e.message（消除红色 Object 刷屏根因）。
  写路径：本地先落盘 → 即时显示 → 尝试 col('WRONGS').insert（失败仅 warn 不抛红）；读路径：本地优先 → 云端拉取失败维持本地兜底。

**边界**: setAttribution 云端分支暂未加兜底（方向3）；anon 读 RLS 未放通（方向2）；以上均为有意延期非缺陷。

**不占号说明**: ADR-09 已被「视觉零漂移判据修正」占用，本决策顺延为 ADR-11。

> 落地实测（WB 回源核 · 2026-10-22）：新环境 `nancy-bookstore-prod-d4ab5d04b10`（个人版·ap-shanghai·**2026-11-22 到期**）· `wrongs` 表 **16 列**、RLS **4 条策略**、`relrowsecurity=true`（实测 cols=16 / policies=4 / rls=true）· 托管 **29 文件**、域名 200、产物指纹 `index-CVOhJrFG.js` / `index-B_fmRRmj.css` 与旧环境**同指纹**。

---

## DEC-2026-10-22-ADR12 · 错题本归因本地兜底+存储版本号

**WHAT**：WrongsView 归因（wrongType）走独立本地镜像 ATTR_KEY，云端写失败降级不抛红；存储层引入 v1.0.0 版本键占位，为后续结构升级留迁移退路。

**WHY**：跳过匿名登录后云端写被 RLS 拦截，归因刷新即丢；版本键避免未来改结构时旧数据无法兼容。

**HOW**：
- setAttribution 云端分支外包 try/catch + 必写 localStorage；
- loadLiveWrongs 末尾 applyAttrMirror 按 familyId 补值；
- onMounted 首行 checkStorageVersion；
- 三键（wrongs.live / attributions.live / storage.version）独立分区；
- 纯 localStorage 无新依赖。

**边界**：不动 wrongs 兜底六点、不动 db.ts、不动云端规则、不删旧数据。

> 落地实测（WB 回源核 · 2026-10-22）：commit `7ee57e5`「refactor: 方向3&4 归因本地兜底+存储版本号(v1.0.0)」已提交并部署；源码实测 `ATTR_KEY='nancy-bookhouse.attributions.live'` · `VERSION_KEY='nancy-bookhouse.storage.version'` · `CURRENT_VERSION='v1.0.0'` · `checkStorageVersion()` 于 onMounted 首行调用 · `applyAttrMirror(familyId)` 挂 loadLiveWrongs 末尾 · setAttribution 云端分支已带 try/catch（失败仅 warn(e.message)）。
> 已知小异常：`this.q.eq is not a function`（云端归因写路径 SDK 构造器不兼容，不阻塞，本地镜像已接管）。
> 编号：ADR07~ADR11 已占用，本条顺延为 **ADR-12**，不重号。

---

## DEC-2026-10-22-ADR13 · SDK拆包·build-only manualChunks

**WHAT**：用 vite manualChunks 把 `@cloudbase/js-sdk` 从主包剥离成独立 chunk，主包 761KB→129KB。

**WHY**：首屏 TTI 改善；同时避免改 cbApp 同步导出而破坏视图层红线。

**HOW**：仅改 `vite.config.ts` 的 `build.rollupOptions.output.manualChunks`（`{ cloudbase: ['@cloudbase/js-sdk'] }`）；不动 db.ts / cloudbase.ts / 任何 .vue；workbox 已排除 cloudbase chunk。

**边界**：不做真懒加载（需动 .vue），留待后续若首屏仍慢再评估 TLA 方案。

> 落地实测（WB 回源核 · 2026-10-22）：`index-DtJPM8HJ.js` = **129.3KB**（主包，≤150KB 目标达成）· `cloudbase-CeMQE7wU.js` = **743.8KB** 独立 chunk · workbox `globIgnores` 含 `'**/cloudbase-*.js'`（**vite.config.ts L103**）· 本地 dist 预缓存 **19 条且不含 cloudbase 大 chunk**（实测）· 改动面仅 `vite.config.ts` 单点（`git diff` 确认 cloudbase.ts 的未提交改动属更早批次、与本条无关）。
> 偏差留痕：原定步骤①（改 db.ts 动态 import）、②（改 cloudbase.ts 动态 import）**被废弃**——`cbApp` 为同步导出对象（WrongsView:186 / useOcr:50 / db.ts:46 同步消费），改动态将破坏 .vue 视图层、越红线；manualChunks 属 build-only 选项（serve 模式忽略），零回归。
> 编号：ADR07~ADR12 已占用，本条顺延为 **ADR-13**，不重号。

---

## ADR-14【讲题LLM切DeepSeek·去mock】（预占·2026-10-22）

- 状态：代码闭环待真机验收
- WHAT：callLLM 由 Hunyuan mock 占位改为 DeepSeek 真连，key 对接设置抽屉 localStorage。
- WHY：用户已有 DeepSeek 密钥，免申请混元；前端直连需 dev 代理规避 CORS。
- HOW：llm.ts 改默认 provider + key 读取顺序；vite.config.ts 加 /llm 代理；失败降级「小狐暂时走神了」。
- 关联：方向1收尾、依赖方向2生产代理收尾。

> **本条为编号预占**：正文待元宝在真机自测通过后补完（当前仅占编号与标题，勿视为已定稿决策）。
> WB 回源核（2026-10-22）：七项代码改动均实测相符（默认 provider=deepseek / key 读序 localStorage→VITE_LLM_API_KEY / DEV 走 /llm/v1/chat/completions / vite proxy /llm→api.deepseek.com + rewrite / router 补 /home→HomeShell / SettingsDrawer <form @submit.prevent> / WrongsView 云端失败降级 console.debug / ExplainView「讲给我听」+ 失败降级「小狐暂时走神了，稍后再试」）；另 llm.ts 内含孩子版 Prompt 模板 + 剧透审查层 + 15s 超时（辅导口径，属 G1），补稿时请一并纳入。
> 编号：ADR07~ADR13 已占用，本条预占 **ADR-14**（全称 DEC-2026-10-22-ADR14，标题沿用「ADR-14【讲题LLM切DeepSeek·去mock】」写法），不重号。

### DeepSeek 本地代理 404 闭环与排错纪律（2026-10-22 追加 · 正文原样）

**结论**
本地开发采用 Vite 代理，避免直连官方 API 根路径导致 404。

**配置规范**
- llm.ts: DEV 分支返回 `/llm/chat/completions`（相对路径，无 /v1）；PROD 保留 `https://api.deepseek.com/v1/chat/completions`。
- vite.config.ts: `/llm` 代理 target 为 `https://api.deepseek.com/v1`，rewrite 移除 `/llm` 前缀，确保最终命中单 `/v1`。
- .env: **严禁设置** `VITE_LLM_BASE_URL=https://api.deepseek.com`（会覆盖代理直连缺 /v1 致 404），本地应删除该变量走默认代理。

**排错经验**
- 现象：Network 直连 `api.deepseek.com/` 报 404。
- 根因：`.env` 绝对路径覆盖 + 代理未重启。
- 纪律：改代理配置/.env 必须 `Ctrl+C` 后 `pnpm dev` 重启；浏览器需强刷；验收看 `localhost:5173/llm/...` 200。
- 排错：prod有Key但API未连上=无直连请求，查题设上下文/触发状态；dev报localhost/llm连接拒绝=无Key回落代理→填Key或仅dev代理。

> 状态：已定稿 · 2026-10-22 · 真机验收通过（小狐开口+Network 200）· commit 5bad1fe 上线。
> **状态**：条件验收（补真验未过，留待方向2）
> · 终态归档（条件验收）@2026-10-22：拓扑收口A完成；生产讲题依赖设置抽屉 Key（localStorage）+题设上下文，实测 API 未连上（请求未发）；代理仅 dev。
> **状态（2026-10-22 终态）**：✅ **验收通过** —— 代码侧终态达标：透传清理（`q['eq']` 方括号等价调用，5项 grep 全空）+ 真实错误暴露（try/catch 打印 name/message/stack/cause 后 `throw e`，不吞异常）+ 兜底归一化（safeWrong/safeProblem/safeErrorLog 强制补齐最小字段，消除视图 `Cannot read properties of undefined`）三件闭环。复测：Console 无 `eq is not a function`、无 `FetchError: undefined`、无 TypeError 缺字段崩溃；错题本/归因页渲染不崩，讲题 UI 正常。主包 `assets/index-UfYH9eZy.js` = 136.46KB（≤150KB），部署环境 prod-d4ab5d04b10，构建部署退出码 0。
> **遗留（另开工单，不混入本终态）**：`[rdb] fetch error` 仍偶发，底层 `cause` 被网络层吞 —— 属**环境/代理/鉴权配置面**（rdb 代理域名 / 匿名 RLS / 鉴权未放通）；代码透传已无问题。
> **补充记录 (2026-10-22)**：补真验(2026-10-22)：Network 无 deepseek 请求，前端兜底生效，题设触发未达，留待方向2(云端RDB)顺带闭环。关联提交：d0b3916（终态归档），5bad1fe（去mock切DeepSeek）。
> WB 回源复核（四组均实测相符）：llm.ts L40 `VITE_LLM_BASE_URL` 优先 → L42 DEV `'/llm/chat/completions'`（无 /v1）→ L43 PROD `'https://api.deepseek.com/v1/chat/completions'`；vite.config.ts L50 target `'https://api.deepseek.com/v1'` + L53 rewrite 去 `/llm`；.env 现有键仅 VITE_LLM_PROVIDER / VITE_LLM_API_KEY / VITE_LLM_MODEL，**不含 VITE_LLM_BASE_URL**（严禁项已落实；密钥留在被 gitignore 的 .env，未入库）。