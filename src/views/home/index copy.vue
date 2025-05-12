<template>
  <div class="page">
    <div class="nav-bar-con">
      <van-nav-bar
        title="我的工作台"
        :fixed="true"
        :placeholder="false"
        :safe-area-inset-top="false"
        :border="false"
      />
    </div>
    <div
      class="flex flex-justify-between flex-items-center bg-#E5E5E5 h-44px pl-25px pr-20px"
    >
      <div class="text-#333333 font-500 text-15px">未完成订单</div>
      <div class="flex flex-items-center" @click="filterOrderShow = true">
        <span class="text-13px text-#606162">
          {{ dateFilterStore.text }}
        </span>
        <div class="arrow"></div>
      </div>
    </div>
    <serve-card ref="serveCardRef" :order-status="active" />
    <div class="h-50px"></div>
  </div>

  <van-action-sheet
    v-model:show="filterOrderShow"
    :actions="filterOrderActins"
    cancel-text="取消"
    close-on-click-action
    @cancel="filterOrderShow = false"
    @select="filterOrderOnSelect"
  />
</template>

<script setup lang="ts">
import { onActivated, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import { CONST_ROUTES } from '@/constants'
import { useDateFilterStore } from '@/store'
import { getSession } from '@/utils'
import jsBridge from '@/utils/jsBridge'
import ServeCard from '@/views/home/components/sever-card.vue'

defineOptions({
  name: CONST_ROUTES.HOME.name
})

// 筛选订单
const dateFilterStore = useDateFilterStore()

const filterOrderShow = ref(false)

const filterOrderActins = ref([
  { name: '全部订单', color: '#606162', value: 'total' },
  { name: '今天订单', color: '#606162', value: 'today' },
  { name: '明天订单', color: '#606162', value: 'tomorrow' },
  { name: '后天订单', color: '#606162', value: 'theDayAfterTomorrow' }
])

const route = useRoute()
const active = ref('all')
const offsetTop = ref('46px')
const gapHeight = ref(50)

const serveCardRef = ref<{ speedShow: boolean }>({ speedShow: false })

const useDate = ref({ start: '', end: '' })

const init = () => {
  active.value = route.query.orderStatus as string
}

// 设置导航栏高度
const setStatusHeight = () => {
  const statusHeight = getSession('statusHeight')
  if (statusHeight) {
    // 获取 van-nav-bar 元素并设置顶部内边距
    const navBar = document.querySelector('.van-nav-bar') as HTMLElement
    if (navBar) {
      navBar.style.paddingTop = `${statusHeight}px`
    }

    // 获取 nav-bar-con 元素并设置高度
    const navBarCon = document.querySelector('.nav-bar-con') as HTMLElement

    if (navBarCon) {
      // 通过字符串模板创建新的高度样式
      const newStyle = `${Number(statusHeight) + 46}px`
      // 将新的样式应用到 nav-bar-con 元素
      navBarCon.style.height = newStyle
    }

    // 设置 offsetTop 的值
    offsetTop.value = (Number(statusHeight) + 46 - 3).toString()
  }
}

/**
 * Registers a handler for the 'callBackJs' event to manage the back button behavior.
 *
 * If the `speedShow` property of `serveCardRef` is true, it will be set to false and the function will return early.
 * Otherwise, it calls the `doExitApp` function to handle app exit functionality.
 *
 * @param {any} _data - The incoming data from the handler, not used in this function.
 * @param {function} responseCallback - A callback function to send a response message back after handling.
 */
const registerBackButton = () => {
  jsBridge.registerHandler(
    'callBackJs',
    (
      _data: any,
      responseCallback: (responseData: { message: string }) => void
    ) => {
      if (serveCardRef.value?.speedShow) {
        serveCardRef.value.speedShow = false
        return
      }
      doExitApp()
      responseCallback({ message: 'callBackJs callCameraJs success' })
    }
  )
}

/**
 * Calls the 'doExitApp' handler of the native app.
 *
 * The native app will handle the app exit event based on the response data.
 *
 * @return {void}
 */
const doExitApp = () => {
  jsBridge.callHandler('doExitApp', {}, (responseData: string) => {
    console.log(responseData)
  })
}

/**
 * Handles the selection of a filter option from the order filter ActionSheet.
 *
 * Updates the `useDate` reactive state with the start and end timestamps based on the selected filter value.
 * Also updates the `dateFilterStore` with the formatted date range and the filter name.
 *
 * @param {Object} param - An object containing the selected filter option.
 * @param {string} param.name - The display name of the filter option.
 * @param {string} param.value - The value representing the filter option, which can be:
 *                               'total', 'today', 'tomorrow', or 'theDayAfterTomorrow'.
 */
const filterOrderOnSelect = ({
  name,
  value
}: {
  name: string
  value: string
}) => {
  // 今天的日期
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth() + 1
  const day = today.getDate()
  switch (value) {
    case 'total':
      useDate.value.start = ''
      useDate.value.end = ''
      break
    case 'today':
      useDate.value.start = `${year}-${month}-${day} 00:00:00`
      useDate.value.end = `${year}-${month}-${day} 23:59:59`

      break
    case 'tomorrow':
      useDate.value.start = `${year}-${month}-${day + 1} 00:00:00`
      useDate.value.end = `${year}-${month}-${day + 1} 23:59:59`
      break
    case 'theDayAfterTomorrow':
      useDate.value.start = `${year}-${month}-${day + 2} 00:00:00`
      useDate.value.end = `${year}-${month}-${day + 2} 23:59:59`
      break
  }
  const { start, end } = useDate.value
  dateFilterStore.setUseDate({ startDate: start, endDate: end })
  dateFilterStore.setText(name)
}

onActivated(() => {
  registerBackButton()
  setStatusHeight()
})

onMounted(() => {
  init()
  registerBackButton()
  setStatusHeight()
  // setBottomTabbarHeight()
})
</script>

<style scoped lang="scss">
@import '@/assets/styles/profile.scss';
.page {
  min-height: 100vh;
  background-color: #f9fafb;
  .nav-bar-con {
    height: 46px;
  }
}
</style>
