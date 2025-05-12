<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'

import Gap from '@/components/other-page/gap.vue'
import { CONST_ROUTES } from '@/constants'
import { isWeChatBrowser, onClickNavTitle, setStatusHeight } from '@/utils'
import jsBridge from '@/utils/jsBridge'

import { GrabList } from './components'

defineOptions({ name: CONST_ROUTES.ORDER.name })

const refreshTime = ref(2) // 倒计时
const timer = ref<any>(null) // 定时器
const refresh = ref(false) // 刷新
const isRefresh = ref(false) // 是否刷新
const route = useRoute()
const router = useRouter()

/**
 * 启动倒计时计时器。
 *
 * - 调用“setInterval”创建一个计时器，该计时器将每1000ms减少一次“刷新时间”。
 * - 如果“刷新时间”为0或更少，则调用“resetCountDown”。
 * - 将“刷新”设置为false。
 * - 将“刷新时间”减少1。
 * - 将“计时器”设置为“setInterval”返回的intervalId。
 */
const startCountDown = () => {
  const intervalId = setInterval(() => {
    if (refreshTime.value <= 0) {
      resetCountDown()
    } else {
      refresh.value = false
      refreshTime.value -= 1
    }
  }, 1000)

  timer.value = intervalId
}

const resetCountDown = () => {
  refreshTime.value = 2
  refresh.value = true
  clearInterval(timer.value)
}

/**
 * 处理来自'GrabList'组件的刷新事件。
 *
 * - 清除当前倒计时计时器
 * - 将“刷新时间”重置为2
 * - 将“刷新”反应状态设置为提供的“值”
 * - 再次启动倒计时
 * @param {boolean} value - 刷新指示符的值
 */

const refreshHandler = (value: boolean) => {
  clearInterval(timer.value)
  refreshTime.value = 2
  refresh.value = value
  startCountDown()
}

/**
 * 根据“状态”的值设置“isRefresh”的值。
 *
 *@param {string} status - 刷新的状态。可以是“加载”或任何其他字符串。
 */
const refreshStatus = (status: string) => {
  isRefresh.value = status === 'loading'
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
  setStatusHeight() // 设置导航栏高度
  registerBackButton() // 注册物理按键返回事件
  startCountDown() // 开始倒计时，当倒计时结束后，自动刷新
})

// 组件卸载完成后执行的函数
onUnmounted(() => {})
</script>

<template>
  <div class="page" :class="{ wechat_pt: isWeChatBrowser }">
    <div v-if="!isWeChatBrowser" class="nav-bar-con">
      <van-nav-bar
        :fixed="true"
        :placeholder="false"
        :safe-area-inset-top="false"
      >
        <template #title>
          <span @click="onClickNavTitle">抢单大厅</span>
        </template>
      </van-nav-bar>
    </div>
    <grab-list
      :refresh="refresh"
      @update:refresh="refreshHandler"
      @refresh:status="refreshStatus"
    />
    <gap :height="50" />
  </div>
</template>

<style lang="scss" scoped>
.page {
  background: #f4f4f4;
  min-height: 100vh;
  .nav-bar-con {
    height: 46px;
  }
}

.wechat_pt {
  padding-top: 18px;
}
.wechat_mt {
  margin-top: 18px;
}
</style>
