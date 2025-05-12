<template>
  <div class="page">
    <div class="nav-bar-con">
      <van-nav-bar
        title="抢单大厅"
        :fixed="true"
        :placeholder="false"
        :safe-area-inset-top="false"
      />
    </div>
    <serve-card
      order-status="2"
      :refresh="refresh"
      @update:refresh="refreshHandler"
      @refresh:status="refreshStatus"
    />
    <gap :height="50" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'

import Gap from '@/components/other-page/gap.vue'
import { CONST_ROUTES } from '@/constants'
import { getSession } from '@/utils'
import jsBridge from '@/utils/jsBridge'
import ServeCard from '@/views/home/components/sever-card.vue'

defineOptions({ name: CONST_ROUTES.ORDER.name })

const time = ref(30)
const timer = ref<any>(null)
const refresh = ref(false)
const isRefresh = ref(false)
const route = useRoute()
const router = useRouter()

// 开始倒计时
const startCountDown = () => {
  const intervalId = setInterval(() => {
    time.value -= 1
    if (time.value <= 0) {
      resetCountDown()
    } else {
      refresh.value = false
    }
  }, 1000)

  timer.value = intervalId
}

// 重置倒计时
const resetCountDown = () => {
  time.value = 30
  refresh.value = true
  clearInterval(timer.value)
}

// 刷新事件
const refreshHandler = (value: boolean) => {
  clearInterval(timer.value)
  time.value = 30
  refresh.value = value
  startCountDown()
}

// 刷新状态
const refreshStatus = (status: string) => {
  if (status === 'loading') {
    isRefresh.value = true
  } else {
    isRefresh.value = false
  }
}

// 设置导航栏高度
const setStatusHeight = () => {
  const statusHeight = getSession('statusHeight')
  if (statusHeight) {
    const navBar = document.querySelector('.van-nav-bar') as HTMLElement
    const navBarCon = document.querySelector('.nav-bar-con') as HTMLElement
    navBar.style.paddingTop = `${statusHeight}px`
    navBarCon.style.height = `${Number(statusHeight) + 46}px`
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
      if (route.query.backRouteName === 'home') {
        router.back()
        return
      }
      doExitApp()
      responseCallback({ message: 'callBackJs callCameraJs success' })
    }
  )
}

// 调用退出按钮事件
const doExitApp = () => {
  jsBridge.callHandler('doExitApp', {}, (_responseData: string) => {})
}

// 组件挂载完成后执行的函数
onMounted(() => {
  // console.log('订单页挂载完成')
  setStatusHeight() // 设置导航栏高度
  registerBackButton() // 注册物理按键返回事件
  startCountDown() // 开始倒计时，当倒计时结束后，自动刷新
})

// 组件卸载完成后执行的函数
onUnmounted(() => {
  // console.log('订单页卸载完成')
})
</script>

<style lang="scss" scoped>
.page {
  background: #f9fafb;
  min-height: 100vh;
  .nav-bar-con {
    height: 46px;
  }
}
</style>
