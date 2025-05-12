<template>
  <div>
    <van-pull-refresh
      v-model="refreshing"
      class="pageRefresh"
      @refresh="onRefresh"
      @change="refreshOnChange"
    >
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text=""
        :immediate-check="true"
        @load="onLoad"
      >
        <empty-page
          v-if="isErrorPage"
          :description="errorPageDescription"
          :error-type="errorType"
          :is-refresh="isRefresh"
          :height="height"
          @refresh="onRefresh"
        ></empty-page>
        <div v-else>
          <div
            v-for="(item, index) in list"
            :key="index"
            class="mb-10px"
            :class="{ 'mt-10px': index === 0 }"
            :style="{ background, borderRadius }"
            @click="gotoOrderDetails(item)"
          >
            <div class="pt-13px pb-10px px-15px">
              <div class="flex justify-between items-center text-12px mb-5px">
                <div>
                  <van-icon name="clock" class="mr-5px" size="14" />
                  <span class="text-#333333 text-14px mr-5px">
                    {{ formatToDateTime(item.useStartDate, 'yyyy-MM-dd') }}
                  </span>
                  <span class="text-#606162 text-10px">
                    {{ formatToDateTime(item.useStartDate, 'HH:mm') }}
                  </span>
                </div>
                <div class="flex">
                  <div
                    class="triangle"
                    :class="calculateOrderStatusColor(Number(item.orderStatus))"
                  ></div>
                  <div
                    class="w-50px h-19px flex justify-center items-center"
                    :class="calculateOrderStatusColor(Number(item.orderStatus))"
                  >
                    <span class="text-#fff">
                      {{ calculateOrderStatus(Number(item.orderStatus)) }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="b-t-1 b-b-1 b-solid b-#E5E5E5 py-8px b-0">
                <div class="text-12px text-#333 mt-5px">
                  用车性质：{{ item.userType }}
                </div>
                <div class="flex justify-between text-10px my-10px">
                  <div class="text-#333">
                    <div>
                      <van-icon
                        name="location"
                        color="#0F62FE"
                        size="12"
                        class="mr-2px"
                      />
                      <span>
                        {{
                          item.departureLocation
                            ? item.departureLocation
                            : '听客户安排'
                        }}
                      </span>
                    </div>
                    <div class="mt-12px">
                      <van-icon
                        name="location"
                        color="#F56C6C"
                        size="12"
                        class="mr-2px"
                      />
                      <span>
                        {{ item.destination ? item.destination : '听客户安排' }}
                      </span>
                    </div>
                  </div>
                  <div v-show="!item.isGabEnabled" class="text-#9E9FA0">
                    <span>详情</span>
                    <van-icon name="arrow" color="text-#9E9FA0" />
                  </div>
                </div>
              </div>
              <div
                v-if="showCustomer"
                class="text-10px text-#9E9FA0 mt-11px mb-5px"
              >
                <span>客户代表：</span>
                <span>
                  {{ calculateCustomerNameAndPhone(item.customerMsg) }}
                </span>
              </div>
              <van-button
                v-show="item.isGabEnabled"
                type="primary"
                :disabled="+item.isGabEnabled === 0"
                block
                class="mt-23px mb-10px"
                @click.stop="rushOrder(item)"
              >
                抢单</van-button
              >
            </div>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
import { showLoadingToast, showToast } from 'vant'
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { orderApi } from '@/apis'
import emptyPage from '@/components/other-page/empty-page.vue'
import { CONST_ROUTES } from '@/constants'
import { ResultEnum } from '@/enums/httpEnum'
import { useBadgeStore, useDateFilterStore, useTabBadgeStore } from '@/store'
import {
  calculateCustomerNameAndPhone,
  calculateOrderStatus,
  calculateOrderStatusColor,
  formatToDateTime
} from '@/utils'

defineOptions({ name: 'ServerCard' })

const props = defineProps({
  orderStatus: {
    type: String,
    default: 'all'
  },
  refresh: {
    type: Boolean,
    default: false
  },
  background: {
    type: String,
    default: '#fff'
  },
  height: {
    type: [String, Number],
    default: '80vh'
  },
  borderRadius: {
    type: [String, Number],
    default: '0'
  },
  // 展示客户代表
  showCustomer: {
    type: Boolean,
    default: false
  }
})

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const list = ref<any[]>([])
const pageNumber = ref(1)
const pageSize = ref(10)
const total = ref(0)
const errorPageDescription = ref('')
const isErrorPage = ref(false)
const errorType = ref('default')
const isRefresh = ref(false)

const emit = defineEmits(['update:refresh', 'refresh:status'])

/**
 * Jump to the order details page.
 *
 * @param {object} item - The item which triggered the jump.
 * @returns {void}
 */
const gotoOrderDetails = (item: any) => {
  if (item.isGabEnabled) {
    return
  }
  // record the current route
  const backRouteName = String(route.name)
  router.push({
    name: CONST_ROUTES.ORDER_DETAILS.name,
    query: {
      orderStatus: props.orderStatus,
      subOrderSerialNo: item.subOrderSerialNo,
      orderNumber: item.serialNo,
      backRouteName
    }
  })
}

/**
 * Load more data when the page is scrolled to the bottom.
 *
 * @returns {void}
 */
const onLoad = () => {
  if (list.value.length < total.value) {
    pageNumber.value++
  }
  getDriverOrderList()
}

/**
 * 重新加载列表数据
 *
 * 1. 清空列表数据 finished 设为 false
 * 2. 触发父组件的 update:refresh 事件，emit('update:refresh', false)
 * 3. 重新加载数据，将 loading 设为 true，表示处于加载状态
 * 4. 调用 onLoad() 方法
 */
const onRefresh = () => {
  // 清空列表数据
  finished.value = false
  emit('update:refresh', false)
  // 重新加载数据 将 loading 设置为 true，表示处于加载状态
  loading.value = true
  onLoad()
}

/**
 * Fetches the number of pending orders and updates the badge accordingly.
 *
 * This function asynchronously calls the pendingOrderCount API to retrieve the
 * number of pending orders. If the call is successful and the count is greater
 * than zero, it updates the badge with the count. Otherwise, it clears the badge.
 *
 * @returns {Promise<void>} A promise that resolves when the badge is updated.
 */
const getPendingOrderNumber = async (): Promise<void> => {
  try {
    const { code, data } = await orderApi.pendingOrderCount()
    if (code === ResultEnum.SUCCESS && data > 0) {
      useBadgeStore().setBadge(data.toString())
    } else {
      useBadgeStore().setBadge('')
    }
  } catch (err) {
    throw new Error(err as string)
  }
}

/**
 * @dec 获取待服务和服务中的订单数量。
 *
 * 该函数异步获取订单数量，并更新标签徽章值。
 * 如果获取订单数量失败，则使用默认值更新标签徽章值。
 */
const getOrderCount = async (): Promise<void> => {
  const defaultData = {
    allOrders: 0,
    completeOrders: 0,
    inProgressOrders: 0,
    pendingOrders: 0
  }
  try {
    const { code, data, message } = await orderApi.orderCount()
    if (code !== ResultEnum.SUCCESS) {
      throw new Error(`获取订单数量失败，code：${code}，message：${message}`)
    }
    useTabBadgeStore().setBadge(data)
  } catch (err) {
    useTabBadgeStore().setBadge(defaultData)
    throw err
  }
}

/**
 * 根据提供的参数获取司机订单列表。
 *
 * @return {Promise<void>} 获取订单列表后的Promise。
 */
const getDriverOrderList = async () => {
  const REFRESH_TIMEOUT = 500
  try {
    const dateFilterStore = useDateFilterStore()
    const params: {
      driverSerialNo: string
      orderStatus: string
      page: number
      size: number
      serialNos: string[]
      useStartDate: string
      useEndDate: string
    } = {
      driverSerialNo: '',
      orderStatus: props.orderStatus,
      page: pageNumber.value,
      size: pageSize.value,
      serialNos: [],
      useStartDate: dateFilterStore.startDate,
      useEndDate: dateFilterStore.endDate
    }

    const res = await orderApi.getDriverMyOrderList(params)

    if (res.code !== ResultEnum.SUCCESS) {
      isErrorPage.value = true
      errorPageDescription.value =
        res.code === ResultEnum.FAIL ? res.message : '暂无服务订单！'
      errorType.value = 'network'
      loading.value = false
      finished.value = true
      return
    }

    getPendingOrderNumber()
    getOrderCount()

    const data = res.data.records
    if (data === null || data.length === 0) {
      isErrorPage.value = true
      const statusMap: { [key: string]: string } = {
        '2': '暂无待服务订单！',
        '3': '暂无执行中订单！',
        '4': '暂无已完成订单！',
        default: '暂无订单！'
      }
      errorPageDescription.value =
        statusMap[props.orderStatus] || statusMap.default
      finished.value = true
      isRefresh.value = false
      return
    }
    if (pageNumber.value === 1) {
      list.value = data
    } else {
      list.value = [...list.value, ...data]
    }
    total.value = res.data.total
    if (list.value.length === total.value) {
      finished.value = true
    }
    loading.value = false
    isErrorPage.value = false
    isRefresh.value = false
  } catch (err: unknown) {
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
    // 不管成功还是失败，都要重置刷新状态
    emit('update:refresh', false)
  }
}

// 处理错误
const handleError = (error: any) => {
  isErrorPage.value = true
  errorPageDescription.value = getErrorMessage(error)
  errorType.value = 'network'
  loading.value = false
  finished.value = true
}

// 获取错误消息文字
const getErrorMessage = (error: any) => {
  return error?.message || '未知错误'
}

// 刷新当前列表数据。
const refreshOnChange = ({ status }: { status: string }) => {
  emit('refresh:status', status)
}

// 抢单 driverGrabOrder
const rushOrder = async (item: any) => {
  if (!item.orderProcessStatus || +item.orderProcessStatus === 0) {
    const loadingToast = showLoadingToast({ message: '处理中...' })
    try {
      const { serialNo, subOrderSerialNo } = item
      const params = { orderSerialNo: serialNo, subOrderSerialNo }
      const res = await orderApi.operateOrder(params, 'driverGrabOrder')
      if (res.code !== ResultEnum.SUCCESS) {
        showToast({ message: res.message })
      }
      showToast({ message: '抢单成功' })
      onRefresh()
    } catch (err) {
      throw new Error(err as string)
    } finally {
      loadingToast.close()
    }
  }
}

// 观察 refresh 的变化，如果为 true，则调用 onRefresh()
watch(
  () => props.refresh,
  () => {
    if (props.refresh) {
      onRefresh()
      emit('update:refresh', false)
    }
  }
)

// 观察 dateFilterStore 的变化，如果有变化，则重新获取数据
watch(
  () => useDateFilterStore(),
  () => {
    getDriverOrderList()
  },
  { deep: true }
)
</script>

<style scoped lang="scss">
:deep(.pageRefresh) .van-pull-refresh__track {
  min-height: calc(100vh - 140px);
}

.title {
  background: linear-gradient(90deg, #dde3f9 0%, #ffffff 100%);
  .my-btn {
    border: 1px solid rgba(15, 98, 254, 0.37);
  }
}

.triangle {
  width: 19px;
  height: 19px;
  clip-path: polygon(102% 0, 0 100%, 102% 100%);
}

// 待服务
.danger {
  background: #f56c6c;
}
// 服务中
.warning {
  background: #f99811;
}
// 已完成
.default {
  background: #aab0b6;
}
</style>
