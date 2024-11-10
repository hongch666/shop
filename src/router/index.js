import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)    
const routes = [
  {
    path: '/',
    redirect: '/login_choose'
  },
  // 根页面，选择管理员或用户登录
  {
    path: '/login_choose',
    name: 'login_choose',
    component: () => import('../views/login/login_choose.vue'),
  },
  // 管理员登录页面
  {
    path: 'admin_login',
    name: 'admin_login',
    component: () => import('../views/login/admin_login.vue')
  },
  // 用户登录页面
  {
    path: 'user_login',
    name: 'user_login',
    component: () => import('../views/login/user_login.vue')
  },
  // 管理员首页
  {
    path:'/admin_home',
    name:'admin_home',
    component: () => import('../views/admin/admin_home.vue'),
  },
  // 用户首页
  {
    path:'/user_home',
    name:'user_home',
    component: () => import('../views/user/user_home.vue'),
  },
  // 管理员用户管理页面
  {
    path:'/admin_home/user_management',
    name:'user_management',
    component: () => import('../views/admin/user_management.vue')
  },
  // 管理员商品管理页面
  {
    path:'/admin_home/product_management',
    name:'product_management',
    component: () => import('../views/admin/product_management.vue')
  },
  // 管理员订单管理页面
  {
    path:'/admin_home/order_management',
    name:'order_management',
    component: () => import('../views/admin/order_management.vue')
  },
  // 管理员分类管理页面
  {
    path:'/admin_home/category_management',
    name:'category_management',
    component: () => import('../views/admin/category_management.vue')
  },
  // 管理员用户行为管理页面
  {
    path:'/admin_home/behavior_management',
    name:'behavior_management',
    component: () => import('../views/admin/behavior_management.vue')
  },
  // 用户个人信息页面
  {
    path:'/user_home/personal_info',
    name:'personal_info',
    component: () => import('../views/user/personal_info.vue')
  },
  // 用户我的收藏页面
  {
    path:'/user_home/my_collection',
    name:'my_collection',
    component: () => import('../views/user/my_collection.vue')
  },
  // 用户我的评论页面
  {
    path:'/user_home/my_comment',
    name:'my_comment',
    component: () => import('../views/user/my_comment.vue')
  },
  // 用户我的购物车页面
  {
    path:'/user_home/my_ShopCar',
    name:'my_ShopCar',
    component: () => import('../views/user/my_ShopCar.vue')
  },
  // 用户我的订单页面
  {
    path:'/user_home/my_order',
    name:'my_order',
    component: () => import('../views/user/my_order.vue')
  },
  // 显示商品评论的页面
  {
    path:'/user_home/product_comment',
    name:'product_comment',
    component: () => import('../views/user/product_comment.vue')
  },
]


const router = new VueRouter({
  routes
})


export default router
