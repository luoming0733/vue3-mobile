<script setup lang="ts">
import { onActivated, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { CONST_ROUTES } from '@/constants'
import { useDateFilterStore, useTabBadgeStore } from '@/store'
import { getSession, isWeChatBrowser, onClickNavTitle } from '@/utils'
import jsBridge from '@/utils/jsBridge'
import ServeCard from '@/views/home/components/sever-card.vue'

defineOptions({
  name: CONST_ROUTES.MY_ORDER.name
})

const route = useRoute()
const router = useRouter()

const active = ref('2')
const offsetTop = isWeChatBrowser ? ref('0px') : ref('46px')
const tabList = ref([
  { name: 'pendingOrders', orderStatus: '2', title: '待服务' },
  { name: 'inProgressOrders', orderStatus: '3', title: '服务中' },
  { name: 'completeOrders', orderStatus: '4', title: '已完成' },
  { name: 'allOrders', orderStatus: '', title: '全部' }
])

const serveCardRef = ref<{ speedShow: boolean }>({ speedShow: false })

const selectTimeRangeShow = ref(false)

const selectTimeRangeActions = ref([
  { name: '全部订单', value: 0 },
  { name: '选择时间段', value: 1 }
])

// 返回
const onClickLeft = () => {
  router.push({ name: CONST_ROUTES.MY.name })
}

const init = () => {
  active.value = route.query.orderStatus as string
}

// tabs 切换事件
const handleChange = async () => {}

/**
 * 设置指定标签的徽章值
 *
 * @param {string} name - 标签名
 * @return {string|number} - 指定标签的徽章值，如果没有找到则返回0。
 */
const setBadge = (name: string) => {
  const tabBadge = useTabBadgeStore()
  const badgeMap: { [key: string]: number } = {
    '2': tabBadge.pendingOrders,
    '3': tabBadge.inProgressOrders,
    '4': 0,
    '': 0
  }
  return badgeMap[name] ?? 0
}

/**
 * Handles the selection of a time range option from the action sheet.
 *
 * Updates the `dateFilterStore` with the appropriate start and end dates if "全部订单" is selected.
 * Navigates to the "SELECT_TIME" route if a specific time range is chosen.
 * Finally, hides the action sheet.
 *
 * @param {Object} item - The selected time range option.
 * @param {string} item.name - The display name of the selected option.
 * @param {number} item.value - The value representing the selected option.
 */
const onSelectTimeRange = (item: { name: string; value: number }) => {
  const { value } = item

  if (value === 0) {
    const dateFilterStore = useDateFilterStore()
    dateFilterStore.setUseDate({ startDate: '', endDate: '' })
    dateFilterStore.setText('全部订单')
  } else {
    router.push({ name: CONST_ROUTES.SELECT_TIME.name })
  }

  selectTimeRangeShow.value = false
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
    offsetTop.value = `${Number(statusHeight) + 46}px`
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
      if (serveCardRef.value?.speedShow) {
        serveCardRef.value.speedShow = false
        return
      }
      onClickLeft()
      responseCallback({ message: 'callBackJs callCameraJs success' })
    }
  )
}

// // 调用退出按钮事件
// const doExitApp = () => {
//   jsBridge.callHandler('doExitApp', {}, (responseData: string) => {
//     console.log(responseData)
//   })
// }

onActivated(() => {
  registerBackButton()
})

onMounted(() => {
  init()
  registerBackButton()
  setStatusHeight()
  // setBottomTabbarHeight()
})
</script>

<template>
  <div class="page">
    <div v-if="!isWeChatBrowser" class="nav-bar-con">
      <van-nav-bar
        :fixed="true"
        :placeholder="false"
        :safe-area-inset-top="false"
        @click-left="onClickLeft"
      >
        <template #left>
          <van-icon name="arrow-left" size="22" />
        </template>
        <template #title>
          <span @click="onClickNavTitle">我的订单</span>
        </template>
      </van-nav-bar>
    </div>
    <van-tabs
      v-model:active="active"
      class="my-tabs"
      :sticky="true"
      :border="false"
      :offset-top="offsetTop"
      title-inactive-color="#333333"
      title-active-color="#434445"
      color="#434445"
      @change="handleChange"
    >
      <template #nav-bottom>
        <div class="flex justify-center items-center h-43px bg-#F1F5F8">
          <span
            class="text-#606162 text-11px mr-5px"
            @click="selectTimeRangeShow = true"
          >
            {{ useDateFilterStore().text }}
          </span>
          <span class="arrow"></span>
        </div>
      </template>
      <van-tab
        v-for="item in tabList"
        :key="item.orderStatus"
        :title="item.title"
        :name="item.orderStatus"
        :badge="setBadge(item.orderStatus)"
        :show-zero-badge="false"
      >
        <serve-card
          v-if="active === item.orderStatus"
          ref="serveCardRef"
          :order-status="active"
          show-customer
        />
      </van-tab>
    </van-tabs>
  </div>

  <van-action-sheet
    v-model:show="selectTimeRangeShow"
    :actions="selectTimeRangeActions"
    cancel-text="取消"
    close-on-click-action
    @select="onSelectTimeRange"
  />
</template>

<style scoped lang="scss">
@import '@/assets/styles/profile.scss';
.page {
  min-height: 100vh;
  .nav-bar-con {
    height: 46px;
    box-sizing: border-box;
  }
}
</style>
