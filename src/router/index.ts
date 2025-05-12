// createWebHashHistory,
import { createRouter, createWebHistory, useRouter } from 'vue-router'

import { CONST_ROUTES } from '@/constants'
// useAuthStore,
import { useKeepAliveStore, useScrollPositionStore } from '@/store'
import { getToken, getWeChatConfig, isWeChatBrowser } from '@/utils'

import constRoutes from './constRoutes'

// const scrollPositionStore = useScrollPositionStore()

export function isIOS() {
  const isIphone = navigator.userAgent.includes('iPhone')
  const isIpad = navigator.userAgent.includes('iPad')
  const isIpod = navigator.userAgent.includes('iPod')
  return isIphone || isIpad || isIpod
}

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: (to, from, savedPosition) => {
    if (to.path === CONST_ROUTES.SELECT_TIME.path) {
      return { top: document.body.scrollHeight }
    }
    if (
      to.path === CONST_ROUTES.MY_ORDER.path ||
      to.path === CONST_ROUTES.HOME.path
    ) {
      return { top: useScrollPositionStore().scrollTop }
    }
    if (savedPosition) {
      return savedPosition
    }
    return {
      top: 0,
      left: 0,
      behavior: 'smooth'
    }
  },
  routes: constRoutes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  if (isIOS() && isWeChatBrowser) {
    if (from.path === '/') {
      getWeChatConfig()
    }
  }
  if (typeof to.meta.title === 'string') {
    document.title = to.meta.title
  }

  sessionStorage.setItem('hash', to.name as string)
  // const authStore = useAuthStore()
  // const isAuthenticated = !!authStore.user
  // if (to.meta.requiresAuth && !isAuthenticated) {
  //   // 如果路由需要认证，但用户未登录，则重定向到登录页面
  //   next({ name: 'Login' })
  // } else {
  //   // 否则，允许路由继续
  //   next()
  // }
  const token = getToken()
  const meta = to.meta || {}
  if (
    to.name === CONST_ROUTES.SELECT_ADDRESS.name ||
    to.name === CONST_ROUTES.ORDER_DETAILS.name
  ) {
    // console.log(from)

    useKeepAliveStore().addKeepAlive(from.name as string)
  } else {
    useKeepAliveStore().removeKeepAlive(from.name as string)
  }

  // 如果路由需要认证，但用户未登录，则重定向到登录页面
  if (meta.requiresAuth && !token) {
    next({ name: CONST_ROUTES.LOGIN.name, query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

// 路由前置守卫
router.beforeResolve((to, from, next) => {
  if (to.name === CONST_ROUTES.ORDER_DETAILS.name) {
    useScrollPositionStore().setScrollTop(window.scrollY)
  }
  next()
})

// 路由后置守卫
router.afterEach((to, from) => {
  // 判断是否是微信浏览器
  if (isWeChatBrowser && !isIOS()) {
    getWeChatConfig()
  }
})

// ios设备获取微信配置信息前的处理
function beforeGetWxConfigByIos(url: string) {
  // 如果entryUrl为空或未定义，设置为当前URL
  if (window.entryUrl === '' || window.entryUrl === undefined) {
    // 如果entryUrl为空或未定义，设置为当前URL
    window.entryUrl = url
  }

  // 如果entryUrl不同，检查是否包含orderDetails
  if (window.entryUrl !== url) {
    if (url.includes('orderDetails')) {
      // 如果包含orderDetails，使用其他方式进入该页面
      // TODO: implement other way to enter the page
    } else {
      console.log('entryUrl', url)
      window.location.replace(url)
    }
  } else {
    // // // 如果entryUrl相同，调用getWeChatConfig函数
    // // getWeChatConfig(window.entryUrl);

    // // 如果entryUrl相同 判断哪些需要调用微信配置
    // console.log(window.entryUrl, url)

    // // 需要调用的页面
    // const needGetWxConfigPages = [
    //   CONST_ROUTES.REGISTER.path,
    //   CONST_ROUTES.CERTIFICATE.path,
    //   CONST_ROUTES.REAL_NAME.name,
    //   CONST_ROUTES.DRIVING_CARD.path,
    //   CONST_ROUTES.DRIVING_LICENSE.path,
    //   CONST_ROUTES.ORDER_DETAILS.path,
    //   CONST_ROUTES.END_SERVICE.path,
    //   CONST_ROUTES.MY_VEHICLE_DETAILS.path
    // ]

    // if (needGetWxConfigPages.some(page => url.includes(page))) {
    //   getWeChatConfig(window.entryUrl)
    // }

    getWeChatConfig(window.entryUrl)
  }
}

declare global {
  interface Window {
    entryUrl: string
  }
}

export default router
