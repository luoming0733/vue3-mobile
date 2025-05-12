import type { RouteRecordRaw } from 'vue-router'

import { CONST_ROUTES } from '@/constants'

export default [
  {
    path: '/:pathMatch(.*)*',
    redirect: { path: CONST_ROUTES.HOME.path }
  },
  // 首页
  {
    ...CONST_ROUTES.HOME,
    component: () => import('@/views/home/index.vue'),
    meta: { requiresAuth: true, title: '首页' }
  },
  // 登录
  {
    ...CONST_ROUTES.LOGIN,
    component: () => import('@/views/login/index.vue'),
    meta: { requiresAuth: false, title: '登录' }
  },
  // 注册
  {
    ...CONST_ROUTES.REGISTER,
    component: () => import('@/views/login/register.vue'),
    meta: { requiresAuth: false, title: '注册' }
  },
  // 扫码
  {
    ...CONST_ROUTES.SCAN_CODE,
    component: () => import('@/views/login/scan-code.vue'),
    meta: { requiresAuth: false, title: '扫码' }
  },
  // 消息
  {
    ...CONST_ROUTES.NOTIFY,
    component: () => import('@/views/notify/index.vue'),
    meta: { requiresAuth: true, title: '消息中心' }
  },
  // 抢单大厅
  {
    ...CONST_ROUTES.ORDER,
    component: () => import('@/views/grab-order-lounge/index.vue'),
    meta: { requiresAuth: true, title: '抢单大厅' }
  },

  // 我的
  {
    ...CONST_ROUTES.MY,
    component: () => import('@/views/my/index.vue'),
    meta: { requiresAuth: true, title: '个人中心' }
  },

  // 我的订单
  {
    ...CONST_ROUTES.MY_ORDER,
    component: () => import('@/views/my/order/index.vue'),
    meta: { requiresAuth: true, keepAlive: true, title: '我的订单' }
  },
  // 选择时间段
  {
    ...CONST_ROUTES.SELECT_TIME,
    component: () => import('@/views/my/select-time/index.vue'),
    meta: { requiresAuth: true, title: '' }
  },

  // 证件信息 certificate
  {
    ...CONST_ROUTES.CERTIFICATE,
    component: () => import('@/views/my/certificate/index.vue'),
    meta: { requiresAuth: true, title: '证件信息' }
  },

  // 实名认证
  {
    ...CONST_ROUTES.REAL_NAME,
    component: () => import('@/views/my/certificate/profile/real-name.vue'),
    meta: { requiresAuth: true, title: '实名认证' }
  },
  // 驾驶证
  {
    ...CONST_ROUTES.DRIVING_CARD,
    component: () => import('@/views/my/certificate/profile/driving-card.vue'),
    meta: { requiresAuth: true, title: '驾驶证' }
  },
  // 行驶证
  {
    ...CONST_ROUTES.DRIVING_LICENSE,
    component: () =>
      import('@/views/my/certificate/profile/driving-license.vue'),
    meta: { requiresAuth: true, title: '行驶证' }
  },
  // 订单详情
  {
    ...CONST_ROUTES.ORDER_DETAILS,
    component: () => import('@/views/order-details/index.vue'),
    meta: { requiresAuth: true, keepAlive: true, title: '订单详情' }
  },

  // 选择地址
  {
    ...CONST_ROUTES.SELECT_ADDRESS,
    component: () => import('@/views/select-address/index.vue'),
    meta: { title: '选择位置' }
  },

  // 结束服务
  {
    ...CONST_ROUTES.END_SERVICE,
    component: () => import('@/views/order-details/driverEndServer/index.vue'),
    meta: { title: '结束服务' }
  },

  // 我的业绩
  {
    ...CONST_ROUTES.MY_ACHIEVEMENT,
    component: () => import('@/views/my/performance/index.vue'),
    meta: { requiresAuth: true, title: '我的业绩' }
  },

  // 我的钱包
  {
    ...CONST_ROUTES.MY_WALLET,
    component: () => import('@/views/my/wallet/index.vue'),
    meta: { requiresAuth: true, title: '我的钱包' }
  },

  // 修改密码
  {
    ...CONST_ROUTES.CHANGE_PASSWORD,
    component: () => import('@/views/my/change-password/index.vue'),
    meta: { requiresAuth: true, title: '修改密码' }
  },

  // 修改手机号码
  {
    ...CONST_ROUTES.CHANGE_PHONE,
    component: () => import('@/views/my/change-phone/index.vue'),
    meta: { requiresAuth: true, title: '修改手机号码' }
  },

  // 我的车辆
  {
    ...CONST_ROUTES.MY_VEHICLE,
    component: () => import('@/views/my/vehicle/index.vue'),
    meta: { requiresAuth: true, title: '我的车辆' }
  },

  // 我的车辆详情
  {
    ...CONST_ROUTES.MY_VEHICLE_DETAILS,
    component: () => import('@/views/my/vehicle/vehicle-details.vue'),
    meta: { requiresAuth: true, title: '车辆详情' }
  }
] as RouteRecordRaw[]
