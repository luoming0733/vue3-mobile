// 旅程结束信息 总程信息
<template>
  <div class="m-10px bg-#fff b-solid b-1px b-#e5e5e5">
    <div
      class="flex flex-justify-between flex-items-center h-44px mx-12px font-600 text-15px text-#333 box-border b-solid b-0 b-b-1px b-#e5e5e5"
    >
      <div class="code-title">旅程结束信息</div>
      <div class="code-item"></div>
    </div>
    <div class="py-10px">
      <van-form v-if="isEdit" ref="endInfoFormRef">
        <van-field
          v-model="formData.endDashboardUrl"
          class="pr-12px"
          name="结束用车仪表盘"
          label="结束用车仪表盘"
          label-width="120"
          :border="false"
          input-align="right"
          :rules="[{ required: true, message: '请上传凭证' }]"
        >
          <template #input>
            <div
              v-if="!formData.endDashboardUrl"
              class="flex flex-col flex-items-center flex-justify-center w-69px h-69px bg-#fff b-rd-3px b-#e5e5e5 b-solid b"
              @click="uploadImageHandle('endDashboardUrl')"
            >
              <van-icon name="plus" size="28" color="#d8d8d8" />
              <span class="text-14px text-#d8d8d8 lh-18px">上传凭证</span>
            </div>
            <div v-else class="w-69px h-69px">
              <van-image
                width="100%"
                height="100%"
                :src="formData.endDashboardUrl"
                @click="ImagePreview(formData.endDashboardUrl)"
              />
            </div>
          </template>
        </van-field>
        <van-field
          v-model="formData.endMileage"
          name="结束里程"
          label="结束里程"
          placeholder="请输入结束里程"
          class="my-field"
          :border="false"
          type="number"
          :min="+formData.startMileage"
          :rules="[{ required: true, message: '请输入结束里程' }]"
          @update:model-value="changeEndMileage"
        >
          <template #right-icon>
            <span>km</span>
          </template>
        </van-field>
        <van-field
          v-model="formData.destinationLocation"
          name="目的地"
          label="目的地"
          placeholder="请选择目的地"
          :border="false"
          rows="1"
          autosize
          type="textarea"
          readonly
          class="my-field my-field-border"
          :rules="[{ required: true, message: '请选择目的地' }]"
          @click-right-icon="goMap('end')"
        >
          <template #right-icon>
            <van-icon name="location" color="#0F62FE" />
          </template>
        </van-field>
      </van-form>

      <div v-else class="start-info text-14px px-12px">
        <div class="flex flex-justify-between mt-5px">
          <div class="w-120px flex-none text-#949596">结束用车仪表盘</div>
          <div class="text-#333333">
            <div
              class="w69px h69px"
              @click="ImagePreview(data.endDashboardUrl)"
            >
              <van-image
                width="100%"
                height="100%"
                :src="data.endDashboardUrl"
              ></van-image>
            </div>
          </div>
        </div>
        <div class="flex flex-justify-between mt-15px">
          <div class="w-120px flex-none text-#949596">结束里程</div>
          <div class="text-#333333">
            <span>{{ data.endMileage }}</span>
            <span>km</span>
          </div>
        </div>
        <div class="flex flex-justify-between mt-15px mb-5px content-item">
          <div class="w-120px flex-none text-#949596">目的地</div>
          <div class="text-#333333">{{ data.destinationLocation }}</div>
        </div>
      </div>
    </div>
  </div>

  <div class="m-10px bg-#fff b-solid b-1px b-#e5e5e5">
    <div
      class="flex flex-justify-between flex-items-center h-44px mx-12px font-600 text-15px text-#333 box-border b-solid b-0 b-b-1px b-#e5e5e5"
    >
      <div class="code-title">总程信息</div>
      <div class="code-item"></div>
    </div>
    <div class="py-10px">
      <van-form v-if="isEdit" ref="totalInfoFormRef" v-model="formData">
        <van-field
          v-model="formData.startMileage"
          class="my-field my-field-disabled"
          readonly
          :border="false"
          type="number"
          name="开始公里数"
          label="开始公里数"
          placeholder="请输入"
          :rules="[{ required: true, message: '请输入开始公里数' }]"
        >
          <template #right-icon>
            <div>km</div>
          </template>
        </van-field>
        <van-field
          v-model="formData.endMileage"
          class="my-field my-field-disabled"
          readonly
          :border="false"
          type="number"
          name="结束公里数"
          label="结束公里数"
          placeholder="请输入"
          :rules="[{ required: true, message: '请输入结束公里数' }]"
        >
          <template #right-icon>
            <div>km</div>
          </template>
        </van-field>
        <van-field
          v-model="formData.mileage"
          class="my-field my-field-disabled"
          readonly
          :border="false"
          type="number"
          name="实际公里数"
          label="实际公里数"
          placeholder="请输入"
          :rules="[{ required: true, message: '请输入实际公里数' }]"
        >
          <template #right-icon>
            <span>km</span>
          </template>
        </van-field>
        <van-field
          v-model="formData.parkingFee"
          class="my-field"
          :border="false"
          type="number"
          name="停车费"
          label="停车费"
          placeholder="请输入"
          :rules="[{ required: true, message: '请输入停车费' }]"
        >
          <template #right-icon>
            <span>元</span>
          </template>
        </van-field>
        <van-field
          v-model="formData.stopFeeUrl"
          :border="false"
          name="停车费URL"
          class="pl-12px"
          label=" "
          :rules="[
            { required: formData.parkingFee > 0, message: '请上传凭证' }
          ]"
        >
          <template #input>
            <div
              v-if="!formData.stopFeeUrl"
              class="flex flex-col flex-items-center flex-justify-center w-69px h-69px bg-#fff b-rd-3px b-#e5e5e5 b-solid b"
              @click="uploadImageHandle('stopFeeUrl')"
            >
              <van-icon name="plus" size="28" color="#d8d8d8" />
              <span class="text-14px text-#d8d8d8 lh-18px">上传凭证</span>
            </div>
            <div v-else class="w-69px h-69px">
              <van-image
                width="100%"
                height="100%"
                :src="formData.stopFeeUrl"
                @click="ImagePreview(formData.stopFeeUrl)"
              />
            </div>
          </template>
        </van-field>
        <van-field
          v-model="formData.tollFee"
          class="my-field"
          type="number"
          :border="false"
          name="路桥费"
          label="路桥费"
          placeholder="请输入"
          :rules="[{ required: true, message: '请输入路桥费' }]"
        >
          <template #right-icon>
            <span>元</span>
          </template>
        </van-field>

        <van-field
          v-model="formData.tollFeeUrl"
          class="pl-12px"
          :border="false"
          name="路桥费URL"
          label=" "
          :rules="[{ required: formData.tollFee > 0, message: '请上传凭证' }]"
        >
          <template #input>
            <div
              v-if="!formData.tollFeeUrl"
              class="flex flex-col flex-items-center flex-justify-center w-69px h-69px bg-#fff b-rd-3px b-dashed b-#e5e5e5 b-solid b"
              @click="uploadImageHandle('tollFeeUrl')"
            >
              <van-icon name="plus" size="28" color="#d8d8d8" />
              <span class="text-14px text-#d8d8d8 lh-18px">上传凭证</span>
            </div>
            <div v-else class="w-69px h-69px">
              <van-image
                width="100%"
                height="100%"
                :src="formData.tollFeeUrl"
                @click="ImagePreview(formData.tollFeeUrl)"
              />
            </div>
          </template>
        </van-field>
        <van-field
          v-model="formData.fuelCost"
          type="number"
          class="my-field"
          :border="false"
          name="燃油费"
          label="燃油费"
          :placeholder="
            Number(data.fuelCostIncluded) !== 1 ? '不含燃油费' : '请输入'
          "
          :disabled="Number(data.fuelCostIncluded) !== 1"
          :rules="[
            {
              required: Number(data.fuelCostIncluded) === 1,
              message: '请输入燃油费'
            }
          ]"
        >
          <template #right-icon>
            <span>元</span>
          </template>
        </van-field>
        <van-field
          v-model="formData.mealAllowance"
          class="my-field"
          type="number"
          :border="false"
          name="误餐费"
          label="误餐费"
          placeholder="请输入"
          :rules="[{ required: true, message: '请输入误餐费' }]"
        >
          <template #right-icon>
            <span>元</span>
          </template>
        </van-field>
        <van-field
          v-model="formData.otherExpenses"
          class="my-field"
          type="number"
          :border="false"
          name="其他费用"
          label="其他费用"
          placeholder="请输入"
          :rules="[{ required: true, message: '请输入其他费用' }]"
        >
          <template #right-icon>
            <span>元</span>
          </template>
        </van-field>
        <van-field
          v-model="formData.otherExpensesUrl"
          :border="false"
          class="pl-12px"
          name="其他费用URL"
          label=" "
          :rules="[
            { required: formData.otherExpenses > 0, message: '请上传凭证' }
          ]"
        >
          <template #input>
            <div
              v-if="!formData.otherExpensesUrl"
              class="flex flex-col flex-items-center flex-justify-center w-69px h-69px bg-#fff b-rd-3px b-#e5e5e5 b-solid b"
              @click="uploadImageHandle('otherExpensesUrl')"
            >
              <van-icon name="plus" size="28" color="#d8d8d8" />
              <span class="text-14px text-#d8d8d8 lh-18px">上传凭证</span>
            </div>
            <div v-else class="w-69px h-69px">
              <van-image
                width="100%"
                height="100%"
                :src="formData.otherExpensesUrl"
                @click="ImagePreview(formData.otherExpensesUrl)"
              />
            </div>
          </template>
        </van-field>
      </van-form>
      <div v-else class="px-12px">
        <div class="flex flex-justify-between mt-15px">
          <div class="text-#949596">开始公里数</div>
          <div class="text-#333333">
            <span>{{ data.endMileage }}</span>
            <span>Km</span>
          </div>
        </div>
        <div class="flex flex-justify-between mt-15px">
          <div class="text-#949596">结束公里数</div>
          <div class="text-#333333">
            <span>{{ data.endMileage }}</span>
            <span>Km</span>
          </div>
        </div>
        <div class="flex flex-justify-between mt-15px">
          <div class="text-#949596">实际公里数</div>
          <div class="text-#333333">
            <span>{{ data.endMileage }}</span>
            <span>km</span>
          </div>
        </div>
        <div class="flex flex-justify-between mt-15px">
          <div class="text-#949596">停车费</div>
          <div class="text-#333333">
            <span>{{ data.parkingFee }}</span>
            <span>元</span>
          </div>
        </div>
        <div class="flex flex-justify-between mt-15px">
          <div class="text-#949596">路桥费</div>
          <div class="text-#333333">
            <span>{{ data.tollFee }}</span>
            <span>元</span>
          </div>
        </div>
        <div class="flex flex-justify-between mt-15px">
          <div class="text-#949596">燃油费</div>
          <div class="text-#333333">
            <span>{{ data.fuelCost }}</span>
            <span>元</span>
          </div>
        </div>
        <div class="flex flex-justify-between mt-15px">
          <div class="text-#949596">误餐费</div>
          <div class="text-#333333">
            <span>{{ data.mealAllowance }}</span>
            <span>元</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { showImagePreview, showLoadingToast, showToast } from 'vant'
import { defineExpose, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { commonApi } from '@/apis'
import { CONST_ROUTES } from '@/constants'
import { ResultEnum } from '@/enums/httpEnum'
import { base64ToFile } from '@/utils'
import jsBridge from '@/utils/jsBridge'

const props = defineProps({
  isEdit: {
    type: Boolean,
    default: false
  },
  data: {
    type: Object,
    default: () => {}
  }
})

const route = useRoute()
const router = useRouter()

const formData = ref<any>({
  endDashboardUrl: '', // 结束用车仪表盘 URL
  endMileage: '' as number | '', // 结束里程数（单位：公里）
  destinationLocation: '', // 目的地
  startMileage: props.data.startMileage as number, // 开始里程数（单位：公里）
  mileage: '' as number | '', // 里程数（单位：公里）
  parkingFee: 0, // 停车费（单位：元）
  stopFeeUrl: '', // 停车费凭证 URL
  tollFee: 0, // 路桥费（单位：元）
  tollFeeUrl: '', // 路桥费凭证 URL
  fuelCost: 0, // 燃油费
  mealAllowance: 0, // 误餐费（单位：元）
  otherExpenses: 0, // 其他费用（单位：元）
  otherExpensesUrl: '' // 其他费用凭证 URL
})

// 获取定位
const getLocation = () => {
  jsBridge.callHandler(
    'getLongitudeAndLatitude',
    { param: '获取手机经纬度' },
    (responseData: any) => {
      if (!responseData) {
        showToast({ message: '获取地址失败' })
        return
      }
      try {
        const { longitude, latitude, locationType } = JSON.parse(responseData)
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
    }: {
      code: string
      data: { address: string; city: string }
      message: string
    } = await commonApi.getAddressByLongLat({
      params
    })
    if (code === ResultEnum.SUCCESS) {
      formData.value.destinationLocation = data.address
    } else {
      showToast({ message: message || '获取地址失败' })
    }
  } catch (err: unknown) {
    console.error(err as Error)
  }
}

// 结束里程数修改时，计算里程数
const changeEndMileage = (val: number) => {}

const endInfoFormRef = ref<any>(null)
const totalInfoFormRef = ref<any>(null)

// 上传图片
const uploadImageHandle = (type: string) => {
  jsBridge.callHandler('doCamera', { type }, (responseData: string) => {
    console.log('doCamera', '---------------', responseData)
  })
}

// 接收APP传过来的数据
const receiveAppData = () => {
  jsBridge.registerHandler(
    'callCameraJs',
    (
      data: string,
      responseCallback: (responseData: { message: string }) => void
    ) => {
      // 处理图片
      handleAndroidImage(data)
      responseCallback({ message: 'callCameraJs callCameraJs success' })
    }
  )
}

/**
 * @dec 处理Android端传来的图片数据
 * @param {string} dataString - 图片数据字符串
 */
const handleAndroidImage = (dataString: string) => {
  const dataObj = JSON.parse(dataString)
  const type = JSON.parse(dataObj.expend).type
  const content = `data:image/jpeg;base64,${dataObj.base64List[0].base64}`
  const fileName = dataObj.base64List[0].name
  const file = base64ToFile(content, fileName)
  uploadFile(file, type)
}

/**
 * @dec 上传文件到服务器
 * @param {any} file - 上传的文件
 * @param {string} type - 上传文件的类型
 */
const uploadFile = async (file: any, type: string) => {
  const fileData = new FormData()
  fileData.append('file', file)
  fileData.append('type', '2')
  const toast = showLoadingToast({
    message: '正在上传图片...',
    forbidClick: true
  })
  try {
    const res = await commonApi.uploadFile(fileData)
    if (res.code === ResultEnum.SUCCESS) {
      const urlKey = {
        endDashboardUrl: 'endDashboardUrl',
        stopFeeUrl: 'stopFeeUrl',
        tollFeeUrl: 'tollFeeUrl',
        otherExpensesUrl: 'otherExpensesUrl'
      }[type]
      if (urlKey) {
        formData.value[urlKey] = res.data[0]
      }
    } else {
      showToast(res.message)
    }
  } catch (error) {
    console.log(error)
  } finally {
    toast.close()
  }
}

// 预览图片
const ImagePreview = (url: string) => {
  showImagePreview({
    images: [url],
    closeable: false
  })
}

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

// 结束里程数修改时，计算总里程数
watch(
  () => formData.value.endMileage,
  () => {
    formData.value.mileage =
      formData.value.endMileage - formData.value.startMileage
  }
)

onMounted(() => {
  receiveAppData()
})

defineExpose({ formData, endInfoFormRef, totalInfoFormRef })
</script>

<style lang="scss" scoped>
// 修改vant输入框样式
:deep(.my-field) {
  box-sizing: border-box;
  padding: 4px 12px;
  .van-field__body {
    background: #fff;
    border-radius: 3px;
    border: 1px solid #e5e5e5;
    .van-field__control {
      padding: 6px 0 6px 14px;
    }
    .van-field__right-icon {
      text-align: center;
      background: #f4f4f4;
      padding: 6px 14px 6px 10px;
      margin-right: 0;
      border-left: 1px solid #e5e5e5;
      width: 24px;
      flex: 0 0 auto;
      > div {
        height: 100%;
        font-weight: 400;
        font-size: 14px;
        color: #606162;
        line-height: 19px;
        text-align: left;
        font-style: normal;
      }
    }
  }
}
:deep(.my-field-disabled) {
  .van-field__body {
    background: #f4f4f4;
    color: #606162;
  }
}
:deep(.my-field-border) {
  .van-field__body {
    .van-field__right-icon {
      background: #fff;
      border-left: none;
    }
  }
}
</style>
