import { createRouter, createWebHashHistory } from 'vue-router'
import HomeShell from '../views/HomeShell.vue'
import AtelierView from '../views/AtelierView.vue'
import ArenaView from '../views/ArenaView.vue'
import CaptureView from '../views/CaptureView.vue'
import ReviewView from '../views/ReviewView.vue'
import TeachView from '../views/TeachView.vue'

// Hash 路由壳 · 仅三空路由挂载
// 无守卫 / 无嵌套 / 无面包屑；返回一键回首页由 Shell 底栏接管。
export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    // CAP-01 采集链两页：/capture 采集（作业/口算双入口共用），/review 批改结果占位（REV-01 未开工）
    { path: '/capture', name: 'capture', component: CaptureView },
    { path: '/review', name: 'review', component: ReviewView },
    // REV-03 占位路由：讲题流落点（讲题内容属 TCH-01，本片只建壳）
    { path: '/teach', name: 'teach', component: TeachView },
    { path: '/', component: HomeShell }, // 首页
    { path: '/atelier', component: AtelierView }, // 妙语工坊
    { path: '/arena', component: ArenaView }, // 星练场
    // ②-4a 错题/讲题/学情三视图（mock 态，真实读写留②-4末换线；path 深度 ≤2）
    { path: '/wrongs', component: () => import('@/views/WrongsView.vue') },
    { path: '/explain', component: () => import('@/views/ExplainView.vue') },
    { path: '/progress', component: () => import('@/views/ProgressView.vue') }
  ]
})
