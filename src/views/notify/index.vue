/**消息中心 */
<script lang="ts" setup>
import { onMounted, ref } from 'vue'

import { noticeApi } from '@/apis'
// import develop from '@/components/other-page/develop.vue'
import emptyPage from '@/components/other-page/empty-page.vue'
import { CONST_ROUTES } from '@/constants'
import { ResultEnum } from '@/enums'
import { getSession, isWeChatBrowser, onClickNavTitle } from '@/utils'
import { formatToDateTime } from '@/utils'
import jsBridge from '@/utils/jsBridge'

defineOptions({
  name: CONST_ROUTES.NOTIFY.name
})

const searchForm = ref({
  page: 1,
  size: 15,
  messageType: null,
  status: null
})

const isErrorPage = ref(false)
const errorPageDescription = ref('')
const errorType = ref('default')
const isRefresh = ref(false)

const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const notifyList = ref<any[]>([])
const total = ref(0)

const emit = defineEmits(['update:refresh', 'refresh:status'])

const getNotifyList = async () => {
  const REFRESH_TIMEOUT = 500

  try {
    const params = {
      orderNo_like: '',
      page: searchForm.value.page,
      size: searchForm.value.size,
      messageType: searchForm.value.messageType,
      status: searchForm.value.status,
      sendType: 2,
      order: 'desc',
      sort: 'createDate'
    }
    const res = await noticeApi.getNoticeList(params)
    if (res.code !== ResultEnum.SUCCESS || res.data.total === 0) {
      isErrorPage.value = true
      errorPageDescription.value =
        res.code === ResultEnum.FAIL ? res.message : '暂无消息！'
      errorType.value = 'network'
      loading.value = false
      finished.value = true
      isRefresh.value = false
      return
    }
    if (searchForm.value.page === 1) {
      notifyList.value = res.data.records
    } else {
      notifyList.value.push(...res.data.records)
    }

    total.value = res.data.total
    if (notifyList.value.length >= total.value) {
      finished.value = true
    }
    loading.value = false
    isErrorPage.value = false
    isRefresh.value = false
  } catch (err) {
    isErrorPage.value = true
    isRefresh.value = true
    finished.value = true
    loading.value = false
    errorPageDescription.value = (err as Error).message
    errorType.value = 'network'
  } finally {
    setTimeout(() => {
      refreshing.value = false
    }, REFRESH_TIMEOUT)
    emit('update:refresh', false)
  }
}

const onLoad = () => {
  if (notifyList.value.length < total.value) {
    searchForm.value.page++
  }
  getNotifyList()
}

const onRefresh = () => {
  finished.value = false
  loading.value = true
  onLoad()
  emit('update:refresh', false)
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

const calculateMessageType = (type: number) => {
  const messageTypeMap: { [key: number]: string } = {
    12: '约定时间提醒',
    13: '出车提醒',
    14: '开始服务提醒',
    15: '新订单提醒',
    16: '抢单提醒',
    17: '派单通知',
    18: '改派审核通过',
    19: '改派审核不通过',
    20: '司机出车',
    21: '司机到达约定地点',
    22: '司机开始服务',
    23: '司机中途停靠点',
    24: '司机结束服务',
    25: '改派申请',
    26: '订单出车超时预警',
    27: '订单计划超时预警',
    28: '订单待抢超时预警',
    29: '加盟商添加司机',
    30: '司机自行注册',
    31: '订单编辑未派司机',
    32: '开通云平台权限通知',
    33: '抢单',
    34: '订单派单超时预警',
    35: '编辑订单已派车司机',
    36: '订单用车性质变更申请',
    37: '订单用车性质审核通过',
    38: '订单用车性质审核不通过',
    39: '用车性质审核改派司机'
  }
  return messageTypeMap[type] || '其他'
}
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

const doExitApp = () => {
  jsBridge.callHandler('doExitApp', {}, (responseData: string) => {
    console.log(responseData)
  })
}

onMounted(() => {
  setStatusHeight()
  registerBackButton()
})
</script>

<template>
  <div class="page">
    <div v-if="!isWeChatBrowser" class="nav-bar-con">
      <van-nav-bar
        title="消息中心"
        :fixed="true"
        :placeholder="false"
        :safe-area-inset-top="false"
      >
        <template #title>
          <span @click="onClickNavTitle">消息中心</span>
        </template>
      </van-nav-bar>
    </div>
    <van-pull-refresh
      v-model="refreshing"
      class="pageRefresh"
      @refresh="onRefresh"
    >
      <empty-page
        v-if="isErrorPage"
        :description="errorPageDescription"
        :error-type="errorType"
        :is-refresh="isRefresh"
        height="80vh"
        @refresh="onRefresh"
      ></empty-page>
      <div v-else>
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <template v-for="item in notifyList" :key="item.serialNo">
            <div class="bg-#fff mt-10px p-18px pb-27px">
              <div class="flex flex-justify-between flex-items-center">
                <div class="text-#333333 text-14px">
                  {{ calculateMessageType(item.messageType) }}
                  <van-badge
                    v-if="item.status === 0 && false"
                    dot
                    :offset="[-2, 0]"
                  />
                </div>

                <div class="text-#949596 text-13px">
                  {{ formatToDateTime(item.createDate, 'yyyy-MM-dd') }}
                </div>
              </div>
              <div class="text-#949596 mt-9px text-13px">
                <span>服务时间:</span>
                <span>
                  {{ formatToDateTime(item.createDate, 'yyyy-MM-dd HH:mm') }}
                </span>
              </div>
              <div class="text-#414244 text-13px mt-9px">
                {{ item.messageContent }}
              </div>
            </div>
          </template>
        </van-list>
      </div>
    </van-pull-refresh>
  </div>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding-bottom: 60px;
  background: #f4f4f4;
  .nav-bar-con {
    height: 46px;
  }
}

:deep(.pageRefresh) .van-pull-refresh__track {
  min-height: calc(100vh - 140px);
}
</style>
