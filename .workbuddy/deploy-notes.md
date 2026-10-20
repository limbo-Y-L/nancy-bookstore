# 部署备忘 · Cloudflare Pages

> status: draft · 2026-10-20 建立
> 用途：CF Pages 项目侧配置清单。**本文件不含任何密钥值**，只列 Dashboard 手填的变量名。
> append-only 语义：追加为主，不重写既有段。

## 平台与构建配置（Dashboard「构建设置」填）

```yaml
platform: cloudflare-pages
framework_preset: none          # 自带 vite.config.ts，不让 CF 接管构建
build_command: pnpm build
output_directory: dist
root_directory: /
functions_directory: functions  # 已原位就位，零搬迁
```

- `functions_directory` 指向仓库内 `functions/`（CF Pages 原生约定），**不做任何搬迁或改名**。
- `output_directory: dist` 与 `vite build` 默认产物目录一致。
- 构建命令用 `pnpm build`（`vue-tsc -b && vite build`），保证类型检查随构建走。

## 生产分支（Dashboard「Git」段）

```yaml
production_branch: main    # ✅ 已确认：本地 git branch -M main，初始提交 b1e163d
preview_branch: none       # 一期不做预览环境，每推即上线
```

> 核验备注（2026-10-20 更新）：本工程**已完成 git 初始化并推远端**（GitHub Public 空仓，无 README/.gitignore/license 以避免首次推送冲突）。
> 首次推送经 Git Credential Manager 授权（Authorize git-ecosystem）成功。
> 建 CF Pages 项目时 `production_branch` 直接填 `main` 即可。

## 环境变量（Dashboard → Settings → Environment variables）

**只在 Dashboard 手填，只登记变量名，任何值绝不进仓库。**

| 变量名 | 用途 | 值来源 |
|---|---|---|
| `TENCENT_OCR_SECRET_ID` | Edge Function 调腾讯云极速 OCR | 腾讯云控制台 |
| `TENCENT_OCR_SECRET_KEY` | 同上 | 腾讯云控制台 |

- 作用域选 **Production**（一期无 Preview 环境）。
- 读取方：`functions/api/ocr.ts` 通过 `context.env` 取，**前端 `src/**` 零命中**（已核验）。
- 缺任一变量时 Edge 返回 `{kind:'ocr-stub-fallback', reason:'no-credential'}`，前端静默回落桩，**不白屏**。

## 域名

```yaml
custom_domain: none   # 明确延后，不阻塞上线
```

- 首次上线使用 CF 自动分配的 `*.pages.dev` 子域。
- 自定义域名 + DNS 记录**另立单**，本期不建。

## 静态/动态分工（已落盘，仅备查）

`functions/_routes.json` 为唯一声明源，build 时由 `vite.config.ts` 的零依赖插件（`node:fs` + `closeBundle`）逐字节拷入 `dist/_routes.json`：

- `include: ["/*"]` —— 全部请求进 Functions 层
- `exclude` —— `sw.js` / `workbox-*` / `registerSW.js` / `manifest.webmanifest` / `assets/*` / 图标 / `_routes.json` 直连静态资产
- `/api/*` 保留在 `include` 内以命中 Edge Function

PWA 侧预缓存边界在 `vite.config.ts` 的 `workbox.globPatterns` / `globIgnores`（**非** `include`/`exclude` —— 后者在 generateSW 策略下不适用，属 webpack 管线专用，TS 会报 TS2353）。

## 上线后真机校验清单（部署完成再跑）

- [ ] `*.pages.dev` 直开首页，欢迎语正常显示、无白屏
- [ ] Pad 竖屏底栏三键渲染正常、无黑条
- [ ] 离线二次打开可壳启动（SW 命中）
- [ ] `/api/ocr` 404 或未配密钥时**静默回落桩**，页面不崩（OCR-L1 六分支保障）
- [ ] DevTools Network 确认无对 `ocr.tencentcloudapi.com` 的浏览器直连请求

## 构建基线（上线前对照）

```
vue-tsc -b   → 0 错
vite build   → ✓ 72 modules transformed · built in ~4.8s
CSS          → 34.64 kB │ gzip 5.30 kB
JS           → 124.36 kB │ gzip 48.22 kB
PWA          → generateSW · precache 8 entries (156.10 KiB)
dist 产物    → index.html / manifest.webmanifest / sw.js / workbox-*.js
               registerSW.js / assets/ / 4 图标 / _routes.json
```