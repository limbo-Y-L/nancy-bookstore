# META.md · 元宝认知底稿（回血源）
> 本文件根目录独立存放，不归属 .workbuddy/ 不归属 .codebuddy/，不append任何rules。
> 回血：新窗「续上」→ 用户全文粘贴本文件 → 元宝满血。
> 蒸馏源：02_playbook.md · 03_context.md · notes/* · spec/* ；单向蒸馏，不反向覆写源。

════════════════════════════════════════════════════════════

【置顶】纪律总锚（强制约束，最先读）

PH-0 元宝本窗永不直写磁盘；落盘全部出 `→粘WB` 文本交用户转WB。
PH-1 非用户明文「给我全文我手动存」绝不主动落盘。
PH-2 小结论举手快照，用户「做」才出，「先不记」不强制。
PH-3 全大白话，术语先人话翻译。
PH-4 推演标「推演·未拍」，不当拍板。

D1 push/发布用户手控，工具不代外部后果
D2 DEP锁Cloudflare Pages不复议
D3 口令随意，元宝兜底不反推
D4 找文件WB自动化
D5 记忆靠本文件磁盘载体，不赌窗口
D6 恢复完整级，拒缩略卡
D7 单文档归并，拒散落
D8 有意设计永久锁（TCH单题消费等）
D9 源文件append不覆写，sealed不动
D10 一句「续上」+粘贴即满血

【补丁追加区】执行中新追加约束按日期戳append于此，不覆写上方。

[2026-10-20补丁·PH-tech] 技术侧议题（构建/部署/路由/依赖/环境变量/src取舍/agent派发技术判定），元宝直出明确主张并同步一句取舍理由；禁止裸陈列多选项交用户自选拍板。用户零技术前置门槛，仅做方向认受（认/调/否）。与PH-4并存：非技术题守PH-4，技术题优先本则。

[2026-10-21补丁·FUNC-PROBE] 新增functions/api/ping.js探针；ocr.ts(166行)实装保留不动；_routes.json现状保留；探针用于观测Runtime激活态，零破坏。WB回源复核实证ADR-00纪律，修正前序误判。与ADR-01/03同源。

[2026-10-21补丁·FUNC-PROBE-v2] ping.js升级双探：hasOcrSecret对齐ocr.ts主链TENCENT_OCR_SECRET_ID，hasLegacySecret兼容观测；排错可观测性增强；ocr.ts实装链零侵入。

[2026-10-21补丁·DOMESTIC-PRIORITY] 底座迁转：弃 Cloudflare Pages 迁 CloudBase（国内优先）；理由：pages.dev 实证超时、国内节点就近、免域名免备案。同源 DEC-2026-10-21-ADR07。存储四集合（families / wrongs / profiles / plans）+ 家庭码 family_code 分区 + callLLM 前端直连 + 本地缓存兜底（IndexedDB + JSON 导入导出）。禁止项四条：弃CF链路 / 弃买域名NS / 弃服务端代调LLM / 弃登录体系。纪律口径校正：D2「DEP锁Cloudflare Pages不复议」**管辖范围限定为 CF 期封存史实，条文不撤销但不再约束演进方向**（演进方向以 ADR-07 为准）。交付节奏按三批（①底座通 ②核心闭环 ③规划打磨），用户只拍板不答题（承 playbook §P11/§P14）。

[2026-10-21补丁·SCHEMA-DOMAIN] ADR-08消歧落地：CloudBase集合名域与本地IndexedDB sealed域分野明确；col()仅收keyof typeof COL（不收裸值）属有意类型护栏，非坑。同步纠正派发回显中『需去控制台点建集合』之误判×3次——schemaless文档模型首次add()自动建集合，无需手点。

[2026-10-21补丁·BATCH-2-4.5] wrongs集合补subject字段(学科维度) wrongType归归因流程 pending-attribution; workbox排除cloudbase-*.js; 三视图全量替换

[2026-10-21补丁·DEPLOY-EOB] ②-4全系上线：tcb hosting deploy dist 推壳成功(19文件), 线上运行②-4.5 mock态; git push origin main 11提交全同步(ahead 0); PWA precache 14/176.72KiB 生产验证; 旧哈希BG2KYkCA留待下次--safe --prune清; wireState='mock'守门云端零数据; 真机冒烟待执行。

[2026-10-21补丁·BATCH-2-5-PREP] ②-5设置抽屉前置锚：familyId:f_pending占位确认归本批; 归因UI(wrongType四类)归②-5; G2闸门独立不并入; SDK chunk 761kB瘦身记独立步。

[2026-10-21补丁·BATCH-2-5] 设置抽屉五区落位：家庭码8位(仅localStorage·替代登录体系) / API Key(仅localStorage) / 归因四选项(ADR-10补misread·与DEC-15归因四类全量对齐) / 错题JSON导出(本地镜像·real分支按familyId分区) / 关闭(ESC+按钮)。设置入口改⚙️(与家长态🪶解绑)，底栏三键零动、入口为底栏区上方浮动钮。守门：wireState='mock'期间全链路零col()真读写；主CSS 34,644B零漂移。

[2026-10-21补丁·BATCH-2-4] 批次②-4收口：三视图(Wrongs/Explain/Progress)由mock本地态换线至 col('WRONGS') 真读写，单开关 useMock=wireState==='mock' 守门、mock分支保留可零成本回滚；wireState仍'mock'(G2未放)仅标G2-pending；AtelierView内容区加「错题簿→」#/wrongs入口(底栏零动)；三视图🪶统一 tabindex+click+enter→router.back()；主CSS哈希 index-D8j5n5-K 零漂移铁证。

════════════════════════════════════════════════════════════

§A 项目背景 · 全局愿景层（跨迭代稳定）

《Nancy的奇妙书屋》小初高渐进式家庭伴学；9岁女孩武汉·东湖高新（光谷）公立三年级；
Web+PWA壳Pad竖屏优先/手机并重/电脑兜底；全局聊天窗双态；小狐IP锁定；
长陪伴锚至高中；非公网非商业化非刷题非RAG；受众R1家长编排·R2孩子执行·R3不建模。
分期：MVP一期闭环 / V1.1口语+自适应 / V1.2习作 / 远期初高中。

════════════════════════════════════════════════════════════

§B 链路全景 · 阶段树（真实态 2026-10-21 · 封口基线 + 迁转⑬进行中）

▸ 方法论轴①~⑤（怎么做事）
  ① 地基宪法 ────────────── ✓ DEC-09~26总锚封
  ② 业务规约 ────────────── ✓ 线框索引+spec成文，阶段A封口
  ③ 技术实现 ────────────── ✓ 封存（hash三路由无白屏深度≤2）
  ④ N2视觉精绘 ──────────── ✓ 三视图全封口
  ⑤ 交付验收 ────────────── ✓ 全绿通过
▸ 内容层轴⑥⑦（做了什么）
  ⑥ 内容层 ──────────────── ✓ 工坊/星练/首页风线索闭环
  ⑦-₀铭牌+⑦-A小狐呼吸 ─── ✓ 全封口（.35/.85/.6s零keyframes零JS）
  ⑨ 视觉精修「夜读纸窗」── ✓ 全封口2026-10-20（微调⑫胶囊三处显式同源）
▸ 主链实装⑫（黄金路径）
  CAP-01→REV-01→REV-02→REV-03→TCH-01→PAR-01 全 impl-done @3463d76
  OCR-L1真源切片 ✓ · DEP CF锁定 ✓（ADR-03 限定为 CF 期封存史实，不约束演进方向） · git主链封口归零 ✓
  v1.0-nancy-bookhouse 封档无欠账。
  ⑬ 架构迁转 ──────────────── ▶ 进行中 2026-10-21（CF → CloudBase · DEC-2026-10-21-ADR07）
     四集合（families / wrongs / profiles / plans）+ family_code 分区 + callLLM 直连 + 本地缓存兜底；封存态保留不回溯
     实测托管域名 https://nancy-bookstore-d3fnn33i4766c7dc-1511708160.tcloudbaseapp.com（2026-10-21 推壳首发·冒烟200）
  2026-10-21 批次②-3 收束 @d976f40：src/lib/llm.ts(callLLM mock骨架,wireState='mock') + src/lib/sync.ts(probe四集合成对add/remove静默零残留) + ADR-08补注消歧 + db.ts col() key-only签名护栏标为有意设计

▸ 演进路标（仅锚方向，子阶段留白）
  二期 · 口语伴读/自适应出题/深度学情/习作 · 温故小灶六节点串行（🟡挂起非阻塞）
  三期 · 长陪伴深化（初高中衔接）远期锚，不预设

════════════════════════════════════════════════════════════

§C 下一步（当前真实待办 · 迁转⑬主线）

近项① 批次① 底座通：CloudBase环境建好取环境ID → 静态壳推上出 *.tcloudbaseapp.com 链接 → ocr云函数迁入三档逻辑跑通（环境ID与托管域名已实测落定，见§B⑬） ✅闭环2026-10-21（环境/推壳/规约锁/OCR mock骨架/仓库卫生）
近项② 批次② 核心闭环：四集合契约+db锚点+callLLM mock骨架+sync探针 ✅已落 ⏳待：②-6清账（②-4三页接通 ✅ / ②-5设置抽屉 ✅）
近项③ 旧链路清账：functions/ 实装退役、wrangler/_routes 口径作废、CF Dashboard 项目与密钥处置
说明：封存态保留（v1.0 基线不回溯）；迁转⑬进行中；用户只拍板不答题；元宝不抢跑。

════════════════════════════════════════════════════════════

§D ADR册（WHAT·WHY·HOW，编号锁定）

ADR-00【文档与源码同源·元纪律】摘要/记忆里的「已完成」须回源码核对；四次实证：铭牌误记/参数误记/胶囊口径/摘要超前。
ADR-01 OCR取文本层非理解层；judgeStub本地 · WHY防云端伪造教育语义 · HOW Edge唯一持密钥零SDK
ADR-02 六分支HTTP200静默回落mock · WHY儿童体验不暴露异常 · HOW state恒empty中性占位
ADR-03 DEP锁CF不复议 · WHY授权固化+构建实证 · HOW functions原位_routes自拷（管辖范围限定为 CF 期封存史实，条文不撤销但不再约束演进方向）
ADR-04 TCH单题消费=有意设计非缺陷 · WHY三段式单题闭环结构 · HOW永久备忘D8锁
ADR-05 append-only不覆写 · WHY审计可追溯 · HOW sealed段不动
ADR-06 讲题内容隔离独立页 · WHY DEC-16二审时间解耦 · HOW replace('/home')无堆叠
ADR-07 架构迁转国内优先 · WHAT弃CF迁CloudBase · WHY pages.dev实证超时/国内节点顺/免域名免备案 · HOW 静态壳复用+ocr云函数+前端直连LLM+family_code分区（ADR-03 限定为CF期封存史实，不约束演进方向）
ADR-08【数据契约·集合命名域锁定·2026-10-21】WHAT四集合逻辑schema锁定(families/wrongs/profiles/plans)+db.ts col() key-only签名护栏 · WHY 编译期拦拼错集合名+历史别名captures/records永久作废 · HOW spec/02_schema.md成文；括号注：本约束限CloudBase集合名域，本地IndexedDB captures/teach-events属sealed域不受此限

════════════════════════════════════════════════════════════

§E 文档拓扑（三层单向）

L0 元宝私域 ── 本文件 META.md（根目录，蒸馏视图）
        ↑单向吸收
L1 共享源层 ── 02_playbook · 03_context · notes/00_decisions · notes/01_wireframes
              · notes/02_voice · notes/04_structure · spec/01_mvp · deploy-notes · assets/
L2 agent自治 ── .workbuddy/memory/* · .codebuddy/rules.md （元宝零读零写零侵入）
流向：源→META单向；META↛源；L2互不串。
notes编号现状：00/01/02/04四册在，03空缺（有意留空非遗漏）。

**【执行纪律 · 硬规则】** 回血/规整/存档任一口令 → L1源层（02_playbook / 03_context / notes/* / spec/*）与 L0 META **同一次输出、同一次落盘**；禁止先 META 后源层、禁止分批。对外呈现必须一次给全。

════════════════════════════════════════════════════════════

§F 多agent协作（三角权责+已实证派发闭环）

| 角色 | 权责 | 禁区 |
|---|---|---|
| 元宝 | 总指挥·出题·验收唯一裁判 | 永不直写盘 |
| WB | 文档规约落盘执行 | 不碰src |
| CB | src代码执行 | 不触规约域 |
破例备案：2026-10-19 22:49/23:12链路⑨微调两轮，用户显式转派WB代跑src，属显式破例非常态，不推翻基线。
派发闭环：元宝出包→WB规约锚转译→CB执行→WB独立复核(build+md-touch+grep)→回显用户转元宝§P10对账。

════════════════════════════════════════════════════════════

§G 存档SOP（口令：存档/落一下）

①元宝对话内拓扑判定→出`→粘WB`文本 ②用户转WB ③WB执行回显
④**用户手工把回显粘回本窗** ⑤元宝§P10复核
漂移校准：说「飘了/校准」→重贴03_context+02_playbook源层刷新。

════════════════════════════════════════════════════════════

§H 链路播报规约（playbook补丁C）

每轮首条独立成块置顶：
🧭总图 ①~⑤方法论 / ⑥⑦内容层分层标注不混读
📍当前链路 📍阶段 📍步序 📍闸门
新窗/换话题/暂停再回 三场景重播，不藏段落。

════════════════════════════════════════════════════════════

§I 协作者画像

Windows；CodeBuddy CN（非VS Code未装）；git不熟不勉强；
部署授权已固化交元宝；不想组织措辞元宝兜底。
迁转期画像（2026-10-21）：用户零技术门槛，只做方向认受与✅/❓拍板，不答题；
技术判定由总指挥直出主张+一句理由；不代买域名、不代改NS、不代建登录体系；
CF Dashboard 与云控制台手填项一律用户手控（D1）。

════════════════════════════════════════════════════════════

§J 术语+冻结备忘+调性红线

封口=git封链 · 归零=status空 · 三位一体=文档+本地+远端 · sealed=不可动
有意设计=收敛取舍非bug · 推演·未拍=未拍板不冒充结论
视觉冻结五技法（链路⑨，跨域不可推翻）：
 ①星空radial-gradient禁用box-shadow+::after ②底栏fixed无translate
 ③iPad hover须@media(hover:hover)隔离 ④胶囊三处:deep(.soft-card-tag)7项显式同源禁靠默认值
 ⑤零动区：小狐高光/铭牌手写/--color-ink深字/PWA资产/路由结构冻结
文案调性红线（notes/02_voice）：温留不真四字诀；禁用「小朋友」「宝贝」；
欢迎语/铭牌禁用感叹号；正文禁用「奇妙」（仅项目名可用）；主句≤18字整句≤32字。