// 我的车辆详情
<script setup lang="ts">
import { showDialog, showImagePreview, showLoadingToast, showToast } from 'vant'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import wx from 'weixin-js-sdk'

import { commonApi, vehicleApi } from '@/apis'
import backBgc from '@/assets/images/back.png'
import frontBgc from '@/assets/images/front.png'
import insuranceBgc from '@/assets/images/insurance.png'
import { ResultEnum } from '@/enums/httpEnum'
import { base64ToFile, isWeChatBrowser, setStatusHeight } from '@/utils'
import jsBridge from '@/utils/jsBridge'

const router = useRouter()

enum PageType {
  Add = 'Add',
  Update = 'Update'
}
const pageType = ref<PageType>(PageType.Add)
const isEdit = ref(false)

const formRef = ref<any>(null)

// 表单数据
const formData = ref<any>({
  // 车牌
  licensePlate: '',
  // 车型
  carModelName: '',
  carTypeAndModelName: '',
  // 驾驶证类型
  driveType: '',
  // 车辆来源
  vehicleSource: '',
  // 车辆来源名称
  vehicleSourceName: '',
  // 商业险图片的URL
  insuranceCommercialUrl: '',
  // 交强险图片的URL
  insuranceCompulsoryUrl: '',
  // 行驶证正页图片的URL
  licenseMainImageUrl: '',
  // 行驶证副页图片的URL
  licenseSecondaryImageUrl: '',
  // 唯一标识
  serialNo: '',
  // 车型唯一标识
  carModelSerialNo: '',
  vehicleType: '',
  // 车辆类型唯一标识
  vehicleTypeSerialNo: ''
})

const showCarModel = ref(false) // 车型
const showDriveType = ref(false) // 驾驶证类型
const showVehicleSource = ref(false) // 车辆来源
const imagePreviewShow = ref(false) // 图片预览

// 车牌的验证规则
const licensePlateRules = [
  {
    required: true,
    message: '请输入车牌号码'
  },
  {
    pattern:
      /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}|^[DF][A-Z0-9]{5}[A-Z0-9挂学警港澳]{1}$/,
    message: '请输入正确的车牌号码'
  }
]

// 车辆来源
const vehicleColumns = ref([
  { text: '自有车辆', value: '1' }, // 自有车辆
  { text: '外调车辆', value: '2' } // 外调车辆
])

// 车辆来源确定
const vehicleConfirm = ({
  selectedOptions
}: {
  selectedOptions: Array<{ text: string; value: string }>
}) => {
  formData.value.vehicleSource = selectedOptions[0]?.value
  formData.value.vehicleSourceName = selectedOptions[0]?.text
  showVehicleSource.value = false
}

// 车型
const carModelColumns = ref([])

// 车型确定
const carModelConfirm = ({
  selectedOptions
}: {
  selectedOptions: Array<{ text: string; value: string }>
}) => {
  formData.value.carTypeAndModelName = selectedOptions
    .map(item => item.text)
    .join('/')

  formData.value.vehicleType = selectedOptions[0]?.text
  formData.value.vehicleTypeSerialNo = selectedOptions[0]?.value
  formData.value.carModelName =
    selectedOptions[selectedOptions.length - 1]?.text
  formData.value.carModelSerialNo =
    selectedOptions[selectedOptions.length - 1]?.value
  showCarModel.value = false
}

// 驾驶证类型 	驾照类型(A1, A2, A3, B1, B2, C1, C2, C3, C4, C5, C6, D, E, F, M, N, P）,示例值(C1)
const driveTypeColumns = ref([
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
])

// 驾驶证类型确认
const driveTypeConfirm = ({
  selectedOptions
}: {
  selectedOptions: Array<{ text: string }>
}) => {
  formData.value.driveType = selectedOptions[0]?.text
  showDriveType.value = false
}

// 返回
const onClickLeft = () => {
  router.back()
}

const init = () => {
  // 获取URL参数
  const query = router.currentRoute.value.query
  const vehicleDetail = query.vehicleDetail?.toString()

  if (vehicleDetail) {
    getCarModelList()
    if (vehicleDetail === 'add') {
      isEdit.value = true
      pageType.value = PageType.Add
      return
    }

    isEdit.value = false
    pageType.value = PageType.Update
    const queryData = JSON.parse(vehicleDetail)
    formData.value = queryData
    formData.value.vehicleSourceName =
      queryData.vehicleSource === '1' ? '自有车辆' : '外调车辆'
    // 查询车型
    formData.value.carTypeAndModelName = `${queryData.vehicleTypeName}/${queryData.carModelName}`
  } else {
    console.error('Invalid vehicleDetail query parameter')
  }
}

// 车型列表查询
const getCarModelList = async () => {
  const res = await vehicleApi.getCarModelType()
  if (res.code !== ResultEnum.SUCCESS) return
  carModelColumns.value = res.data.map((item: any) => {
    return {
      text: item.value,
      value: item.serialNo,
      children: item.childrenList.map((item: any) => {
        return {
          text: item.value,
          value: item.serialNo
        }
      })
    }
  })
}

const registerBackButton = () => {
  jsBridge.registerHandler(
    'callBackJs',
    (
      _data: string,
      responseCallback: (responseData: { message: string }) => void
    ) => {
      if (showCarModel.value) return (showCarModel.value = false)
      if (showDriveType.value) return (showDriveType.value = false)
      if (showVehicleSource.value) return (showVehicleSource.value = false)
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
const afterReadIdCard = (type: string) => {
  if (!isEdit.value) return ImagePreview(formData.value[type])
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

// 打开弹框
const openPicker = (type: string) => {
  if (!isEdit.value) return
  switch (type) {
    case 'carModel':
      showCarModel.value = true
      break
    case 'driveType':
      showDriveType.value = true
      break
    case 'vehicleSource':
      showVehicleSource.value = true
      break
  }
}

// 修改
const onClickEdit = () => {
  isEdit.value = !isEdit.value
}

const requiredFields = [
  { field: 'licenseMainImageUrl' },
  { field: 'licenseSecondaryImageUrl' },
  { field: 'insuranceCommercialUrl' },
  { field: 'insuranceCompulsoryUrl' }
]

// 表单提交前
const beforeSubmit = () => {
  let flag = false
  for (const { field } of requiredFields) {
    if (!formData.value[field]) {
      showToast({ message: '请检查图片是否上传完整', duration: 2000 })
      flag = true
    }
  }
  return flag
}

// 提交
const onClickSubmit = () => {
  // 提交前校验图片是否上传
  if (beforeSubmit()) return

  formRef.value?.validate().then(async () => {
    const submitLoading = showLoadingToast({
      message: '正在提交...',
      forbidClick: true
    })

    try {
      const { code, message } = await vehicleApi.addOrUpdateVehicle(
        formData.value,
        pageType.value
      )

      if (code !== ResultEnum.SUCCESS) {
        return showToast({
          message: message,
          duration: 2000
        })
      }

      if (pageType.value === 'Add') {
        showDialog({
          title: '添加成功',
          message: '是否继续添加车辆?',
          showCancelButton: true,
          confirmButtonText: '继续添加',
          cancelButtonText: '返回'
        })
          .then(() => {
            isEdit.value = true
            formData.value = {
              licensePlate: '',
              carModelName: '',
              carTypeAndModelName: '',
              driveType: '',
              vehicleSource: '',
              vehicleSourceName: '',
              insuranceCommercialUrl: '',
              insuranceCompulsoryUrl: '',
              licenseMainImageUrl: '',
              licenseSecondaryImageUrl: '',
              serialNo: '',
              carModelSerialNo: '',
              vehicleType: '',
              vehicleTypeSerialNo: ''
            }
          })
          .catch(() => {
            // on cancel
            onClickLeft()
          })
      } else {
        showToast({
          message: '修改成功',
          duration: 2000
        })
      }
      isEdit.value = false
    } catch (error: any) {
      console.log(error)
      showToast(error as string)
    } finally {
      setTimeout(() => {
        submitLoading.close()
      }, 2000)
    }
  })
}

onMounted(() => {
  init()
  setStatusHeight()
  registerBackButton()
  receiveAppData()
})
</script>

<template>
  <div class="page">
    <div v-if="!isWeChatBrowser" class="nav-bar-con">
      <van-nav-bar
        title="车辆"
        :fixed="true"
        :placeholder="false"
        :safe-area-inset-top="false"
        @click-left="onClickLeft"
      >
        <template #left>
          <van-icon name="arrow-left" size="22" />
        </template>
      </van-nav-bar>
    </div>
    <div class="bg-#F4F4F4 mt-10px">
      <div class="image-box flex bg-#fff px-16px pt-18px">
        <div class="image-item mr-10px">
          <div
            v-if="!formData.licenseMainImageUrl"
            @click="afterReadIdCard('licenseMainImageUrl')"
          >
            <van-image width="100%" height="100%" :src="frontBgc" />
            <div class="edit-btn">行驶证正面</div>
          </div>
          <div v-else>
            <van-image
              width="100%"
              height="100%"
              :src="formData.licenseMainImageUrl"
              @click="ImagePreview(formData.licenseMainImageUrl)"
            />
            <van-button
              block
              class="edit-btn"
              @click="afterReadIdCard('licenseMainImageUrl')"
              >{{ isEdit ? '修改' : '行驶证正面' }}</van-button
            >
          </div>
        </div>
        <div class="image-item">
          <div
            v-if="!formData.licenseSecondaryImageUrl"
            @click="afterReadIdCard('licenseSecondaryImageUrl')"
          >
            <van-image width="100%" height="100%" :src="backBgc" />
            <div class="edit-btn">行驶证反面</div>
          </div>
          <div v-else>
            <van-image
              width="100%"
              height="100%"
              :src="formData.licenseSecondaryImageUrl"
              @click="ImagePreview(formData.licenseSecondaryImageUrl)"
            />
            <van-button
              block
              class="edit-btn"
              @click="afterReadIdCard('licenseSecondaryImageUrl')"
              >{{ isEdit ? '修改' : '行驶证反面' }}</van-button
            >
          </div>
        </div>
      </div>

      <div class="image-box flex bg-#fff px-16px pt-18px pb-26px">
        <div class="image-item mr-10px">
          <div
            v-if="!formData.insuranceCommercialUrl"
            @click="afterReadIdCard('insuranceCommercialUrl')"
          >
            <van-image width="100%" height="100%" :src="insuranceBgc" />
            <div class="edit-btn">商业险</div>
          </div>
          <div v-else>
            <van-image
              width="100%"
              height="100%"
              :src="formData.insuranceCommercialUrl"
              @click="ImagePreview(formData.insuranceCommercialUrl)"
            />
            <van-button
              block
              class="edit-btn"
              @click="afterReadIdCard('insuranceCommercialUrl')"
              >{{ isEdit ? '修改' : '商业险' }}</van-button
            >
          </div>
        </div>
        <div class="image-item">
          <div
            v-if="!formData.insuranceCompulsoryUrl"
            @click="afterReadIdCard('insuranceCompulsoryUrl')"
          >
            <van-image width="100%" height="100%" :src="insuranceBgc" />
            <div class="edit-btn">交强险</div>
          </div>
          <div v-else>
            <van-image
              width="100%"
              height="100%"
              :src="formData.insuranceCompulsoryUrl"
              @click="ImagePreview(formData.insuranceCompulsoryUrl)"
            />
            <van-button
              block
              class="edit-btn"
              @click="afterReadIdCard('insuranceCompulsoryUrl')"
              >{{ isEdit ? '修改' : '交强险' }}</van-button
            >
          </div>
        </div>
      </div>
      <van-cell-group class="mt-10px">
        <van-form ref="formRef" required="auto">
          <van-field
            v-model="formData.licensePlate"
            :readonly="!isEdit"
            name="licensePlate"
            label-align="left"
            label="车牌"
            placeholder="请输入车牌"
            :rules="licensePlateRules"
            :maxlength="8"
          />
          <van-field
            v-model="formData.carTypeAndModelName"
            :is-link="isEdit"
            name="carTypeAndModelName"
            readonly
            label-align="left"
            label="车型"
            placeholder="请选择车型"
            :rules="[{ required: true, message: '请选择车型' }]"
            @click="openPicker('carModel')"
          />
          <van-field
            v-model="formData.driveType"
            :is-link="isEdit"
            readonly
            name="driveType"
            label-align="left"
            label="驾驶证类型"
            placeholder="请选择驾驶证类型"
            :rules="[{ required: true, message: '请选择驾驶证类型' }]"
            @click="openPicker('driveType')"
          />
          <van-field
            v-model="formData.vehicleSourceName"
            :is-link="isEdit"
            readonly
            name="vehicleSource"
            label-align="left"
            label="车辆来源"
            placeholder="请选择车辆来源"
            :rules="[{ required: true, message: '请选择车辆来源' }]"
            @click="openPicker('vehicleSource')"
          />
        </van-form>
      </van-cell-group>

      <div class="footer-btn-box">
        <van-button
          v-if="pageType === 'Update'"
          block
          color="#D8D8D8"
          text="修改"
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

  <!-- 车型 -->
  <van-popup v-model:show="showCarModel" position="bottom">
    <van-picker
      :columns="carModelColumns"
      @confirm="carModelConfirm"
      @cancel="showCarModel = false"
    />
  </van-popup>

  <!-- 车辆来源 -->
  <van-popup v-model:show="showVehicleSource" position="bottom">
    <van-picker
      :columns="vehicleColumns"
      @confirm="vehicleConfirm"
      @cancel="showVehicleSource = false"
    />
  </van-popup>

  <!-- 驾驶证类型 -->
  <van-popup v-model:show="showDriveType" position="bottom">
    <van-picker
      :columns="driveTypeColumns"
      @confirm="driveTypeConfirm"
      @cancel="showDriveType = false"
    />
  </van-popup>
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
