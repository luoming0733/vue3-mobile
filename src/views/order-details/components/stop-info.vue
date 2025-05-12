// 停靠点信息
<template>
  <div class="card-warp m-10px px-10px py-15px bg-#fff">
    <van-form v-if="isEdit" label-width="120">
      <van-field
        v-model="formData.stopName"
        name="中途停靠点"
        label="中途停靠点"
        placeholder="请输入中途停靠点"
        :border="false"
        rows="1"
        autosize
        type="textarea"
        class="my-field my-field-border p-0 mt-10px"
        input-align="right"
        @click-right-icon="goMap('stop')"
      >
        <template #right-icon>
          <van-icon name="location" color="#0F62FE" />
        </template>
      </van-field>
    </van-form>
    <div v-else>
      <div
        v-for="(item, index) in data"
        :key="index"
        class="flex flex-justify-between mb-10px text-14px font-400"
      >
        <div class="text-#949596 w-120px flex-none">中途停靠点</div>
        <div class="text-#333333">{{ item.stopName }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { showToast } from 'vant'
import type { PropType } from 'vue'
import { defineExpose, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { commonApi } from '@/apis'
import { CONST_ROUTES } from '@/constants'
import { ResultEnum } from '@/enums/httpEnum'
import jsBridge from '@/utils/jsBridge'

defineProps({
  // 状态是否是编辑
  isEdit: {
    type: Boolean,
    default: false
  },
  data: {
    type: Array as PropType<any[]>,
    default: () => []
  }
})

const route = useRoute()
const router = useRouter()

const formData = ref({
  stopName: '', // 停靠点名称或描述
  longitude: '', // 经度
  latitude: '' // 纬度
})

// 调用jsBridge获取用户经纬度。
const getLocation = () => {
  jsBridge.callHandler(
    'getLongitudeAndLatitude',
    { param: '获取手机经纬度' },
    (responseData: string) => {
      if (!responseData) {
        showToast({ message: '获取地址失败' })
        return
      }
      try {
        const { longitude, latitude, locationType } = JSON.parse(responseData)
        formData.value.longitude = longitude
        formData.value.latitude = latitude
        getAddressByLongLat(longitude, latitude) // 修复了 longitude 的重复传递
      } catch (error) {
        console.error('解析响应数据失败:', error)
      }
    }
  )
}

// 根据经纬度查询地址
const getAddressByLongLat = async (longitude: string, latitude: string) => {
  if (!longitude || !latitude) return showToast({ message: '获取地址失败' })
  try {
    const params = {
      longitude,
      latitude,
      version: '2.0',
      appkey: import.meta.env.VITE_AMAP_KEY
    }
    const {
      code,
      data,
      message
    }: { code: string; data: any; message: string } =
      await commonApi.getAddressByLongLat({
        params
      })
    if (code === ResultEnum.SUCCESS) {
      formData.value.stopName = data.address
    } else {
      showToast({ message: message || '获取地址失败' })
    }
  } catch (err: unknown) {
    console.error(err as Error)
  }
}

const emit = defineEmits(['updateEditStatus'])

// 前往地图选择位置
const goMap = (type: string) => {
  const { orderStatus, orderNumber, subOrderSerialNo } = route.query
  router.push({
    name: CONST_ROUTES.SELECT_ADDRESS.name,
    query: {
      type: type,
      backPath: '/orderDetails',
      orderStatus,
      orderNumber,
      subOrderSerialNo
    }
  })
}

defineExpose({ formData })
</script>

<style lang="scss" scoped>
.card-warp {
  box-shadow: 1px 1px 5px 0px rgba(0, 0, 0, 0.1);
  .content {
    &:last-child {
      margin: 0;
    }
  }
}

:deep(.my-field) {
  &.my-field-border {
    .van-cell__value {
      border-radius: 3px;
    }
  }
  .van-cell__value {
    padding: 5px 10px;
    border: 1px solid #e5e5e5;
    border-radius: 3px 0 0 3px;
    .van-field__control--right {
      text-align: left;
    }
  }
}
</style>
