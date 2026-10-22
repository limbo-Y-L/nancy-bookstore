import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// 项目根目录（vite.config.ts 所在目录），用于定位 functions/_routes.json 与 dist。
const projectRoot = dirname(fileURLToPath(import.meta.url))

/**
 * Cloudflare Pages 路由声明搬运（零依赖）。
 *
 * 背景：CF Pages 只要存在 functions/ 目录，同域下所有请求都会先进 Functions 层。
 * 若不声明 _routes.json，Service Worker 与 /api/* 会互相干扰。
 * functions/_routes.json 是唯一的声明源文件，但 CF Pages 读取的是**构建产物目录**，
 * 因此 build 结束后需把它逐字节拷贝进 dist/。
 *
 * 语义：include:["/*"] 让全部请求进 Functions 层；exclude 让 PWA 壳
 * （sw.js / workbox-* / registerSW.js / manifest.webmanifest）与图标、/assets/*
 * 直连静态资产，/api/* 保留在 include 内以命中 Edge Function。
 *
 * _routes.json 本身是严格合法 JSON（JSON 不支持注释，故意图说明只写在此处）。
 */
function cfPagesRoutesManifest(): Plugin {
  return {
    name: 'cf-pages-routes-manifest',
    apply: 'build',
    closeBundle() {
      const source = resolve(projectRoot, 'functions/_routes.json')
      const target = resolve(projectRoot, 'dist/_routes.json')
      mkdirSync(dirname(target), { recursive: true })
      copyFileSync(source, target)
    }
  }
}

// MVP 脚手架 · 技术栈锁定 Vue3 + Vite + TypeScript + vite-plugin-pwa
// 仅落布局骨架与 Design Token，不接数据、不写业务逻辑。
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    }
  },
  // 方向5 · SDK 拆包：@cloudbase/js-sdk 独立 chunk，主包回退到 ~130KB。
  // 说明：SDK 仅被 src/lib/cloudbase.ts 顶层静态引入；cbApp 需保持同步导出
  // （视图层/WrongsView、useOcr 均同步使用），故用 manualChunks 拆包，
  // 而非改 cloudbase.ts 为动态 import——后者会破坏不可改视图层的同步 cbApp 用法，
  // 且真正懒加载需把 cloudbase.ts 也改动态 import（须动 .vue，越红线）。
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          cloudbase: ['@cloudbase/js-sdk']
        }
      }
    }
  },
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Nancy的奇妙书屋',
        short_name: '奇妙书屋',
        description: 'Nancy的奇妙书屋 · 温柔向导陪孩子读书学习',
        lang: 'zh-CN',
        theme_color: '#E8DFF5',
        background_color: '#F6F3FB',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-maskable.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' }
        ]
      },
      // ↓ PWA 预缓存边界声明（对应 CF Pages _routes.json 的静态/动态分工）
      // 说明：vite-plugin-pwa 在 generateSW 策略下，workbox 的 include/exclude
      // 仅对 webpack 编译管线有效，Vite 侧对应字段为 globPatterns / globIgnores，
      // 二者语义一致（前者「要预缓存」，后者「绝不可预缓存」）。
      // includeManifestIcons 关闭：图标与 manifest 已由下方 globPatterns 显式列出，
      // 若保留默认 true 会与 glob 结果重复，令预缓存清单出现重复条目。
      includeManifestIcons: false,
      workbox: {
        // 应进 SW 预缓存：应用壳 + 带 hash 的构建产物 + 图标
        // 注：manifest.webmanifest 无需列出——插件在 manifest 存在时必定通过
        // additionalManifestEntries 追加该条目，显式再写会产生重复 precache 项。
        globPatterns: [
          'index.html',
          'registerSW.js',
          'icon-*.png',
          'icon-maskable.svg',
          'assets/**/*.{js,css,html,wasm}'
        ],
        // 绝不可进 SW 预缓存：Edge Function 路由、SW 自身与 workbox 运行时、
        // CF Pages 路由声明、source map、本地开发残留
        globIgnores: [
          'api/**',
          'sw.js',
          'workbox-*.js',
          '**/cloudbase-*.js',
          '_routes.json',
          '**/*.map',
          'preview.log'
        ]
      }
    }),
    cfPagesRoutesManifest()
  ]
})
