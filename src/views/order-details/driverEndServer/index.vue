/**结束服务 */
<script lang="ts" setup>
import {
  showConfirmDialog,
  showImagePreview,
  showLoadingToast,
  showToast
} from 'vant'
import { computed, onActivated, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import wx from 'weixin-js-sdk'

import { commonApi, orderApi } from '@/apis'
import { CONST_ROUTES } from '@/constants'
import { ResultEnum } from '@/enums/httpEnum'
import { base64ToFile, isWeChatBrowser } from '@/utils'
import jsBridge from '@/utils/jsBridge'

const route = useRoute()
const router = useRouter()

const formData: any = ref({
  endDashboardUrl: '', // 结束用车仪表盘 URL
  endMileage: '' as number | '', // 结束里程数（单位：公里）
  destinationLocation: '', // 目的地
  mileage: '' as number | '', // 里程数（单位：公里）
  parkingFee: 0, // 停车费（单位：元）
  tollFee: 0, // 路桥费（单位：元）
  fuelCost: 0, // 燃油费
  mealAllowance: 0, // 误餐费（单位：元）
  otherExpenses: 0, // 其他费用（单位：元）
  ImgUrls: [],
  fuelCostIncluded: 0,
  description: '' // 备注
})

const endInfoFormRef = ref<any>(null)

const validatorMessage: any = (val: any) => {
  if (val.length <= 0) {
    return new Promise(resolve => {
      resolve('请输入')
    })
  }
  if (route.query?.startMileage && +val <= +route.query?.startMileage) {
    return new Promise(resolve => {
      resolve(`结束里程必须大于开始里程${route.query?.startMileage}KM`)
    })
  }
}

const isFixedPriceFlag = computed(() => {
  return Number(route.query?.fixedPriceFlag) === 1
})
// 返回
const onClickLeft = () => {
  const { backRouteName, orderStatus } = route.query
  router.push({
    path: '/orderDetails',
    query: {
      orderNumber: route.query.orderNumber,
      subOrderSerialNo: route.query.subOrderSerialNo,
      backRouteName: String(backRouteName),
      orderStatus
    }
  })
}

// 结束里程数修改时，计算里程数
const changeEndMileage = (val: number) => {}

// 前往地图页面选择位置
const goMap = (type: string) => {
  const {
    orderNumber,
    subOrderSerialNo,
    backRouteName,
    orderStatus,
    startMileage,
    fuelCostIncluded
  } = route.query
  router.push({
    name: CONST_ROUTES.SELECT_ADDRESS.name,
    query: {
      type: type,
      backPath: '/endService',
      orderNumber,
      subOrderSerialNo,
      backRouteName: String(backRouteName),
      orderStatus,
      startMileage,
      fuelCostIncluded,
      ...formData.value
    }
  })
}

// 拍照上传
const uploadImageHandle = (type: string) => {
  if (isWeChatBrowser) {
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: type === 'endDashboardUrl' ? ['camera'] : ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
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
      console.log('doCamera', '---------------', responseData)
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
      // const urlKey = {
      //   endDashboardUrl: 'endDashboardUrl',
      //   stopFeeUrl: 'stopFeeUrl',
      //   tollFeeUrl: 'tollFeeUrl',
      //   otherExpensesUrl: 'otherExpensesUrl'
      // }[type]
      // if (urlKey) {
      //   formData.value[urlKey] = res.data[0]
      // }

      if (type === 'endDashboardUrl') {
        formData.value.endDashboardUrl = res.data[0]
      }
      if (type === 'ImgUrls') {
        formData.value.ImgUrls.push(res.data[0] as string)
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

// 提交
const onsubmit = () => {
  endInfoFormRef.value.validate().then(async () => {
    try {
      showLoadingToast({
        message: '提交中...',
        forbidClick: true
      })
      const params = {
        ...formData.value,
        subOrderSerialNo: route.query?.subOrderSerialNo,
        orderSerialNo: route.query?.orderNumber
      }
      const res = await orderApi.operateOrder(params, 'endOrder')
      if (res.code === ResultEnum.SUCCESS) {
        showToast('提交成功')
        onClickLeft()
      } else {
        showToast({
          message: res.message,
          duration: 3 * 1000
        })
      }
    } catch (error) {
      console.error(error)
    }
  })
}

// 预览图片
const instance = ref<any>(null)
const imagePreviewShow = ref(false)
const previewImage = (urls: string[], index?: number) => {
  // const urls = formData.value.ImgUrls
  if (urls) {
    imagePreviewShow.value = true
    instance.value = showImagePreview({
      images: urls,
      startPosition: index ? index : 0,
      onClose: () => {
        imagePreviewShow.value = false
      }
    })
  }
}

// 删除图片
const delImageHandle = (type: string, index?: number) => {
  showConfirmDialog({
    title: '提示',
    message: '是否确认删除该图片？',
    showCancelButton: true
  }).then(() => {
    if (type === 'endDashboardUrl') {
      formData.value.endDashboardUrl = ''
    }
    if (type === 'ImgUrls') {
      formData.value.ImgUrls.splice(index, 1)
    }
  })
}

// 结束里程数修改时，计算总里程数
watch(
  () => formData.value.endMileage,
  () => {
    const startMileage = Number(route.query?.startMileage)
    const endMileage = Number(formData.value.endMileage)
    const mileage = Number((endMileage - startMileage).toFixed(1))

    formData.value.mileage = Math.max(mileage, 0)
  }
)

// 从路由获取数据并渲染
const getDataByRoute = () => {
  const { type, address } = route.query
  formData.value.fuelCostIncluded = route.query?.fuelCostIncluded
  if (type === 'end') {
    formData.value.destinationLocation = address
    formData.value.endDashboardUrl = route.query?.endDashboardUrl
    formData.value.endMileage = route.query?.endMileage
    // formData.value.mileage = route.query?.mileage
    formData.value.parkingFee = route.query?.parkingFee
    formData.value.tollFee = route.query?.tollFee
    formData.value.fuelCost = route.query?.fuelCost
    formData.value.mealAllowance = route.query?.mealAllowance
    formData.value.otherExpenses = route.query?.otherExpenses
    formData.value.ImgUrls = route.query?.ImgUrls
  }
}

// 注册物理返回按钮事件处理函数。
const registerBackButton = () => {
  jsBridge.registerHandler(
    'callBackJs',
    (
      _data: string,
      responseCallback: (responseData: { message: string }) => void
    ) => {
      if (imagePreviewShow.value) {
        imagePreviewShow.value = false
        instance.value.close()
        return
      }
      onClickLeft()
      responseCallback({ message: 'callBackJs callCameraJs success' })
    }
  )
}

onActivated(() => {})

onMounted(() => {
  receiveAppData()
  getDataByRoute()
  registerBackButton()
})
</script>

<template>
  <div class="min-h-100vh bg-#f5f5f5">
    <div id="nav-bar-con">
      <van-nav-bar
        title="结束服务"
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
    <van-form ref="endInfoFormRef" v-model="formData" required="auto">
      <div class="bg-#fff py-10px mb-10px">
        <van-field
          v-model="formData.endDashboardUrl"
          name="endDashboardUrl"
          label="结束用车仪表盘"
          :border="false"
          label-align="top"
          input-align="left"
          class=""
          :rules="[{ required: true, message: '请上传结束用车仪表盘' }]"
        >
          <template #input>
            <div v-if="formData.endDashboardUrl" class="w-78px h-78px">
              <van-image
                :src="formData.endDashboardUrl"
                class="relative w-full h-full"
                @click="previewImage([formData.endDashboardUrl])"
              >
                <!-- 删除按钮 -->
                <div class="absolute top-1 right-1">
                  <van-icon
                    name="clear"
                    size="18"
                    @click.stop="delImageHandle('endDashboardUrl')"
                  />
                </div>
              </van-image>
            </div>
            <div v-else class="upload-box">
              <div
                class="upload-item"
                @click="uploadImageHandle('endDashboardUrl')"
              >
                <svg class="icon upload-icon" aria-hidden="true">
                  <use xlink:href="#icon-xiangji"></use>
                </svg>
                <span class="upload-text">拍照上传</span>
              </div>
            </div>
          </template>
        </van-field>
        <van-field
          v-model="formData.endMileage"
          name="endMileage"
          label="结束里程"
          placeholder="请输入"
          class="my-field"
          :border="false"
          input-align="left"
          label-align="right"
          type="digit"
          :rules="[
            { validator: validatorMessage },
            { required: true, message: '请输入' }
          ]"
          @update:model-value="changeEndMileage"
        >
          <template #extra>
            <div class="my-field-right">KM</div>
          </template>
        </van-field>
        <van-field
          v-model="formData.destinationLocation"
          name="destinationLocation"
          label="目的地"
          placeholder="请选择"
          readonly
          :border="false"
          class="my-field my-field-border"
          input-align="left"
          label-align="right"
          :rules="[{ required: true, message: '请选择目的地' }]"
          @click="goMap('end')"
          @click-right-icon="goMap('end')"
        >
          <template #right-icon>
            <van-icon name="location" color="#0F62FE" />
          </template>
        </van-field>
      </div>
      <div class="bg-#fff py-10px mb-10px">
        <van-row class="py-19px">
          <van-col span="12"
            ><van-field
              v-model="formData.mileage"
              class="my-field my-field-disabled"
              disabled
              :border="false"
              type="number"
              name="mileage"
              label="实际公里数"
              placeholder="请输入"
              label-align="right"
              :rules="[{ required: true, message: '请输入' }]"
            >
            </van-field>
            <van-field
              v-model="formData.parkingFee"
              class="my-field"
              :border="false"
              type="number"
              name="parkingFee"
              label="停车费"
              placeholder="请输入"
              label-align="right"
              :maxlength="5"
              :rules="[{ required: true, message: '请输入' }]"
              :disabled="isFixedPriceFlag"
            >
            </van-field>
            <van-field
              v-model="formData.tollFee"
              class="my-field"
              type="number"
              :border="false"
              name="tollFee"
              label="路桥费"
              placeholder="请输入"
              :maxlength="5"
              label-align="right"
              :rules="[{ required: true, message: '请输入' }]"
              :disabled="isFixedPriceFlag"
            >
            </van-field
          ></van-col>
          <van-col span="12"
            ><van-field
              v-model="formData.fuelCost"
              type="number"
              class="my-field"
              :border="false"
              name="fuelCost"
              label="燃油费"
              :placeholder="
                Number(formData.fuelCostIncluded) !== 1
                  ? '不含燃油费'
                  : '请输入'
              "
              :disabled="
                Number(formData.fuelCostIncluded) !== 1 || isFixedPriceFlag
              "
              :maxlength="5"
              label-align="right"
              :rules="[
                {
                  required: Number(formData.fuelCostIncluded) === 1,
                  message: '请输入'
                }
              ]"
            >
            </van-field>
            <van-field
              v-model="formData.mealAllowance"
              class="my-field"
              type="number"
              :border="false"
              name="mealAllowance"
              label="误餐费"
              placeholder="请输入"
              label-align="right"
              :maxlength="5"
              :rules="[{ required: true, message: '请输入' }]"
              :disabled="isFixedPriceFlag"
            >
            </van-field>
            <van-field
              v-model="formData.otherExpenses"
              class="my-field"
              type="number"
              :border="false"
              name="otherExpenses"
              label="其他费用"
              placeholder="请输入"
              label-align="right"
              :maxlength="5"
              :rules="[{ required: true, message: '请输入' }]"
              :disabled="isFixedPriceFlag"
            >
            </van-field
          ></van-col>
        </van-row>

        <div class="mx-16px others">
          <div>
            <div class="text-#333333 text-11px ml-10px my-10px">备注</div>
            <van-field
              v-model="formData.description"
              class="my-field"
              autosize
              :border="false"
              type="textarea"
              name="description"
              label=""
              placeholder="请输入"
              label-align="right"
              :maxlength="100"
              show-word-limit
            >
            </van-field>
          </div>

          <div class="tips px-12px py-19px">
            <svg class="icon mr-5px" aria-hidden="true">
              <use xlink:href="#icon-jinggao"></use>
            </svg>
            <span>请上传停车费、路桥费、燃油费发票等凭证！</span>
          </div>
          <div class="upload-warp">
            <div
              v-for="(i, index) in formData.ImgUrls"
              :key="index"
              class="w-78px h-78px"
            >
              <van-image
                class="relative w-full h-full"
                :src="i"
                @click="previewImage(formData.ImgUrls, index)"
              >
                <!-- 删除按钮 -->
                <div class="absolute top-1 right-1">
                  <van-icon
                    name="clear"
                    size="18"
                    @click.stop="delImageHandle('ImgUrls', index)"
                  />
                </div>
              </van-image>
            </div>
            <div
              v-if="!formData.ImgUrls || formData.ImgUrls.length < 5"
              class="upload-box"
              @click="uploadImageHandle('ImgUrls')"
            >
              <div class="upload-item">
                <svg class="icon upload-icon" aria-hidden="true">
                  <use xlink:href="#icon-xiangji"></use>
                </svg>
                <span class="upload-text">拍照上传</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </van-form>

    <div class="h-57px">
      <div class="footer-box">
        <van-button
          type="primary"
          block
          class="b-0 h-full rd-0"
          @click="onsubmit"
          >提交</van-button
        >
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// 修改vant输入框样式
:deep(.my-field) {
  box-sizing: border-box;
  padding: 2px 10px;
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
  .my-field-right {
    width: 42px;
    height: 35px;
    background: #f4f4f4;
    border-radius: 0px 3px 3px 0px;
    border: 1px solid #e5e5e5;
    border-left: none;
    line-height: 35px;
    text-align: center;
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

.others {
  border-top: 1px solid #e5e5e5;
  .tips > span {
    font-weight: 400;
    font-size: 10px;
    color: #333333;
    line-height: 15px;
    text-align: left;
    font-style: normal;
  }
}

.footer-box {
  position: fixed;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 47px;
  background: #ffffff;
  box-shadow: 1px 0 6px 0px #daddde;
  margin-top: 40px;
}

.upload-warp {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 3px;
  row-gap: 3px;
  column-gap: 3px;
}
</style>
