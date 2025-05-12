// 我的车辆
<script setup lang="ts">
import { showLoadingToast } from 'vant'
import { ref } from 'vue'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { vehicleApi } from '@/apis'
import emptyPage from '@/components/other-page/empty-page.vue'
import { CONST_ROUTES } from '@/constants'
import { ResultEnum } from '@/enums'
import { isWeChatBrowser, registerBackButton, setStatusHeight } from '@/utils'

const router = useRouter()

const isEmpty = ref(false)
const emptyDescription = ref('暂无车辆')

const vehicleList = ref<any>([])

// 返回
const onClickLeft = () => {
  router.back()
}

/**
 * 处理列表为空的情况
 */
const handleEmptyResponse = () => {
  emptyDescription.value = '暂无车辆'
  isEmpty.value = true
}

/**
 * 处理列表错误的情况
 * @param message - 错误信息
 */
const handleErrorResponse = (message: string) => {
  emptyDescription.value = message
  isEmpty.value = true
}

/**
 * 获取我的车辆列表
 * @description
 * 1. 如果code不为ResultEnum.SUCCESS,则展示错误信息
 * 2. 如果data为空,则展示暂无车辆信息
 * 3. 如果data不为空,则展示车辆列表
 * @throws {Error} 如果出现了错误，则 throw 一个Error对象
 */
const getMyVehicleList = async () => {
  const listLoading = showLoadingToast({
    message: '加载中...',
    forbidClick: true
  })
  try {
    const { code, data, message } = await vehicleApi.getMyVehicle()
    if (code !== ResultEnum.SUCCESS) {
      handleErrorResponse(message)
      return
    }
    if (data?.length === 0) {
      handleEmptyResponse()
      return
    }
    isEmpty.value = false
    vehicleList.value = data
  } catch (error) {
    handleErrorResponse('获取车辆列表时出现错误，请稍后重试')
  } finally {
    listLoading.close()
  }
}

// 打开车辆详情
const onClickVehicle = (item: any) => {
  router.push({
    path: CONST_ROUTES.MY_VEHICLE_DETAILS.path,
    query: {
      vehicleDetail: JSON.stringify(item)
    }
  })
}

// 添加车辆
const onClickRightAddVehicle = () => {
  router.push({
    path: CONST_ROUTES.MY_VEHICLE_DETAILS.path,
    query: {
      vehicleDetail: 'add'
    }
  })
}

onMounted(() => {
  setStatusHeight()
  registerBackButton(onClickLeft)
  getMyVehicleList()
})
</script>
<template>
  <div class="page">
    <div v-if="!isWeChatBrowser" class="nav-bar-con">
      <van-nav-bar
        title="我的车辆"
        :fixed="true"
        :placeholder="false"
        :safe-area-inset-top="false"
        @click-left="onClickLeft"
        @click-right="onClickRightAddVehicle"
      >
        <template #left>
          <van-icon name="arrow-left" size="22" />
        </template>
        <template #right>
          <van-icon name="plus" size="22" />
        </template>
      </van-nav-bar>
    </div>
    <empty-page
      v-if="isEmpty && !isWeChatBrowser"
      :description="emptyDescription"
    />
    <div v-else class="p-17px">
      <template v-for="item in vehicleList" :key="item.id">
        <div
          class="bg-#fff h-69px rd-7px px-20px py-15px box-border flex flex-justify-between flex-items-center mb-10px"
          @click="onClickVehicle(item)"
        >
          <div class="flex flex-items-center">
            <svg class="mr-10px w-35px" aria-hidden="true">
              <use xlink:href="#icon-che"></use>
            </svg>
            <div class="flex flex-col flex-justify-between text-#333">
              <div class="text-14px font-600">
                {{ `${item.vehicleTypeName}-${item.carModelName}` }}
              </div>
              <div class="text-10px mt-4px">{{ item.licensePlate }}</div>
            </div>
          </div>
          <van-icon name="arrow" />
        </div>
      </template>
      <van-button
        v-if="isWeChatBrowser"
        block
        class="w-full b-none b-0"
        @click="onClickRightAddVehicle"
      >
        <van-icon name="plus" size="20" />
      </van-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background-color: #f4f4f4;
  .nav-bar-con {
    height: 46px;
  }
}

.submit-password-btn {
  position: fixed;
  width: 100%;
  left: 0;
  bottom: 100px;
  padding: 0 30px;
  box-sizing: border-box;
}
</style>
