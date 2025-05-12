<script setup lang="ts">
import { showLoadingToast, showToast } from 'vant'
import { onMounted, ref, watch } from 'vue'

import { orderApi } from '@/apis'
import emptyPage from '@/components/other-page/empty-page.vue'
import loadPage from '@/components/other-page/load-page.vue'
import { ResultEnum } from '@/enums/httpEnum'
import { useBadgeStore, useFilterOrderStore, useTabBadgeStore } from '@/store'

import { GrabItem } from './index'

defineOptions({ name: 'ServerCard' })

const props = defineProps({
  orderStatus: { type: String, default: 'all' },
  refresh: { type: Boolean, default: false },
  background: { type: String, default: '#fff' },
  height: { type: [String, Number], default: '80vh' },
  borderRadius: { type: [String, Number], default: '0' },
  showCustomer: { type: Boolean, default: false }
})

const pageLoad = ref(false)
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const list = ref<any[]>([])
const pageNumber = ref(1)
const pageSize = ref(100)
const total = ref(0)
const errorPageDescription = ref('')
const isErrorPage = ref(false)
const errorType = ref('default')
const isRefresh = ref(false)

const emit = defineEmits(['update:refresh', 'refresh:status'])

/**
 * Load more data when the page is scrolled to the bottom.
 *
 * @returns {void}
 */
const onLoad = () => {
  if (list.value.length < total.value) {
    pageNumber.value++
  }
  fetchDriverOrderList()
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
 * 获取待服务订单数量
 *
 * @returns {Promise<void>}
 */
const getPendingOrderNumber = async (): Promise<void> => {
  try {
    const { code, data } = await orderApi.pendingOrderCount()
    useBadgeStore().setBadge(
      code === ResultEnum.SUCCESS && data > 0 ? data.toString() : ''
    )
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

const fetchDriverOrderList = async (): Promise<any> => {
  try {
    const isFilter = useFilterOrderStore().isFilter
    const res = await orderApi.getDriverGrabOrderList({
      includeGrabbed: !isFilter,
      page: pageNumber.value,
      size: pageSize.value
    })

    if (res.code !== ResultEnum.SUCCESS) {
      isErrorPage.value = true
      errorPageDescription.value =
        res.code === ResultEnum.FAIL ? res.message : '暂无待抢订单！'
      errorType.value = 'network'
      loading.value = false
      finished.value = true
      return Promise.resolve(null) // Return a resolved promise with null
    }
    getPendingOrderNumber()
    const data = res.data.records
    if (data === null || data.length === 0) {
      isErrorPage.value = true
      errorPageDescription.value = '暂无待抢订单！'
      finished.value = true
      isRefresh.value = false
      return Promise.resolve(null) // Return a resolved promise with null
    }
    if (pageNumber.value === 1) {
      list.value = data
    } else {
      list.value = [list.value, ...data] as any[]
      total.value = res.data.total
    }
    if (list.value.length >= total.value) {
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
    }, 200)
    // 不管成功还是失败，都要重置刷新状态
    emit('update:refresh', false)
    pageLoad.value = false
  }
}

// 刷新当前列表数据。
const refreshOnChange = ({ status }: { status: string }) => {
  emit('refresh:status', status)
}

/**
 * 抢单
 * @param {object} item - 当前订单的信息
 * @throws {Error} - 如果抢单失败，抛出一个Error对象
 */
const rushOrder = async (item: any) => {
  const loadingToast = showLoadingToast({ message: '处理中...' })
  try {
    const { serialNo, subOrderSerialNo, isGabEnabled } = item
    const params = { orderSerialNo: serialNo, subOrderSerialNo, isGabEnabled }
    const res = await orderApi.operateOrder(params, 'driverGrabOrder')
    if (res.code !== ResultEnum.SUCCESS) {
      showToast({ message: res.message })
      return
    }
    showToast({ message: '抢单成功' })
    onRefresh()
  } catch (err) {
    throw new Error(err as string)
  } finally {
    // loadingToast.close()
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

onMounted(() => {
  pageLoad.value = true
  fetchDriverOrderList()
})
</script>

<template>
  <div class="px-10px">
    <van-pull-refresh
      v-if="!pageLoad"
      v-model="refreshing"
      class="page-refresh"
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
        <!-- 错误页面 -->
        <empty-page
          v-if="isErrorPage"
          :description="errorPageDescription"
          :error-type="errorType"
          :is-refresh="isRefresh"
          :height="height"
          @refresh="onRefresh"
        />
        <!-- 列表内容 -->
        <div v-else>
          <template v-for="item in list" :key="item.serialNo">
            <grab-item :data="item" @rush-order="rushOrder" />
          </template>
        </div>
      </van-list>
    </van-pull-refresh>
    <!-- 加载中页面 -->
    <load-page v-else />
  </div>
</template>

<style scoped lang="scss">
:deep(.page-refresh) .van-pull-refresh__track {
  min-height: calc(100vh - 140px);
}

.order-item {
  background: #ffffff;

  border: 1px solid;
  border-image: linear-gradient(
      180deg,
      rgba(159, 160, 163, 1),
      rgba(255, 255, 255, 1)
    )
    1 1 0 1;
  border-radius: 7px;
  margin: 7px 0 14px 0;
  padding: 18px 12px;
  box-sizing: border-box;
  .content {
    background-color: #f4f4f4;
    padding: 12px 12px 16px 12px;
    margin-top: 11px;
  }
  .tags-box {
    display: flex;
    margin-top: 9px;
    .tags {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 17px;
      background: #ffffff;
      border-radius: 2px;
      border: 1px solid #d8d8d8;
      font-size: 10px;
      color: #949596;
      padding: 1px 6px;
      margin-right: 3px;
    }
  }
}
</style>
