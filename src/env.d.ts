/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}

// 自定义 Vite 环境变量（.env.* 注入），供 cloudbase.ts 读取
interface ImportMetaEnv {
  readonly VITE_TCB_ENV: string
  readonly VITE_TCB_REGION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
