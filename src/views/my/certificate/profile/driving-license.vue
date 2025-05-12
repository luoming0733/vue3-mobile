<script setup lang="ts">
import { showImagePreview, showLoadingToast, showToast } from 'vant'
import { onMounted, ref } from 'vue'

import { commonApi } from '@/apis'
import idCardBackBgc from '@/assets/images/idCardBackBgc.png'
import idCardFrontBgc from '@/assets/images/idCardFrontBgc.png'
import { ResultEnum } from '@/enums/httpEnum'
import { base64ToFile, getSession } from '@/utils'
import jsBridge from '@/utils/jsBridge'

defineOptions({
  name: 'DrivingLicense'
})
const formData = ref({
  name: '',
  sex: '',
  idCardFront: '',
  idCardBack: '',
  cardType: '行驶证',
  idCardNumber: '',
  idCardValidity: '',
  address: ''
})

const showCardTypePicker = ref(false) // 证件类型
const showSexPicker = ref(false) // 性别
const showDatePicker = ref(false) // 日期选择
const showIdCardKeyboard = ref(false) // 身份证键盘
const imagePreviewShow = ref(false) // 图片预览

const cardTypeColumns = [
  { text: '身份证', value: 'idCard' },
  { text: '驾驶证', value: 'driveCard' },
  { text: '行驶证', value: 'driveCard' }
]

const sexColumns = [
  { text: '男', value: '男' },
  { text: '女', value: '女' }
]

const minDate = new Date()

const fromDataSubmitText = ref('提交')

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
const handleAndroidImage = async (dataString: string) => {
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
  const loading = showLoadingToast({
    message: '正在上传图片...',
    forbidClick: true
  })
  try {
    const res = await commonApi.uploadFile(fileData)
    if (res.code === ResultEnum.SUCCESS) {
      if (type === 'front') {
        formData.value.idCardFront = res.data[0]
      } else {
        formData.value.idCardBack = res.data[0]
      }
    } else {
      showToast(res.message)
    }
  } catch (error) {
    console.log(error)
  } finally {
    loading.close()
  }
}

// 点击返回按钮
const onClickLeft = () => {
  history.back()
}

// 设置状态栏高度
const setStatusHeight = () => {
  const statusHeightValue = getSession('statusHeight')
  if (statusHeightValue) {
    const navBar = document.querySelector('.van-nav-bar') as HTMLElement
    const page = document.querySelector('.page') as HTMLElement

    if (navBar && page) {
      navBar.style.paddingTop = `${statusHeightValue}px`
      page.style.minHeight = `calc(100vh - 46px - ${statusHeightValue}px)`
    } else {
      console.error('未找到对应元素')
    }
  } else {
    console.error('statusHeight 不存在或不合法')
  }
}

// 注册物理按键返回事件
const registerBackButton = () => {
  jsBridge.registerHandler(
    'callBackJs',
    (
      _data: string,
      responseCallback: (responseData: { message: string }) => void
    ) => {
      if (showCardTypePicker.value) return (showCardTypePicker.value = false)
      if (showSexPicker.value) return (showSexPicker.value = false)
      if (showDatePicker.value) return (showDatePicker.value = false)
      if (showIdCardKeyboard.value) return (showIdCardKeyboard.value = false)
      if (imagePreviewShow.value) return instance.value.close()
      onClickLeft()
      responseCallback({ message: 'callBackJs callCameraJs success' })
    }
  )
}

// 身份证上传
const afterReadIdCard = (type: string) => {
  jsBridge.callHandler('doCamera', { type }, (responseData: string) => {
    console.log(responseData)
  })
}

// 证件类型确定
const cardTypeOnConfirm = ({
  selectedOptions
}: {
  selectedOptions: Array<{ text: string }>
}) => {
  formData.value.cardType = selectedOptions[0]?.text
  showCardTypePicker.value = false
}

// 性别确定
const sexOnConfirm = ({
  selectedOptions
}: {
  selectedOptions: Array<{ text: string }>
}) => {
  formData.value.sex = selectedOptions[0]?.text
  showSexPicker.value = false
}

// 日期确认
const dateOnConfirm = ({
  selectedValues
}: {
  selectedValues: Array<string>
}) => {
  formData.value.idCardValidity = selectedValues.join('-')
  showDatePicker.value = false
}

// 预览图片
const instance = ref<any>(null)
const ImagePreview = (url: string) => {
  instance.value = showImagePreview({
    images: [url],
    closeable: false,
    onClose() {
      imagePreviewShow.value = false
    }
  })
}

// 修改
const onClickEdit = () => {}

// 提交
const onClickSubmit = () => {}

onMounted(() => {
  receiveAppData()
  registerBackButton()
  setStatusHeight()
})
</script>

<template>
  <van-nav-bar
    title="行驶证"
    :fixed="true"
    :placeholder="true"
    :safe-area-inset-top="true"
    @click-left="onClickLeft"
  >
    <template #left>
      <van-icon name="arrow-left" size="22" />
    </template>
  </van-nav-bar>
  <div class="page bg-#F4F4F4">
    <div class="image-box flex bg-#fff px-16px pt-18px pb-26px">
      <div class="image-item">
        <div v-if="!formData.idCardFront" @click="afterReadIdCard('front')">
          <van-image width="100%" height="100%" :src="idCardFrontBgc" />
        </div>
        <div v-else>
          <van-image
            width="100%"
            height="100%"
            :src="formData.idCardFront"
            @click="ImagePreview(formData.idCardFront)"
          />
        </div>
      </div>
      <div class="image-item">
        <div v-if="!formData.idCardBack" @click="afterReadIdCard('back')">
          <van-image width="100%" height="100%" :src="idCardBackBgc" />
        </div>
        <div v-else>
          <van-image
            width="100%"
            height="100%"
            :src="formData.idCardBack"
            @click="ImagePreview(formData.idCardFront)"
          />
        </div>
      </div>
    </div>

    <van-cell-group class="mt-10px">
      <van-field
        v-model="formData.cardType"
        is-link
        readonly
        name="cardType"
        label-align="left"
        label="证件类型"
        placeholder="请选择证件类型"
        @click="showCardTypePicker = true"
      />
      <van-field
        v-model="formData.name"
        label-align="left"
        label="姓名"
        placeholder="请输入姓名"
      />
      <van-field
        v-model="formData.sex"
        is-link
        readonly
        name="sex"
        label-align="left"
        label="性别"
        placeholder="请选择性别"
        @click="showSexPicker = true"
      />
      <van-field
        v-model="formData.idCardNumber"
        label-align="left"
        label="证件号码"
        placeholder="请输入证件号码"
        readonly
        @touchstart.stop="showIdCardKeyboard = true"
      />
      <van-field
        v-model="formData.idCardValidity"
        readonly
        label-align="left"
        label="有效期"
        placeholder="请选择证件有效期"
        right-icon="calendar-o"
        @click="showDatePicker = true"
      />
      <van-field
        v-model="formData.address"
        label-align="left"
        type="textarea"
        label="详细地址"
        placeholder="请输入详细地址"
      />
    </van-cell-group>
    <div class="footer-btn-box">
      <van-button
        block
        color="#D8D8D8"
        text="修改"
        class="h-38px"
        @click="onClickEdit"
      >
        <template #default>
          <span class="text-#333 text-14px font-500">修改</span>
        </template>
      </van-button>
      <van-button
        block
        type="primary"
        text="保存"
        class="h-38px"
        @click="onClickSubmit"
      >
      </van-button>
    </div>
  </div>

  <!-- 证件类型 -->
  <van-popup v-model:show="showCardTypePicker" position="bottom">
    <van-picker
      :columns="cardTypeColumns"
      @confirm="cardTypeOnConfirm"
      @cancel="showCardTypePicker = false"
    />
  </van-popup>

  <!-- 性别 -->
  <van-popup v-model:show="showSexPicker" position="bottom">
    <van-picker
      :columns="sexColumns"
      @confirm="sexOnConfirm"
      @cancel="showSexPicker = false"
    />
  </van-popup>

  <!-- 日期选择器 -->
  <van-popup v-model:show="showDatePicker" position="bottom">
    <van-date-picker
      :min-date="minDate"
      @confirm="dateOnConfirm"
      @cancel="showDatePicker = false"
    />
  </van-popup>

  <!-- 身份证键盘 -->
  <van-number-keyboard
    v-model="formData.idCardNumber"
    :show="showIdCardKeyboard"
    extra-key="X"
    close-button-text="完成"
    :maxlength="18"
    @blur="showIdCardKeyboard = false"
  />
</template>

<style scoped lang="scss">
@import '@/assets/styles/profile.scss';
</style>
