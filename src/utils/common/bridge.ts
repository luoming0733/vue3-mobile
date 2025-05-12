import { getSession } from '@/utils'
import jsBridge from '@/utils/jsBridge'

/**
 * 设置状态栏高度
 *
 * 该函数首先获取状态栏的高度，接着获取 van-nav-bar 和 nav-bar-con 两个元素
 * 将状态栏的高度设置到 van-nav-bar 的 paddingTop 样式中
 * 将状态栏的高度 + 46px 设置到 nav-bar-con 的高度样式中
 * 最后将 offsetTop 的值设置为状态栏的高度 + 46px - 3px
 */
const setStatusHeight = () => {
  const statusHeight = getSession('statusHeight')
  if (statusHeight) {
    const navBar = document.querySelector('.van-nav-bar') as HTMLElement
    if (navBar) {
      navBar.style.paddingTop = `${statusHeight}px`
    }
    const navBarCon = document.querySelector('.nav-bar-con') as HTMLElement
    if (navBarCon) {
      const newStyle = `${Number(statusHeight) + 46}px`
      navBarCon.style.height = newStyle
    }
  }
}

/**
 * 注册返回事件
 *
 * @param {Function} callback - 回调函数
 */
const registerBackButton = (callback: () => void) => {
  jsBridge.registerHandler(
    'callBackJs',
    (
      _data: any,
      responseCallback: (responseData: { message: string }) => void
    ) => {
      callback()
      responseCallback({ message: 'callBackJs callCameraJs success' })
    }
  )
}

/**
 * 退出 APP
 *
 * 调用 native 的 doExitApp 方法，退出 APP
 */
const doExitApp = () => {
  jsBridge.callHandler('doExitApp', {}, (responseData: string) => {
    console.log(responseData)
  })
}

export { doExitApp, registerBackButton, setStatusHeight }
