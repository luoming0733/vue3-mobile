<template>
  <div class="card-warp m-10px bg-#fff">
    <div
      class="title flex flex-justify-between flex-items-center h-44px mx-12px font-600 text-15px text-#333 box-border"
    >
      <div class="code-title">旅程开始信息</div>
      <div class="code-item"></div>
    </div>
    <div class="py-10px">
      <van-form v-if="isEdit" ref="startInfoFormRef" label-width="120">
        <van-field
          v-model="formData.startDashboardUrl"
          :border="false"
          name="开始用车仪表盘"
          label="开始用车仪表盘"
          input-align="right"
          :rules="[{ required: true, message: '请上传凭证' }]"
        >
          <template #input>
            <div
              v-if="!formData.startDashboardUrl"
              class="upload-btn flex flex-col flex-justify-center flex-items-center w-69px h69px bg-#fff b-rd-3px b-1px b-#e5e5e5 b-solid"
              @click="uploadImageHandle('startPanels')"
            >
              <van-icon name="plus" size="28" color="#d8d8d8" />
              <span class="font-400 text-13px lh-18px text-#d8d8d8"
                >上传凭证</span
              >
            </div>
            <div v-else class="w69px h69px">
              <van-image
                width="100%"
                height="100%"
                :src="formData.startDashboardUrl"
                @click="ImagePreview(formData.startDashboardUrl)"
              />
            </div>
          </template>
        </van-field>
        <van-field
          v-model="formData.startMileage"
          name="开始里程"
          label="开始里程"
          placeholder="请输入"
          class="my-field"
          :border="false"
          type="number"
          :rules="[{ required: true, message: '请输入开始公里数' }]"
        >
          <template #right-icon>
            <span>Km</span>
          </template>
        </van-field>
        <van-field
          v-model="formData.departureLocation"
          name="出发地"
          label="出发地"
          placeholder="请点击按钮获取"
          readonly
          clearable
          :border="false"
          rows="1"
          autosize
          type="textarea"
          class="my-field my-field-border"
          :rules="[{ required: true, message: '请输入出发地' }]"
          @click-right-icon="goMap('start')"
          @click="goMap('start')"
        >
          <template #right-icon>
            <van-icon name="location" color="#0F62FE" />
          </template>
        </van-field>
      </van-form>

      <div v-else class="text-14px px-12px">
        <div class="flex flex-justify-between mt-5px">
          <div class="w-130px flex-none text-#949596">开始用车仪表盘</div>
          <div class="text-#333333">
            <div
              class="w69px h69px"
              @click="ImagePreview(data.startDashboardUrl)"
            >
              <van-image
                width="100%"
                height="100%"
                :src="data.startDashboardUrl"
              >
                <template #loading>
                  <van-loading type="spinner" size="20" />
                </template>
                <template #error>加载失败</template>
              </van-image>
            </div>
          </div>
        </div>
        <div class="flex flex-justify-between mt-15px">
          <div class="w-120px flex-none text-#949596">开始里程</div>
          <div class="text-#333333">{{ data.startMileage }}Km</div>
        </div>
        <div class="flex flex-justify-between mt-15px mb-5px">
          <div class="w-120px flex-none text-#949596">出发地</div>
          <div class="text-#333333">
            {{ data.departureLocation }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { showImagePreview, showLoadingToast, showToast } from 'vant'
import { defineExpose, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { commonApi } from '@/apis'
import { CONST_ROUTES } from '@/constants'
import { ResultEnum } from '@/enums/httpEnum'
import { base64ToFile } from '@/utils'
import jsBridge from '@/utils/jsBridge'

defineOptions({
  name: 'OrderInfo'
})

defineProps({
  isEdit: {
    type: Boolean,
    default: false
  },
  data: {
    type: Object,
    default: () => {}
  }
})

// 表单数据
const formData = ref({
  startDashboardUrl: '',
  startMileage: '',
  departureLocation: ''
})

const route = useRoute()
const router = useRouter()

const startInfoFormRef = ref<any>(null)

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
      formData.value.departureLocation = data.address
    } else {
      showToast({ message: message || '获取地址失败' })
    }
  } catch (err: unknown) {
    console.error(err as Error)
  }
}

// 点击上传开始用车仪表盘
const uploadImageHandle = (type: string) => {
  jsBridge.callHandler('doCamera', { type }, (responseData: string) => {
    console.log(responseData)
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

// 处理图片
const handleAndroidImage = (dataString: string) => {
  const dataObj = JSON.parse(dataString)
  const type = JSON.parse(dataObj.expend).type
  const content = `data:image/jpeg;base64,${dataObj.base64List[0].base64}`
  const fileName = dataObj.base64List[0].name
  const file = base64ToFile(content, fileName)
  uploadFile(file, type)
}

// 上传文件到服务器
const uploadFile = async (file: File, type: string) => {
  const fileData = new FormData()
  fileData.append('file', file)
  fileData.append('type', '2')
  const uploadLoadingToast = showLoadingToast({
    message: '正在上传图片...',
    forbidClick: true
  })
  try {
    const res = await commonApi.uploadFile(fileData)
    if (res.code === ResultEnum.SUCCESS) {
      if (type === 'startPanels') {
        formData.value.startDashboardUrl = res.data[0]
      }
    } else {
      showToast(res.message)
    }
  } catch (error) {
    console.log(error)
  } finally {
    uploadLoadingToast.close()
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

defineExpose({ formData, startInfoFormRef })

onMounted(() => {
  receiveAppData()
})
</script>

<style scoped lang="scss">
.card-warp {
  box-shadow: 1px 1px 5px 0px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e5e5;
  .title {
    border-bottom: 1px solid #d8d8d8;
  }
}
// 修改vant输入框样式
:deep(.my-field) {
  box-sizing: border-box;
  padding: 4px 12px;
  .van-field__body {
    background: #fff;
    border-radius: 3px;
    border: 1px solid #e5e5e5;
    flex: 0 0 auto;
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
:deep(.my-field-border) {
  .van-field__body {
    .van-field__right-icon {
      background: #fff;
      border-left: none;
    }
  }
}
</style>
