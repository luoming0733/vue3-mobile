<script setup lang="ts">
import { showToast } from 'vant'
import { onActivated, onMounted, ref } from 'vue'

import { orderApi } from '@/apis'
import Develop from '@/components/other-page/develop.vue'
import Gap from '@/components/other-page/gap.vue'
import { CONST_ROUTES } from '@/constants'
import { ResultEnum } from '@/enums'
import { $t } from '@/locales'
import { useTabBadgeStore } from '@/store'
import { getLocal, getSession, isWeChatBrowser, onClickNavTitle } from '@/utils'
import jsBridge from '@/utils/jsBridge'
import ServeCard from '@/views/home/components/sever-card.vue'

import { DriverInfo } from './components'

defineOptions({
  name: CONST_ROUTES.HOME.name
})

const offsetTop = ref('46px')

const serveCardRef = ref<{ speedShow: boolean }>({ speedShow: false })

// 数据统计
const homeTopData = ref([
  {
    value: 0,
    label: $t('page.home.cardData.todayGrabCount'),
    key: 'todayGrabCount'
  },
  {
    value: 0,
    label: $t('page.home.cardData.todayTaskCount'),
    key: 'todayTaskCount'
  },
  {
    value: 0,
    label: $t('page.home.cardData.todayCompletedCount'),
    key: 'todayCompletedCount'
  },
  {
    value: 0,
    label: $t('page.home.cardData.onlineTime'),
    key: 'onlineTime'
  }
])

// 当前激活
const active = ref(2)

const tabs = ref([
  {
    label: $t('page.home.tabsList.pendingOrders'),
    content: 0,
    key: 'pendingOrders'
  },
  {
    label: $t('page.home.tabsList.inProgressOrders'),
    content: 0,
    key: 'inProgressOrders'
  },
  {
    label: $t('page.home.tabsList.noticeCount'),
    content: 0,
    key: 'noticeCount'
  }
])

// 定义Badge
interface BadgeMapType {
  pendingOrders: number
  inProgressOrders: number
  noticeCount: number
  // 可以方便地在这里添加更多的badge类型属性
}

function createBadgeMap(tabBadge: {
  pendingOrders: number
  inProgressOrders: number
}): BadgeMapType {
  return {
    pendingOrders: tabBadge.pendingOrders,
    inProgressOrders: tabBadge.inProgressOrders,
    noticeCount: 0
  }
}

/**
 * 设置标签的徽标
 *
 * @param {string} name - 标签名称.
 * @returns {number|string} - 标签的徽标值.
 */
const setBadge = (name: string): number => {
  const tabBadge = useTabBadgeStore()
  const badgeMap = createBadgeMap(tabBadge)
  if (!(name in badgeMap)) {
    throw new Error(`Invalid badge name: ${name}`)
  }
  return badgeMap[name as keyof BadgeMapType]
}

// 获取首页数据
const getHomeData = async () => {
  try {
    const { code, data, message } =
      await orderApi.getDriverHomeCompletionCounts()
    if (code === ResultEnum.SUCCESS && data) {
      homeTopData.value = homeTopData.value.map(element => ({
        ...element,
        value: data[element.key] || element.value
      }))
    } else {
      showToast(message)
    }
  } catch (error) {
    console.error(error)
  }
}

// 计算登录时长
const calcOnlineTime = () => {
  // 获取登录的时间
  const loginTime = getLocal('user')?.loginTime
  if (loginTime) {
    const hours = +(
      (new Date().getTime() - +loginTime) /
      (1000 * 60 * 60)
    ).toFixed(1)
    const onlineTimeElement = homeTopData.value.find(
      element => element.key === 'onlineTime'
    )
    if (onlineTimeElement) {
      onlineTimeElement.value = hours || 0
    }
  }
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
 * Initialization function.
 *
 * This function is called when the component is mounted and it takes care of
 * the following tasks:
 *
 * - Gets the home data.
 * - Registers the back button handler.
 * - Sets the status bar height.
 */
const init = () => {
  getHomeData()
  registerBackButton()
  setStatusHeight()
  calcOnlineTime()
}

onActivated(() => {
  init()
  // registerBackButton()
  // setStatusHeight()
})

onMounted(() => {
  init()
  // registerBackButton()
  // setStatusHeight()
  // setBottomTabbarHeight()
})
</script>

<template>
  <div class="page" :class="{ wechat_pt: isWeChatBrowser }">
    <div v-if="!isWeChatBrowser" class="nav-bar-con">
      <van-nav-bar
        title="首页"
        :fixed="true"
        :placeholder="false"
        :safe-area-inset-top="false"
        :border="false"
      >
        <template #title>
          <div class="px-20px" @click="onClickNavTitle">
            {{ $t('page.home.common.title') }}
          </div>
        </template>
      </van-nav-bar>
    </div>

    <!-- 司机信息 -->
    <driver-info :class="{ wechat_mt: !isWeChatBrowser }"></driver-info>

    <!-- 数据统计 -->
    <div class="mb-18px mt-18px">
      <div class="flex flex-justify-around flex-items-center mb-9px">
        <template v-for="(item, index) in homeTopData" :key="index">
          <div
            class="flex flex-col flex-justify-center flex-items-center flex-1 bg-#fff bg-opacity-70 h-82px rd-7px"
            :class="{ 'mr-7px': index !== homeTopData.length - 1 }"
          >
            <div class="text-28px font-500">{{ item.value }}</div>
            <div class="text-12px font-400">{{ item.label }}</div>
          </div>
        </template>
      </div>
    </div>

    <!--  分页展示 -->
    <div class="px-7px py-19px rd-7px bg-#fff bg-opacity-70">
      <div class="flex mb-17px pl-8px text-#010202 font-600 text-16px">
        <div
          v-for="(item, index) in tabs"
          :key="item.key"
          :class="['flex-none', { 'ml-20px': index !== 0 }]"
          @click="active = index + 1"
        >
          <van-badge
            :content="setBadge(item.key)"
            :offset="[10, 0]"
            :show-zero="false"
            :max="99"
            color="#C9322E"
          >
            <span
              class="pb-5px"
              :class="{ active: active === index + 1 }"
              :show-zero="false"
            >
              {{ item.label }}
            </span>
          </van-badge>
        </div>
      </div>
      <div v-if="active > 0" class="overflow-hidden">
        <component
          :is="active === 1 ? ServeCard : active === 2 ? ServeCard : Develop"
          :key="active"
          :order-status="active === 1 ? '2' : active === 2 ? '3' : null"
          background="#f4f4f4"
          border-radius="7px"
          :height="300"
          show-customer
        />
        <gap :height="50" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
// @import '@/assets/styles/profile.scss';
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #d3e5ff 0%, #ffffff 63%, #ffffff 100%);
  padding: 0 12px;

  .nav-bar-con {
    height: 46px;
  }

  .active {
    border-bottom: 4px solid #0f62fe;
  }
}

// 修改导航栏样式
:deep(.van-nav-bar) {
  background: #d3e5ff;

  .van-nav-bar__content {
    .van-nav-bar__title {
      color: #010202;
    }
  }
}

.wechat_pt {
  padding-top: 18px;
}
.wechat_mt {
  margin-top: 18px;
}
</style>
