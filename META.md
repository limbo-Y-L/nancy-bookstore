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

[2026-10-21补丁·BATCH-2-6] 星轨修复双段闭环：②-6定位修复（track-inner内缩9px+节点absolute定点+progress.ts动态文案占位替换）→ ②-6.1精准外科（取消内缩改relative 100% + rail inset 10px + 节点16px + calc定点left:10px/calc(100%-10px)），消除首尾节点圆心与轨道线端点9px偏差。新建src/lib/progress.ts(69行)·getProgress/setProgress·mock读localStorage(nancy_progress)·live动态import db查col('PLANS')·wireState守门。BUILD_EXIT=0·主CSS 34820B(+103B)·tcb deploy DEPLOY_EXIT=0·哈希index-brpbXruF.css。commit f093ab7推origin main。视觉验收通过。

[2026-10-22补丁·BATCH-2-LOCAL-FALLBACK] 错题本本地兜底闭环：新环境 nancy-bookstore-prod-d4ab5d04b10（个人版·ap-shanghai·2026-11-22到期）建好，wrongs表16列+RLS4条落地（实测 cols=16/policies=4/rls=true）；cloudbase.ts跳过匿名登录（initCloudBase=Promise.resolve()），未登录身份走anon RLS+family_id隔离；WrongsView.vue加固——全量写回跨family不覆盖、保留本地副本、createdAt去重、crypto.randomUUID()防碰撞、isValidWrong渲染过滤、warn仅打e.message（消除红色Object刷屏根因）。本地pnpm dev全绿，pnpm build + tcb hosting deploy dist由用户手动部署成功，线上托管域名验收通过（记一题/强刷不丢/无红字；线上产物指纹与本地一致 index-CVOhJrFG.js / index-B_fmRRmj.css）。云端FetchError由本地兜底接管属预期，默认域名强制下载为平台策略非Bug。红线：未动db.ts的family_id注入、未自动build/commit/deploy。〔口径校正·WB回源实证：①调试console.log并未清空——src内仍留3处console.log（全在cloudbase.ts：env打印/跳过匿名登录/rdb探针成功）+6处console.warn（export.ts1、ExplainView1、ProgressView1、WrongsView3）+2处console.error（rdb致命探针）；②应用托管在旧环境域名 d3fnn33i4766c7dc-1511708160（200），新环境自有托管域名仅6个平台系统文件、根路径404 → 壳与数据分属两环境，非同一环境〕

[2026-10-22补丁·DEPLOY-STATUS] ②-4.5之后实际交付修正：线上壳非mock态而是本地兜底真读写态；**wireState='live'**（G2已放行 @ef6baf1「ADR-07 family_id隔离替代匿名登录，放G2闸门」），mock仅存于 callLLM 占位与未开通云端鉴权场景；wrongs读写走 col('WRONGS')+本地镜像双轨。git提交与tcb部署均由用户手动执行，元宝未代跑。

[2026-10-22补丁·BATCH-2-LOCAL-FALLBACK-v2] 错题本本地兜底闭环（校正版）：
新环境 nancy-bookstore-prod-d4ab5d04b10(ap-shanghai)建好，wrongs表16列+RLS4条(rls=true)落地；
cloudbase.ts跳过匿名登录(initCloudBase=Promise.resolve())，未登录身份走anon RLS+family_id隔离；
WrongsView.vue六点加固全命中：本地键 nancy-bookhouse.wrongs.live、全量读写跨family不覆盖、createdAt去重、crypto.randomUUID()防碰撞、isValidWrong渲染过滤、warn仅打e.message（红色Object刷屏根因消除）。
日志口径：WrongsView内业务调试log已清；基础设施探针保留(cloudbase.ts 3处console.log、全局6处warn、2处error)，非清理范围。
主链 wireState='live'（G2闸门 ef6baf1 已放），mock仅callLLM占位；错题本读写走 col('WRONGS')+本地镜像双轨。
setAttribution云端分支无try/catch，留待方向3。
本地 pnpm dev 全绿；pnpm build 产物指纹 index-CVOhJrFG.js / index-B_fmRRmj.css 与两次托管部署完全一致。

[2026-10-22补丁·DEPLOY-TOPO] 托管拓扑校正（2026-10-22 终端实证）：
- 旧环境 d3fnn33i4766c7dc：首批推壳，托管产物完整，域名 nancy-bookstore-d3fnn33i4766c7dc-1511708160.tcloudbaseapp.com 可访问（偶发平台下载策略）。
- 新环境 nancy-bookstore-prod-d4ab5d04b10：数据表 + 托管壳**均已就位**。终端 tcb hosting deploy dist 成功上传16文件（含 index.html、WrongsView 等），新托管域名 nancy-bookstore-prod-d4ab5d04b10-1511708160.tcloudbaseapp.com 具备完整应用产物。此前"新环境根路径404/仅6平台文件"为误判，以本次终端打勾为准。
- 当前态：双环境同指纹壳并存，数据统一打新环境。旧环境进入归档态，不再接受新部署。
- 默认域名 *.tcloudbaseapp.com 强制下载/中间页为平台策略，非代码Bug；正式分享需绑备案自定义域名（方向2.5）。

[2026-10-22补丁·ENV-EXPIRY] 新环境个人版到期日 2026-11-22，距今约一个月。到期前需用户手控续费或迁移，元宝不代操作（D1）。

[2026-10-22补丁·DIR3+4-CLOSED] 方向3归因本地兜底 + 方向4存储版本号 双闭环（commit 7ee57e5「refactor: 方向3&4 归因本地兜底+存储版本号(v1.0.0)」·src已提交并部署，本补丁仅补文档归档）：
- 方向3：WrongsView 归因（wrongType）走独立本地镜像 ATTR_KEY=`nancy-bookhouse.attributions.live`（按 familyId 分区，结构 { wrongId, wrongType, updatedAt }，wrongId 去重）；setAttribution 云端分支外包 try/catch（失败仅 warn(e.message) 不抛红）→ 内存即时显示 → persistAttr 本地持久化；loadLiveWrongs 末尾 applyAttrMirror(familyId) 按分区补值（云端无值从本地补）。
- 方向4：独立版本键 VERSION_KEY=`nancy-bookhouse.storage.version`、CURRENT_VERSION='v1.0.0'；onMounted 首行 checkStorageVersion() 校验并首次写入；不改 wrongs 数据结构、不删旧数据。
- 方向2（云端anon读）✅ 已放通：PG 侧 wrongs 仅存 1 条策略 `wrongs_select_all`（SELECT，roles={anon,authenticated}，USING true）；写操作无对应策略 → RLS 默认拒绝，由本地兜底接管。
- 边界：不动错题兜底六点、不动 db.ts、不动云端规则、不删旧数据；三键（wrongs.live / attributions.live / storage.version）独立分区，纯 localStorage 零新依赖。
- 已知小异常：`this.q.eq is not a function`（云端归因写路径 SDK 构造器不兼容，不阻塞，本地镜像已接管）。

[2026-10-22补丁·BATCH-5-SDK-SPLIT] 方向5 SDK拆包闭环：
- 目标主包 ≤150KB 达成：build 后 index-DtJPM8HJ.js = 129.3KB，cloudbase-CeMQE7wU.js = 743.8KB 独立 chunk。
- 最小侵入做法：仅改 vite.config.ts，新增 build.rollupOptions.output.manualChunks: { cloudbase: ['@cloudbase/js-sdk'] }。
- 偏差说明：原步骤①改 db.ts、步骤②改 cloudbase.ts 动态 import 被废弃——因 cbApp 是同步导出对象（WrongsView:186 / useOcr:50 / db.ts:46 同步消费），改动态会破坏 .vue 视图层，越红线。manualChunks 是 build-only 选项，serve 模式忽略，零回归。
- workbox globIgnores 已含 '**/cloudbase-*.js'（vite.config.ts L103），无需再改。
- 红线：未动 .vue / db.ts col()护栏 / cloudbase.ts 跳过逻辑 / RLS / 兜底六点 / 三键。未 commit / 未 deploy。
- 构建：pnpm build 退出码0，106 modules transformed，PWA generateSW 正常，precache 19 entries (198.83KiB) 不含大 chunk。〔WB 回源复核：主包 129.3KB / cloudbase chunk 743.8KB / 预缓存 19 条且不含 cloudbase chunk，三项均实测相符；workbox 排除行实际在 vite.config.ts L103（新增 manualChunks 块后行号后移）〕

[2026-10-22补丁·LLM-DEEPSEEK] 讲题LLM切DeepSeek + 控制台清理（方向1收尾，关联ADR-14预占）：
- 背景：真实LLM入口为 ExplainView.vue「讲给我听」；TeachView「要讲/说完了」为零网络苏格拉底流不调LLM。原 llm.ts 默认 Hunyuan 且未读设置抽屉 localStorage，致空key→401→本地兜底。
- 代码侧改动（CB已执行，build/lint通过，未提交）：
· src/lib/llm.ts：默认provider=deepseek；key优先localStorage['nancy-bookhouse.apiKey']回退VITE_LLM_API_KEY；dev走/llm代理。
· vite.config.ts：server.proxy加 /llm→https://api.deepseek.com（仅dev，需重启）。
· src/views/WrongsView.vue：云端读写best-effort降级console.debug（保留本地兜底，待方向2）。
· src/router/index.ts：补 /home→HomeShell，消路由警告。
· src/views/SettingsDrawer.vue：API Key输入框外包<form @submit.prevent/>。
- 边界：/llm代理仅dev生效，生产CORS需自备后端（方向2收尾）；db.ts rdb链式API不符CloudBase实际属方向2，本次不动。
- 状态：未commit、未push、未deploy；自测待用户点「讲给我听」验 Network 200。
- 红线：未动 .vue 业务守门、未动 db.ts、未自动构建发布。
〔WB 回源复核：llm.ts 默认 provider='deepseek'、key 读取顺序 localStorage→VITE_LLM_API_KEY、DEV 分支走 '/llm/v1/chat/completions'；vite.config.ts L46-53 proxy /llm→api.deepseek.com + rewrite；router L20 补 /home→HomeShell；SettingsDrawer L147 <form @submit.prevent>；WrongsView L197/L290 云端失败降级 console.debug；ExplainView L51 调 callLLM、L54 失败降级「小狐暂时走神了，稍后再试」、L81 按钮「讲给我听」——七项均实测相符。
另注（你这批文本未提但代码已落地，属辅导口径 G1，建议归档留痕）：llm.ts 内另含 **孩子版 Prompt 模板**（只讲思路/知识点/常见陷阱·绝不告诉答案·讲完抛一个引导问题）+ **剧透审查层**（命中「答案+是」且带选项字母或数字时降级为引导文案）+ **15s 超时**（AbortController）。这三条是本次「去 mock」的实际内容，不止换 provider。〕

[2026-10-22补丁·LLM-PROXY-404] ADR-14 正文归档：DeepSeek 本地代理 404 闭环与排错纪律（预占转正，内容原样如下）
### 结论
本地开发采用 Vite 代理，避免直连官方 API 根路径导致 404。
### 配置规范
- llm.ts: DEV 分支返回 `/llm/chat/completions`（相对路径，无 /v1）；PROD 保留 `https://api.deepseek.com/v1/chat/completions`。
- vite.config.ts: `/llm` 代理 target 为 `https://api.deepseek.com/v1`，rewrite 移除 `/llm` 前缀，确保最终命中单 `/v1`。
- .env: **严禁设置** `VITE_LLM_BASE_URL=https://api.deepseek.com`（会覆盖代理直连缺 /v1 致 404），本地应删除该变量走默认代理。
### 排错经验
- 现象：Network 直连 `api.deepseek.com/` 报 404。
- 根因：`.env` 绝对路径覆盖 + 代理未重启。
- 纪律：改代理配置/.env 必须 `Ctrl+C` 后 `pnpm dev` 重启；浏览器需强刷；验收看 `localhost:5173/llm/...` 200。
〔WB 回源复核（四组均实测相符）：llm.ts L40 `getEnv('VITE_LLM_BASE_URL') ||` 优先 → L42 DEV `'/llm/chat/completions'`（无 /v1）→ L43 PROD `'https://api.deepseek.com/v1/chat/completions'`；vite.config.ts L50 target `'https://api.deepseek.com/v1'` + L53 rewrite `p.replace(/^\/llm/, '')` → 最终命中单 `/v1`；.env 现有键仅 VITE_LLM_PROVIDER / VITE_LLM_API_KEY / VITE_LLM_MODEL，**不含 VITE_LLM_BASE_URL**（严禁项已落实，密钥留在被 gitignore 的 .env 内未入库）。ADR-14 正文同步落 notes/00_decisions.md。〕

[2026-10-22补丁·DEPLOY-TOPO-FINAL] 新环境 nancy-bookstore-prod-d4ab5d04b10 全量承载：终端 tcb hosting deploy dist 成功上传 **29 文件**（含 index.html、WrongsView 等），产物指纹 index-CVOhJrFG.js / index-B_fmRRmj.css（12:22 同指纹部署）。旧环境 d3fnn33i4766c7dc 进入归档态，不再接受新部署；壳与数据统一打新环境。双环境同指纹壳并存。

[2026-10-22补丁·ENV-EXPIRY-FINAL] 新环境个人版到期日 **2026-11-22**，距今约一个月；到期前需用户手控续费或迁移（D1 元宝不代操作）。

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
  ⑬ 架构迁转 ──────────────── ▶ 进行中 2026-10-22 更新：
     错题本本地兜底六点全绿（见 ADR-11）：本地键 nancy-bookhouse.wrongs.live 全量读写跨family不覆盖 / 保留本地副本 / createdAt去重 / crypto.randomUUID()防碰撞 / isValidWrong渲染过滤 / warn仅打e.message。
     新环境 nancy-bookstore-prod-d4ab5d04b10 29文件同指纹（12:22）全量承载壳+数据，旧环境 d3fnn33i4766c7dc 归档。
     匿名登录跳过（initCloudBase=Promise.resolve()）；wireState='live'；云端anon读已放通（方向2 ✅，仅 SELECT 策略；写由 RLS 默认拒绝、本地兜底接管）。
     到期提醒：新环境 2026-11-22 到期。
     方向2/3/4 已闭环上线（见 DIR3+4-CLOSED 补丁），方向5（SDK拆包·主包129KB）✅闭环；剩余方向2.5挂起。
  2026-10-21 批次②-3 收束 @d976f40：src/lib/llm.ts(callLLM mock骨架,wireState='mock') + src/lib/sync.ts(probe四集合成对add/remove静默零残留) + ADR-08补注消歧 + db.ts col() key-only签名护栏标为有意设计
  2026-10-22 托管拓扑：双环境同指纹壳并存 · 数据统一打 nancy-bookstore-prod-d4ab5d04b10 · 详见 DEPLOY-TOPO 补丁

▸ 演进路标（仅锚方向，子阶段留白）
  二期 · 口语伴读/自适应出题/深度学情/习作 · 温故小灶六节点串行（🟡挂起非阻塞）
  三期 · 长陪伴深化（初高中衔接）远期锚，不预设

▸ 后续方向状态（2026-10-22 · 迁转⑬ 收口口径）
  方向2 · 通云端（anon 读放通）✅ 闭环
  方向3 · 归因本地兜底 ✅ 闭环（本补丁）
  方向4 · 存储版本号 ✅ 闭环（本补丁）
  方向5 · SDK拆包（manualChunks 单点，主包129KB）✅ 闭环
  方向2.5 · 绑自定义域名 ⏸ 挂起（需备案域名）

════════════════════════════════════════════════════════════

§C 下一步（当前真实待办 · 迁转⑬主线）

近项① 批次① 底座通：CloudBase环境建好取环境ID → 静态壳推上出 *.tcloudbaseapp.com 链接 → ocr云函数迁入三档逻辑跑通（环境ID与托管域名已实测落定，见§B⑬） ✅闭环2026-10-21（环境/推壳/规约锁/OCR mock骨架/仓库卫生）
近项② 批次② 核心闭环：✅全绿闭环（含②-4三视图/②-5设置抽屉/②-6星轨/错题本本地兜底/方向2通云端/方向3归因兜底/方向4版本号占位）。
近项③ 旧链路清账：旧环境 d3fnn33i4766c7dc 标记归档，不再接受部署；functions/ 实装退役、wrangler/_routes 作废留待手清。
后续可拾（用户拍板不答题）：
  方向5 · SDK拆包 ✅ 闭环（manualChunks单点拆包，不懒加载）
  方向2.5 · 绑自定义域名 ⏸（需备案域名）
  （方向2/3/4 已闭环，见 DIR3+4-CLOSED 补丁）
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
ADR-14【讲题LLM切DeepSeek·去mock·代理404闭环·2026-10-22】WHAT callLLM由Hunyuan mock占位改DeepSeek真连+key对接设置抽屉localStorage · WHY 用户已有DeepSeek密钥免申请混元+前端直连需dev代理规避CORS · HOW llm.ts改默认provider与key读取顺序(DEV /llm/chat/completions无/v1·PROD保留/v1)+vite.config.ts加/llm代理(target带/v1·rewrite去前缀)+失败降级「小狐暂时走神了」；404根因=.env绝对路径覆盖+代理未重启·纪律=改配置必须Ctrl+C重启dev+浏览器强刷+验localhost:5173/llm/... 200（详见notes/00_decisions ADR-14 与本文件 LLM-PROXY-404 补丁）

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