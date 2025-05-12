/**我的 */
<script setup lang="ts">
import { onMounted } from 'vue'

import { commonApi } from '@/apis'
import { CONST_ROUTES } from '@/constants'
import { ResultEnum } from '@/enums'
import { getSession, getToken, setLocal } from '@/utils'
import jsBridge from '@/utils/jsBridge'

import { MenuList, UserInfo } from './components'

defineOptions({ name: CONST_ROUTES.MY.name })

// 设置导航栏高度
const setStatusHeight = () => {
  const statusHeight = getSession('statusHeight')
  const vanNavBar = document.querySelector('.user-info') as HTMLElement
  if (statusHeight) {
    vanNavBar.style.paddingTop = `${statusHeight}px`
  } else {
    vanNavBar.style.paddingTop = '0px'
  }
}

// 注册物理按键返回事件
const registerBackButton = () => {
  jsBridge.registerHandler(
    'callBackJs',
    (
      _data: any,
      responseCallback: (responseData: { message: string }) => void
    ) => {
      doExitApp()
      responseCallback({ message: 'callBackJs callCameraJs success' })
    }
  )
}

// 调用退出按钮事件
const doExitApp = () => {
  jsBridge.callHandler('doExitApp', {}, (responseData: string) => {
    console.log(responseData)
  })
}

const getLoginDriverInfo = async () => {
  try {
    const token = getToken()
    if (!token) return
    const { code, data } = await commonApi.getLoginDriverInfo(token)
    if (code !== ResultEnum.SUCCESS) return
    setLocal('user', data)
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  registerBackButton() // 注册物理按键返回事件
  setStatusHeight() // 设置导航栏高度
  getLoginDriverInfo() // 获取司机信息
})
</script>

<template>
  <user-info />
  <menu-list />
</template>

<style scoped lang="scss">
:deep(.van-nav-bar) {
  background: #d3e5ff;
}
:deep(.van-nav-bar__title) {
  color: #000 !important;
}
.page {
  height: calc(100vh - 96px);
  .user-info {
    height: 177px;
    background: url('@/assets/images/my-bgc.png') no-repeat 100% 100%;
  }
}
</style>
