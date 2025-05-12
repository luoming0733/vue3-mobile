<script setup lang="ts">
import { showImagePreview, showLoadingToast, showToast } from 'vant'
import { onMounted, ref } from 'vue'
import wx from 'weixin-js-sdk'

import { commonApi, userApi } from '@/apis'
import backBgc from '@/assets/images/back.png'
import front from '@/assets/images/front.png'
import { ResultEnum } from '@/enums/httpEnum'
import {
  base64ToFile,
  fmtDate,
  fmtDateToTimestamp,
  isWeChatBrowser,
  setStatusHeight
} from '@/utils'
import jsBridge from '@/utils/jsBridge'

defineOptions({
  name: 'DrivingCard'
})

const formRef = ref<any>(null)
const formData = ref({
  frontImageUrl: '', // 正页
  backImageUrl: '', // 副页
  driverName: '', // 司机姓名
  licenseNumber: '', // 驾驶证号码
  licenseType: '', // 驾驶证类型
  driverType: '', // 司机来源
  driverTypeName: '', // 司机来源
  annualReviewDate: '' as string | number, // 年审日期
  annualReviewDateText: '', // 年审日期
  expirationDate: '' as string | number, //过期日期
  expirationDateText: '', // 过期日期
  paymentDate: '' as string | number, // 缴费时间
  paymentDateText: '', // 缴费时间
  serialNo: ''
}) // 表单数据

const isEdit = ref(false)

const showCardTypePicker = ref(false) // 证件类型
const showDatePicker = ref(false) // 日期选择

const datePickerType = ref('')
const showIdCardKeyboard = ref(false) // 身份证键盘
const imagePreviewShow = ref(false) // 图片预览

const showDateTimeDatePicker = ref(false) // 日期时间 日期选择
const showDateTimeTimePicker = ref(false) // 日期时间 时间选择

const dateTimeValues = ref('')
const paymentDateValue = ref(['', '', ''])
const paymentMaxDate = new Date()
const dateTimeTimeValue = ref(['12', '00', '00'])

const cardTypeColumns = [
  { text: 'A1', value: 'A1' },
  { text: 'A2', value: 'A2' },
  { text: 'A3', value: 'A3' },
  { text: 'B1', value: 'B1' },
  { text: 'B2', value: 'B2' },
  { text: 'C1', value: 'C1' },
  { text: 'C2', value: 'C2' },
  { text: 'C3', value: 'C3' },
  { text: 'C4', value: 'C4' },
  { text: 'C5', value: 'C5' },
  { text: 'D', value: 'D' },
  { text: 'E', value: 'E' },
  { text: 'F', value: 'F' },
  { text: 'M', value: 'M' },
  { text: 'N', value: 'N' },
  { text: 'P', value: 'P' }
]

// 获取司机信息
const getDriverInfo = async () => {
  const pageLoading = showLoadingToast({
    message: '加载中...',
    forbidClick: true
  })
  try {
    const { code, data, message } = await userApi.getDriverInfo()
    if (code !== ResultEnum.SUCCESS) return showToast(message)
    const {
      frontImageUrl,
      backImageUrl,
      driverName,
      licenseNumber,
      licenseType,
      driverType,
      annualReviewDate,
      expirationDate,
      paymentDate,
      serialNo
    } = data
    formData.value = {
      frontImageUrl,
      backImageUrl,
      driverName,
      driverTypeName: '',
      licenseNumber,
      licenseType,
      driverType,
      annualReviewDate,
      annualReviewDateText: '',
      expirationDate,
      expirationDateText: '',
      paymentDate,
      paymentDateText: '',
      serialNo
    }
    formData.value.driverTypeName =
      data.driverType === '1' ? '自有司机' : '加盟司机'
    formData.value.annualReviewDateText = fmtDate(
      annualReviewDate,
      'YYYY-MM-DD'
    )
    formData.value.expirationDateText = fmtDate(expirationDate, 'YYYY-MM-DD')
    formData.value.paymentDateText = fmtDate(paymentDate, 'YYYY-MM-DD HH:mm:ss')

    // 默认绑定的缴费信息时间
    paymentDateValue.value = fmtDate(paymentDate, 'YYYY-MM-DD').split('-')
    dateTimeTimeValue.value = fmtDate(paymentDate, 'HH:mm:ss').split(':')
  } catch (error) {
    console.log(error)
  } finally {
    pageLoading.close()
  }
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
const handleAndroidImage = async (dataString: string) => {
  const dataObj = JSON.parse(dataString)
  const type = JSON.parse(dataObj.expend).type
  const content = `data:image/jpeg;base64,${dataObj.base64List[0].base64}`
  const fileName = dataObj.base64List[0].name
  const file = base64ToFile(content, fileName)
  uploadFile(file, type)
}

// 上传文件到服务器
const uploadFile = async (
  file: File,
  type: 'frontImageUrl' | 'backImageUrl'
) => {
  const fileData = new FormData()
  fileData.append('file', file)
  fileData.append('type', '3')
  const loading = showLoadingToast({
    message: '正在上传图片...',
    forbidClick: true
  })
  try {
    const res = await commonApi.uploadFile(fileData)
    if (res.code === ResultEnum.SUCCESS) {
      formData.value[type] = res.data[0]
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

// 注册物理按键返回事件
const registerBackButton = () => {
  jsBridge.registerHandler(
    'callBackJs',
    (
      _data: string,
      responseCallback: (responseData: { message: string }) => void
    ) => {
      if (showCardTypePicker.value) return (showCardTypePicker.value = false)
      if (showDatePicker.value) return (showDatePicker.value = false)
      if (showIdCardKeyboard.value) return (showIdCardKeyboard.value = false)
      if (imagePreviewShow.value) return instance.value.close()
      onClickLeft()
      responseCallback({ message: 'callBackJs callCameraJs success' })
    }
  )
}

/**
 * 调用摄像头处理程序读取一张type类型的图片。
 * @param {string} type -要读取的图片类型。
 * @return {void}
 */
const afterReadIdCard = (type: 'frontImageUrl' | 'backImageUrl') => {
  if (!isEdit.value) {
    if (!formData.value[type]) return
    return ImagePreview(formData.value[type])
  }
  if (isWeChatBrowser) {
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        const localIds = res.localIds // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
        wx.getLocalImgData({
          localId: localIds[0],
          // compressionRatio: 0.3, // 压缩比例，iOS 默认值 0.3
          success: function (res) {
            let localData = res.localData // localData是图片的base64数据，可以用img标签显示
            if (localData.indexOf('data:image') != 0) {
              //判断是否有这样的头部
              localData = 'data:image/jpeg;base64,' + localData
            }
            localData = localData
              .replace(/\r|\n/g, '')
              .replace('data:image/jgp', 'data:image/jpeg') // 此处的localData 就是你所需要的base64位
            const file = base64ToFile(localData, 'weixin' + type + '.jpg')
            uploadFile(file, type)
          }
        })
      },
      cancel: function () {}
    })
  } else {
    jsBridge.callHandler('doCamera', { type }, (responseData: string) => {
      console.log(responseData)
    })
  }
}

const openIdCardKeyboard = () => {
  if (!isEdit.value) return
  showIdCardKeyboard.value = true
}

const openCardTypePicker = () => {
  if (!isEdit.value) return
  showCardTypePicker.value = true
}

// 证件类型确定
const cardTypeOnConfirm = ({
  selectedOptions
}: {
  selectedOptions: Array<{ text: string }>
}) => {
  formData.value.licenseType = selectedOptions[0]?.text
  showCardTypePicker.value = false
}

const openDatePicker = (type: string) => {
  if (!isEdit.value) return
  if (type === 'paymentDate') {
    showDateTimeDatePicker.value = true
    return
  }
  showDatePicker.value = true
  datePickerType.value = type
}

// 日期确认
const dateOnConfirm = ({
  selectedValues
}: {
  selectedValues: Array<string>
}) => {
  switch (datePickerType.value) {
    case 'expirationDate':
      formData.value.expirationDateText = selectedValues.join('-')
      formData.value.expirationDate = fmtDateToTimestamp(
        selectedValues.join('-')
      )
      break
    case 'paymentDate':
      formData.value.paymentDateText = selectedValues.join('-')
      formData.value.paymentDate = fmtDateToTimestamp(selectedValues.join('-'))
      break
    case 'annualReviewDate':
      formData.value.annualReviewDateText = selectedValues.join('-')
      formData.value.annualReviewDate = fmtDateToTimestamp(
        selectedValues.join('-')
      )
      break
  }
  showDatePicker.value = false
}

// 缴费 日期选择
const dateTimeOnDateConfirm = ({
  selectedValues
}: {
  selectedValues: Array<string>
}) => {
  dateTimeValues.value = selectedValues.join('-')
  showDateTimeDatePicker.value = false
  showDateTimeTimePicker.value = true
}

// 缴费 日期取消
const dateTimeOnDateCancel = () => {
  showDateTimeDatePicker.value = false
}

// 缴费 时间选择
const dateTimeOnTimeConfirm = ({
  selectedValues
}: {
  selectedValues: Array<string>
}) => {
  formData.value.paymentDateText = `${dateTimeValues.value} ${selectedValues.join(':')}`
  formData.value.paymentDate = fmtDateToTimestamp(
    `${dateTimeValues.value} ${selectedValues.join(':')}`
  )
  showDateTimeTimePicker.value = false
}

// 缴费 时间取消
const dateTimeOnTimeCancel = () => {
  showDateTimeTimePicker.value = false
  showDateTimeDatePicker.value = true
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
  imagePreviewShow.value = true
}

// 修改
const onClickEdit = () => {
  isEdit.value = !isEdit.value
}

// 身份证号码认证规则
function validateIDCard(idCard: string) {
  if (idCard.length !== 18) {
    return false
  }
  const weight = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  const checkCode = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
  let sum = 0
  for (let i = 0; i < 17; i++) {
    const num = parseInt(idCard[i])
    if (isNaN(num)) {
      return false
    }
    sum += parseInt(idCard[i]) * weight[i]
  }
  const remainder = sum % 11
  if (idCard[18 - 1] === checkCode[remainder]) {
    return true
  } else {
    return false
  }
}

// 提交
const onClickSubmit = () => {
  if (
    formData.value.backImageUrl === null ||
    formData.value.backImageUrl === '' ||
    formData.value.frontImageUrl === null ||
    formData.value.frontImageUrl === ''
  ) {
    showToast('请上传驾驶证照片')
    return
  }
  formRef.value
    .validate()
    .then(async () => {
      const submitLoading = showLoadingToast({
        message: '正在提交...',
        forbidClick: true
      })
      const { code, message } = await userApi.updateDriverInfo(formData.value)
      if (code !== ResultEnum.SUCCESS) {
        showToast({
          message,
          duration: 2000
        })
        submitLoading.close()
        return
      }
      showToast({
        message: '修改成功',
        duration: 2000
      })
      isEdit.value = false
    })
    .catch((error: any) => {
      console.log(error)
    })
}

onMounted(() => {
  receiveAppData()
  registerBackButton()
  setStatusHeight()
  getDriverInfo()
})
</script>

<template>
  <div class="page">
    <div v-if="!isWeChatBrowser" class="nav-bar-con">
      <van-nav-bar
        title="驾驶证"
        :fixed="true"
        :placeholder="true"
        :safe-area-inset-top="true"
        @click-left="onClickLeft"
      >
        <template #left>
          <van-icon name="arrow-left" size="22" />
        </template>
      </van-nav-bar>
    </div>
    <div class="mt-10px bg-#F4F4F4">
      <div class="image-box flex bg-#fff px-16px pt-18px pb-26px mt-10px">
        <div class="image-item mr-10px">
          <div
            v-if="!formData.frontImageUrl"
            @click="afterReadIdCard('frontImageUrl')"
          >
            <van-image width="100%" height="100%" :src="backBgc" />
            <div class="edit-btn">{{ isEdit ? '修改' : '主页' }}</div>
          </div>
          <div v-else>
            <van-image
              width="100%"
              height="100%"
              :src="formData.frontImageUrl"
              @click="ImagePreview(formData.frontImageUrl)"
            />
            <van-button
              block
              class="edit-btn"
              @click="afterReadIdCard('frontImageUrl')"
              >{{ isEdit ? '修改' : '主页' }}</van-button
            >
          </div>
        </div>
        <div class="image-item">
          <div
            v-if="!formData.backImageUrl"
            @click="afterReadIdCard('backImageUrl')"
          >
            <van-image width="100%" height="100%" :src="front" />
            <div class="edit-btn">{{ isEdit ? '修改' : '副页' }}</div>
          </div>
          <div v-else>
            <van-image
              width="100%"
              height="100%"
              :src="formData.backImageUrl"
              @click="ImagePreview(formData.backImageUrl)"
            />
            <van-button
              block
              class="edit-btn"
              @click="afterReadIdCard('backImageUrl')"
              >{{ isEdit ? '修改' : '副页' }}</van-button
            >
          </div>
        </div>
      </div>
      <van-cell-group class="mt-10px">
        <van-form ref="formRef" required="auto">
          <van-field
            v-model="formData.driverName"
            :readonly="!isEdit"
            name="driverName"
            label-align="left"
            label="司机姓名"
            placeholder="请输入姓名"
            :rules="[{ required: true, message: '请输入姓名' }]"
          />
          <van-field
            v-model="formData.licenseNumber"
            name="licenseNumber"
            label-align="left"
            label="驾驶证号码"
            placeholder="请输入证件号码"
            readonly
            :rules="[
              { required: true, message: '请输入证件号码' },
              {
                validator: validateIDCard,
                trigger: 'onBlur',
                message: '请输入正确的证件号码'
              }
            ]"
            @touchstart.stop="openIdCardKeyboard"
          />
          <van-field
            v-model="formData.licenseType"
            :is-link="isEdit"
            readonly
            name="licenseType"
            label-align="left"
            label="驾驶证类型"
            placeholder="请选择证件类型"
            :rules="[{ required: true, message: '请选择证件类型' }]"
            @click="openCardTypePicker"
          />
          <van-field
            v-model="formData.driverTypeName"
            readonly
            label-align="left"
            label="司机来源"
            :rules="[{ required: true, message: '请选择司机来源' }]"
          />
          <van-field
            v-model="formData.annualReviewDateText"
            readonly
            label-align="left"
            label="年审日期"
            placeholder="请选择年审日期"
            :right-icon="isEdit ? 'calendar-o' : ''"
            @click="openDatePicker('annualReviewDate')"
          >
          </van-field>
          <van-field
            v-model="formData.expirationDateText"
            readonly
            label-align="left"
            label="过期日期"
            placeholder="请选择证件有效期"
            :right-icon="isEdit ? 'calendar-o' : ''"
            @click="openDatePicker('expirationDate')"
          />
          <van-field
            v-model="formData.paymentDateText"
            readonly
            label-align="left"
            label="缴费时间"
            placeholder="请选择缴费时间"
            :right-icon="isEdit ? 'calendar-o' : ''"
            @click="openDatePicker('paymentDate')"
          />
        </van-form>
      </van-cell-group>

      <div class="footer-btn-box">
        <van-button
          block
          color="#D8D8D8"
          class="h-38px mr-10px"
          @click="onClickEdit"
        >
          <template #default>
            <span class="text-#333 text-14px font-500">
              {{ isEdit ? '取消' : '修改' }}
            </span>
          </template>
        </van-button>
        <van-button
          block
          type="primary"
          text="保存"
          class="h-38px"
          :disabled="!isEdit"
          @click="onClickSubmit"
        >
        </van-button>
      </div>
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

  <!-- 日期选择器 -->
  <van-popup v-model:show="showDatePicker" position="bottom">
    <van-date-picker
      @confirm="dateOnConfirm"
      @cancel="showDatePicker = false"
    />
  </van-popup>

  <!-- 缴费 日期选择 -->
  <van-popup v-model:show="showDateTimeDatePicker" position="bottom">
    <van-date-picker
      v-model="paymentDateValue"
      title="选择日期"
      :max-date="paymentMaxDate"
      @confirm="dateTimeOnDateConfirm"
      @cancel="dateTimeOnDateCancel"
    />
  </van-popup>

  <!-- 缴费 时间选择 -->
  <van-popup v-model:show="showDateTimeTimePicker" position="bottom">
    <van-time-picker
      v-model="dateTimeTimeValue"
      :columns-type="['hour', 'minute', 'second']"
      title="选择时间"
      @confirm="dateTimeOnTimeConfirm"
      @cancel="dateTimeOnTimeCancel"
    />
  </van-popup>

  <!-- 身份证键盘 -->
  <van-number-keyboard
    v-model="formData.licenseNumber"
    :show="showIdCardKeyboard"
    safe-area-inset-bottom
    extra-key="X"
    close-button-text="完成"
    :maxlength="18"
    @blur="showIdCardKeyboard = false"
  >
    <template #title-left>
      <van-button
        class="van-number-keyboard__close van-haptics-feedback b-none bg-#f2f3f5"
        type="primary"
        plain
        @click="formData.licenseNumber = ''"
      >
        <span>清空</span>
      </van-button>
    </template>
  </van-number-keyboard>
</template>

<style scoped lang="scss">
@import '@/assets/styles/profile.scss';

.page {
  min-height: 100vh;
  background-color: #f4f4f4;

  .nav-bar-con {
    height: 46px;
  }
}
</style>
