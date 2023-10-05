import { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
    { path: '/:pathMatch(.*)*', component: () => import("@renderer/views/404.vue") },
    { path: '/', name: '首页', component: () => import('@renderer/views/home/index.vue') },
    { path: '/test', name: '测试', component: () => import('@renderer/views/home/test.vue') },
    { path: '/edit', name: '编辑页面', component: () => import('@renderer/views/edit/index.vue') },
    { path: '/about', name: '关于', component: () => import('@renderer/components/LandingPage.vue') },
    { path: '/Print', name: '打印', component: () => import('@renderer/views/Print.vue') },
    { path: '/Browser', name: '浏览器', component: () => import('@renderer/views/Browser.vue') },
]

export default routes