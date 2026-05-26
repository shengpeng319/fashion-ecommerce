import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: () => import('../views/Layout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'products',
        name: 'Products',
        component: () => import('../views/Products.vue'),
        meta: { title: '商品管理' }
      },
      {
        path: 'categories',
        name: 'Categories',
        component: () => import('../views/Categories.vue'),
        meta: { title: '分类管理' }
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('../views/Orders.vue'),
        meta: { title: '订单管理' }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('../views/Users.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: 'members',
        name: 'Members',
        component: () => import('../views/Members.vue'),
        meta: { title: '会员管理' }
      },
      {
        path: 'shareholder/list',
        name: 'ShareholderList',
        component: () => import('../views/shareholder/ShareholderList.vue'),
        meta: { title: '股东列表' }
      },
      {
        path: 'shareholder/:id',
        name: 'ShareholderDetail',
        component: () => import('../views/shareholder/ShareholderDetail.vue'),
        meta: { title: '股东详情' }
      },
      {
        path: 'shareholder/config',
        name: 'ShareholderConfig',
        component: () => import('../views/shareholder/ShareholderConfig.vue'),
        meta: { title: '股东配置' }
      },
      {
        path: 'shareholder/dashboard',
        name: 'ShareholderDashboard',
        component: () => import('../views/shareholder/ShareholderDashboard.vue'),
        meta: { title: '股东Dashboard' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title || ''} - 时尚女装管理后台`
  const token = localStorage.getItem('admin_token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
