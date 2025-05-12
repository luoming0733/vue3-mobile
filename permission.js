import router from '@/router'
import { getToken, removeToken, setToken } from '@/utils'
// import getPageTitle from '@/utils/getPageTitle'
//白名单
const whiteList = ['/login', '/404', '/401', '/500'] // no redirect whitelist
router.beforeEach(async (to, from, next) => {
  // set page title
  document.title = '速派会务司机端'
  const hasToken = getToken()
  console.log(hasToken)
  const path = to.path
  // 白名单中路由直接放行
  if (whiteList.includes(path)) {
    next()
    return
  }
  //如果已登录，有token，则跳到重定向页面
  if (hasToken) {
    if (to.path === '/login') {
      // if is logged in, redirect to the home page
      next({ path: '/' })
    }
    //在这里可以进行其他判断，如果已经登录，并且不是在登录页面，即在页面C，那么可以获取用户的角色权限 ，对用户是否能进入页面C进行判断
    else {
      next()
    }
  } else {
    //whiteList 里的内容不需要验签
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      //无登录token，重定向，登录后跳转
      if (to.query.token) {
        next(`/login?redirect=${to.path}?token=${to.query.token}`)
      } else {
        next(`/login`)
      }
    }
  }
})

router.afterEach(async (to, from, next) => {
  if (to.path === '/login') {
    console.log(111)
  } else {
    //调接口，记录日志
    //……
  }
})
