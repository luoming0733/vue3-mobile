/** 订单详情 */
<script setup lang="ts">
import {
  closeToast,
  showConfirmDialog,
  showFailToast,
  showImagePreview,
  showLoadingToast,
  showSuccessToast,
  showToast
} from 'vant'
import type { Ref } from 'vue'
import { onActivated, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import wx from 'weixin-js-sdk'

import { commonApi, orderApi } from '@/apis'
import Steps from '@/components/my-components/steps.vue'
import EmptyPage from '@/components/other-page/empty-page.vue'
import { CONST_ROUTES } from '@/constants'
import { ResultEnum } from '@/enums/httpEnum'
import { useStyle } from '@/hooks'
import { useWxConfigStore } from '@/store'
import {
  base64ToFile,
  calculateCustomerNameAndPhone,
  calculateOrderStatus,
  callPhoneNumber,
  extractCustomerPhone,
  fmtDate,
  getSession,
  isWeChatBrowser,
  onClickNavTitle,
  sendPhoneSmsToPhone
} from '@/utils'
import jsBridge from '@/utils/jsBridge'

defineOptions({
  name: CONST_ROUTES.ORDER_DETAILS.name
})

const pageShow = ref(true)
const { Transition } = useStyle()

const orderDetailInfo = ref<any>({})

const router = useRouter()
const route = useRoute()

const isErrorPage = ref(false)
const errorPageDescription = ref('')
const errorType = ref('default')

const isRefresh = ref(false)

const notAllowStatus = ref([4, 6, 7])
const stopsStatus = ref([4, 6])

const submitLoading = ref(false)

const handlerOrderText = ref('司机确定')

const orderStartVisible = ref(false) // 旅程开始信息
const orderStopVisible = ref(false) // 停靠点
const reassignVisible = ref(false) // 改派
const natureChangeVisible = ref(false) // 用车性质变更
const showReasonAction = ref(false) // 改派原因选择
const showNatureAction = ref(false) // 用车性质变更选择

const anomalyVisible = ref(false) // 异常报备
const showaAnomalyAction = ref(false)

const isReassignChange = ref(false)
const isNatureChange = ref(false)
const isAnomalyChange = ref(false)

const smsTemplateContent = ref('')

const stepsKey = ref(1)

// 状态常量定义
const STATUS = {
  DRIVER_CONFIRM: '5',
  DEPARTURE_CONFIRM: '2',
  ARRIVAL: '3',
  SERVICE_START: '4',
  SERVICE_END: '7'
}

// 默认步骤结构
const DEFAULT_STEP = {
  createDate: 0,
  active: -1
}

const STEP_CONFIG = [
  { name: '司机确认', status: STATUS.DRIVER_CONFIRM },
  { name: '出车确认', status: STATUS.DEPARTURE_CONFIRM },
  { name: '到达约定点', status: STATUS.ARRIVAL },
  { name: '开始服务', status: STATUS.SERVICE_START },
  { name: '结束服务', status: STATUS.SERVICE_END }
]

const stepsData = ref(
  STEP_CONFIG.map(config => ({
    processName: config.name,
    processStatus: config.status,
    ...DEFAULT_STEP
  }))
)

const stepsActive = ref(-1)

const reasonActions = ref([])
const natureActions = ref([])
const anomalyActions = ref([])

// 开始用车
const startFormData = ref({
  startDashboardUrl: '',
  startMileage: '',
  departureLocation: '',
  latitude: '',
  longitude: ''
})

const stopFormData = ref({
  stopName: '',
  latitude: '',
  longitude: ''
})

// 改派原因
const reassignFormData: any = ref({
  reason: '',
  reasonDictSerialNo: '',
  initiatorImgUrl: [],
  imagesStr: ''
})

const natureFormData: any = ref({
  newUserType: '',
  newUserTypeText: ''
})

// 异况上报
const anomalyFormData: any = ref({
  useStartDate: '',
  userType: '',
  carModel: '',
  trainFlight: '',
  anomalyType: '',
  newUserTypeText: '',
  newUserType: '',
  description: '', // 异常描述
  imagesStr: '',
  anomalyImgUrl: []
})

const anomalyLoading = ref(false)

const startInfoFormRef = ref<any>(null)

const stopInfoFormRef = ref<any>(null)

const reassignInfoFormRef = ref<any>(null)

const natureChangeRef = ref<any>(null)

const natureFormRef = ref<any>(null)

const anomalyFormRef = ref<any>(null)

const wxConfigStore = useWxConfigStore()

/**
 * @dec 查询司机申请改派理由字典
 *
 */
const getDispatchDict = async () => {
  try {
    const { code, data } = await commonApi.getDicts('DISPATCH_REASSIGN_REASON')
    if (code === ResultEnum.SUCCESS) {
      reasonActions.value = data.map(
        (item: { value: string; serialNo: string }) => {
          return {
            name: item.value,
            serialNo: item.serialNo
          }
        }
      )
    } else {
      reasonActions.value = []
    }
  } catch (err) {
    console.error(err)
  }
}

const getAnomalyDict = async () => {
  try {
    const { code, data } = await commonApi.getDicts('EXCEPTION_REPORT')
    if (code === ResultEnum.SUCCESS) {
      anomalyActions.value = data.map(
        (item: { value: string; serialNo: string }) => {
          return {
            name: item.value,
            serialNo: item.serialNo
          }
        }
      )
    } else {
      anomalyActions.value = []
    }
  } catch (err) {
    console.error(err)
  }
}

/**
 * 查询用车性质字典
 */
const getUseTypeDict = async (vehicleTypeSerialNo: string) => {
  try {
    const { code, data } = await commonApi.getDicts('USE_TYPE')
    if (code === ResultEnum.SUCCESS) {
      const dataList = data.map((item: { value: string; serialNo: string }) => {
        return {
          name: item.value,
          serialNo: item.serialNo
        }
      })
      // 移除 vehicleTypeSerialNo相同的数据
      natureActions.value = dataList.filter(
        (item: any) => item.serialNo !== vehicleTypeSerialNo
      )
    } else {
      natureActions.value = []
    }
  } catch (err) {
    console.log(err)
  }
}

/**
 * @dec 发送短信
 * @param { string } phoneNumber - 手机号
 */
const sendPhoneMsg = (phoneNumber: string) => {
  if (smsTemplateContent.value.length === 0) {
    showToast('请先配置短信模板')
    return
  }
  sendPhoneSmsToPhone(phoneNumber, smsTemplateContent.value)
}

/**
 * @dec 客户联系确认
 */
const confirmCustomerContact = () => {
  showConfirmDialog({
    title: '客户联系确认',
    message: '是否确认客户已联系？',
    showCancelButton: true
  })
    .then(async () => {
      const params = {
        orderSerialNo: orderDetailInfo.value.serialNo
      }
      const { code, message } = await orderApi.sendSmsConfirm(params)
      if (code !== ResultEnum.SUCCESS) {
        showFailToast({ message })
        return
      }
      showSuccessToast({ message: '操作成功' })
    })
    .catch(() => {})
}

/**
 * 获取短信内容
 */
const getNowOrderSmsContent = async () => {
  const { orderNumber } = route.query
  const { code, data } = await orderApi.getSmsContent(orderNumber as string)
  if (code !== ResultEnum.SUCCESS) {
    smsTemplateContent.value = ''
    return
  }
  smsTemplateContent.value = data.content
}

/**
 * @dec 获取订单详情
 *
 */
const getDriverOrderDetails = async () => {
  showLoadingToast({
    message: '加载中...',
    duration: 15 * 1000
  })

  try {
    const { orderNumber, subOrderSerialNo } = route.query
    const { code, data, message } = await orderApi.getDriverOrderDetails({
      orderSerialNo: orderNumber as string,
      subOrderSerialNo: subOrderSerialNo as string
    })
    if (code !== ResultEnum.SUCCESS) {
      handleError(message, 'error')
      return
    }
    getNowOrderSmsContent()

    isErrorPage.value = false

    // 订单详情
    orderDetailInfo.value = data

    // 用车性质变更审批状态
    isNatureChange.value = data.isCloudApprovalUseType

    // 申请改派审批状态
    isReassignChange.value = data.isReassignApproval

    // 查询用车性质字典
    getUseTypeDict(data.userTypeSerialNo)

    startFormData.value.departureLocation = data?.departureLocation

    const { orderProcessStatus, cloudOrerServiceProcessVOS } = data

    // 按钮文字
    const processStatusText = getProcessStatusText(+orderProcessStatus)
    handlerOrderText.value = processStatusText

    // 步骤条数据
    const processStatusStepsData = getStepsData(cloudOrerServiceProcessVOS)
    stepsData.value = processStatusStepsData

    // 步骤条对应索引
    const processStatusStepsActive = getStepsActive(cloudOrerServiceProcessVOS)
    stepsActive.value = processStatusStepsActive
  } catch (err: unknown) {
    handleError((err as Error).message, 'network')
  } finally {
    closeToast()
  }
}

/**
 * @description 根据订单服务进程状态，返回对应的文本
 * @param {number} orderProcessStatus - 当前订单进程状态
 * @returns {string} - 按钮对应的文本
 */
const getProcessStatusText = (orderProcessStatus: number) => {
  const processStatusMap: { [key: number]: string } = {
    0: '抢单',
    1: '司机确认',
    2: '到达约定点',
    3: '开始服务',
    4: '停靠点',
    5: '司机出发',
    6: '到达目的地'
  }
  return processStatusMap[orderProcessStatus] || ''
}

/**
 * @description 获取步骤条数据
 * @param {any[]} cloudOrerServiceProcessVOS - 订单服务进程步骤信息
 * @returns {any[]} - 步骤条数据
 */
const getStepsData = (cloudOrerServiceProcessVOS: any[]) => {
  if (!cloudOrerServiceProcessVOS || cloudOrerServiceProcessVOS.length === 0) {
    return stepsData.value
  }

  stepsKey.value += 1
  const active = getStepsActive(cloudOrerServiceProcessVOS)

  // 填充步骤条数据
  const data = stepsData.value.map(item => {
    const matchingItem = cloudOrerServiceProcessVOS.find(
      i => i.processStatus === item.processStatus
    )
    return { ...item, createDate: matchingItem?.createDate, active }
  })
  return data
}

/**
 * @description 根据订单服务进程步骤信息，返回步骤条对应的索引
 * @param {any[]} cloudOrerServiceProcessVOS - 订单服务进程步骤信息
 * @returns {number} - 步骤条对应的索引
 */
const getStepsActive = (cloudOrerServiceProcessVOS: any[]) => {
  if (!cloudOrerServiceProcessVOS || cloudOrerServiceProcessVOS.length === 0) {
    return -1
  }

  const sortedData = [...cloudOrerServiceProcessVOS].sort(
    (a, b) => a.createDate - b.createDate
  )
  const PROCESS_STATUS_MAPPING: { [key: string]: number } = {
    '5': 0,
    '2': 1,
    '3': 2,
    '4': 3,
    '6': 3,
    '7': 4
  }
  const activeIndex =
    sortedData.length > 0
      ? PROCESS_STATUS_MAPPING[sortedData[sortedData.length - 1].processStatus]
      : undefined
  return activeIndex ?? -1
}

/**
 * @dec 处理订单详情错误
 * @param message - 错误信息
 */
const handleError = (message: string, errType: string) => {
  isErrorPage.value = true
  errorPageDescription.value = message
  errorType.value = errType || 'error'
  isRefresh.value = true
}

/**
 * @dec 处理订单
 * @param {object} orderDetailInfo - 订单详情
 *
 */
const handlerOrder = (orderDetailInfo: any) => {
  const { serialNo, orderProcessStatus, subOrderSerialNo } = orderDetailInfo
  const params = { orderSerialNo: serialNo, subOrderSerialNo }
  const processStatus = Number(orderProcessStatus)
  switch (processStatus) {
    // 司机抢单
    case 0:
      handlerOrderFunc(params, 'driverGrabOrder')
      break

    // 司机确认
    case 1:
      handlerOrderFunc(params, 'driverConfirm')
      break

    // 到达约定地点
    case 2:
      orderStartVisible.value = true
      break

    case 3:
      handlerOrderFunc(params, 'driverStartServer')
      break

    // 司机出发
    case 5:
      handlerOrderFunc(params, 'driverSetOut')
      break
  }
}

// 到达停靠点处理事件
const handleOrderStop = () => {
  orderStopVisible.value = true
}

// 申请改派
const handleOrderChange = () => {
  reassignVisible.value = true
}

// 用车性质变更
const handleReasonChange = () => {
  natureChangeVisible.value = true
}

// 异常报备
const handleAnomalyChange = () => {
  anomalyVisible.value = true
  anomalyFormData.value.useStartDate = fmtDate(
    orderDetailInfo.value.useStartDate,
    'YYYY-MM-DD HH:mm'
  )
  anomalyFormData.value.userType = orderDetailInfo.value.userType
  anomalyFormData.value.carModel = `${orderDetailInfo.value.vehicleTypeName}/${orderDetailInfo.value.carModelName}`
  anomalyFormData.value.trainFlight = orderDetailInfo.value.trainFlight
}

/**
 * 选择改派原因
 * @param {{ name: string, serialNo: string }} param
 * @param {string} param.name - 改派原因名称
 * @param {string} param.serialNo - 改派原因serialNo
 */
const onSelectReason = ({
  name,
  serialNo
}: {
  name: string
  serialNo: string
}) => {
  reassignFormData.value.reason = name
  reassignFormData.value.reasonDictSerialNo = serialNo
}

// 结束服务
const handleOrderEnd = (orderDetailInfo: any) => {
  const { backRouteName, orderStatus } = route.query
  const { serialNo, subOrderSerialNo, fuelCostIncluded, fixedPriceFlag } =
    orderDetailInfo
  router.push({
    name: CONST_ROUTES.END_SERVICE.name,
    query: {
      orderNumber: serialNo,
      subOrderSerialNo,
      fuelCostIncluded: fuelCostIncluded,
      startMileage: orderDetailInfo.cloudOrderOtherInfoVO?.startMileage,
      backRouteName: String(backRouteName),
      orderStatus,
      fixedPriceFlag,
    }
  })
}

// 调用处理订单接口
const handlerOrderFunc = async (params: any, url: string) => {
  if (
    url === 'driverReassignment' ||
    url === 'driverStartDeparture' ||
    url === 'driverChangeUserType'
  ) {
    showLoadingToast({
      message: '加载中...',
      forbidClick: true
    })
  } else {
    submitLoading.value = true
  }
  try {
    const { code, message } = await orderApi.operateOrder(params, url)
    if (code === ResultEnum.SUCCESS) {
      showSuccessToast(message)
      if (orderStartVisible.value) {
        orderStartVisible.value = false
      }
      if (orderStopVisible.value) {
        orderStopVisible.value = false
      }
      if (reassignVisible.value) {
        reassignVisible.value = false
      }
      if (natureChangeVisible.value) {
        natureChangeVisible.value = false
      }
      setTimeout(() => {
        getDriverOrderDetails()
      }, 500)
    } else {
      showFailToast(message)
    }
  } catch (err: unknown) {
    console.error(err as Error)
  } finally {
    setTimeout(() => {
      submitLoading.value = false
    }, 800)
  }
}

// 旅客开始信息弹窗关闭
const oderStartBeforeClose = (action: string) => {
  if (action === 'confirm') {
    startInfoFormRef.value.validate().then(() => {
      const { orderNumber, subOrderSerialNo } = route.query
      const {
        startDashboardUrl,
        startMileage,
        departureLocation,
        latitude,
        longitude
      } = startFormData.value
      const params = {
        startDashboardUrl,
        startMileage,
        departureLocation,
        latitude,
        longitude,
        orderSerialNo: orderNumber as string,
        subOrderSerialNo: subOrderSerialNo as string
      }
      handlerOrderFunc(params, 'driverStartDeparture')
    })
  } else {
    closeStartDialog()
    startInfoFormRef.value.resetValidation()
    return true
  }
}

// 关闭旅客开始信息弹窗
const closeStartDialog = () => {
  startFormData.value = {
    startDashboardUrl: '',
    startMileage: '',
    departureLocation: '',
    latitude: '',
    longitude: ''
  }
}

// 中途挺靠点
const oderStopBeforeClose = (action: string) => {
  if (action === 'confirm') {
    stopInfoFormRef.value.validate().then(() => {
      const { orderNumber, subOrderSerialNo } = route.query
      const { stopName, latitude, longitude } = stopFormData.value
      const params = {
        stopName,
        latitude,
        longitude,
        orderSerialNo: orderNumber as string,
        subOrderSerialNo: subOrderSerialNo as string
      }
      handlerOrderFunc(params, 'arriveStops')
    })
    console.log('中途挺靠点')
  } else {
    return true
  }
}

// 关闭中途挺靠点
const closeStopDialog = () => {
  stopFormData.value = {
    stopName: '',
    latitude: '',
    longitude: ''
  }
}

// 改派申请
const oderReassignBeforeClose = (action: string) => {
  if (action === 'confirm') {
    reassignInfoFormRef.value.validate().then(() => {
      const { orderNumber, subOrderSerialNo } = route.query
      const { reason, reasonDictSerialNo, initiatorImgUrl } =
        reassignFormData.value
      const params = {
        approvalType: 1,
        approvalReason: reason,
        initiatorImgUrl,
        orderSerialNo: orderNumber as string,
        reasonDictSerialNo,
        subOrderSerialNo: subOrderSerialNo as string
      }
      handlerOrderFunc(params, 'driverReassignment')
    })
  } else {
    return true
  }
}

// 关闭改派申请
const closeReassignDialog = () => {
  reassignFormData.value = {
    reason: '',
    reasonDictSerialNo: '',
    initiatorImgUrl: [],
    imagesStr: ''
  }
}

// 前往地图选择位置
const goMap = (type: string) => {
  const { orderStatus, orderNumber, subOrderSerialNo, backRouteName } =
    route.query
  const { startDashboardUrl, startMileage } = startFormData.value
  router.push({
    name: CONST_ROUTES.SELECT_ADDRESS.name,
    query: {
      type: type,
      backPath: '/orderDetails',
      orderStatus,
      orderNumber,
      subOrderSerialNo,
      startDashboardUrl,
      startMileage,
      backRouteName
    }
  })
}

// 点击上传开始用车仪表盘
const uploadImageHandle = (type: string) => {
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
      // console.log(responseData)
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
        startFormData.value.startDashboardUrl = res.data[0]
      }
      if (type === 'reassignImages') {
        reassignFormData.value.initiatorImgUrl.push(res.data[0] as string)
        reassignFormData.value.imagesStr =
          reassignFormData.value.initiatorImgUrl.join(',')
      }
      if (type === 'anomalyImages') {
        anomalyFormData.value.anomalyImgUrl.push(res.data[0] as string)
        anomalyFormData.value.imagesStr =
          anomalyFormData.value.anomalyImgUrl.join(',')
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
const instance = ref<any>(null)
const imagePreviewShow = ref(false)
/**
 * 预览图片
 * @param url - 要预览的图片url
 */
const ImagePreview = (url: string) => {
  imagePreviewShow.value = true
  instance.value = showImagePreview({
    images: [url],
    closeable: false,
    onClose: () => {
      imagePreviewShow.value = false
    }
  })
}

// 删除改派申请图片
const delImageHandle = (type: string, index?: number) => {
  showConfirmDialog({
    title: '提示',
    message: '是否确认删除该图片？',
    showCancelButton: true
  }).then(() => {
    if (type === 'ImgUrls') {
      reassignFormData.value.initiatorImgUrl.splice(index, 1)
      // 移除字符串中对应的图片
      const strArr = reassignFormData.value.imagesStr.split(',')
      strArr.splice(index, 1)
      reassignFormData.value.imagesStr = strArr.join(',')
    }
    if (type === 'startDashboardUrl') {
      startFormData.value.startDashboardUrl = ''
    }
    if (type === 'anomaly') {
      anomalyFormData.value.anomalyImgUrl.splice(index, 1)
      // 移除字符串中对应的图片
      const strArr = anomalyFormData.value.imagesStr.split(',')
      strArr.splice(index, 1)
      anomalyFormData.value.imagesStr = strArr.join(',')
    }
  })
}

// 用车性质变更关闭前的回调
const natureChangeBeforeClose = (action: string) => {
  if (action === 'confirm') {
    natureFormRef.value.validate().then(() => {
      const { orderNumber, subOrderSerialNo } = route.query
      const params = {
        approvalType: 2,
        orderSerialNo: orderNumber as string,
        subOrderSerialNo: subOrderSerialNo as string,
        originalUserType: orderDetailInfo.value.userTypeSerialNo,
        newUserType: natureFormData.value.newUserType
      }
      handlerOrderFunc(params, 'driverChangeUserType')
    })
    console.log(action)
  } else {
    return true
  }
}

// 用车性质变更关闭
const closeNatureChangeDialog = () => {
  natureFormData.value.newUserType = ''
  natureFormData.value.newUserTypeText = ''
}

// 异常报备关闭
const anomalyDialogClosed = () => {
  anomalyFormData.value.newUserType = ''
  anomalyFormData.value.newUserTypeText = ''
  anomalyFormData.value.description = ''
  anomalyFormData.value.imagesStr = ''
  anomalyFormData.value.anomalyImgUrl = []
}

// 用车性质选择
const onSelectNature = ({
  name,
  serialNo
}: {
  name: string
  serialNo: string
}) => {
  natureFormData.value.newUserTypeText = name
  natureFormData.value.newUserType = serialNo
}

// 异况类型选择
const onSelectAnomaly = ({
  name,
  serialNo
}: {
  name: string
  serialNo: string
}) => {
  anomalyFormData.value.newUserTypeText = name
  anomalyFormData.value.newUserType = serialNo
}

// 异常状况变更关闭前的回调
const anomalyChangeBeforeClose = (action: string) => {
  if (action === 'confirm') {
    anomalyFormRef.value.validate().then(async () => {
      const { orderNumber } = route.query
      const params = {
        description: anomalyFormData.value.description,
        exceptionTypeSerialNo: anomalyFormData.value.newUserType,
        imageUrls: anomalyFormData.value.imagesStr,
        orderSerialNo: orderNumber
      }
      showLoadingToast({
        message: '加载中...',
        forbidClick: true
      })
      await orderApi
        .reportException(params)
        .then(res => {
          if (res.code === ResultEnum.SUCCESS) {
            showToast('提交成功')
            anomalyVisible.value = false
          } else {
            showToast(res.message)
          }
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {})
    })
  } else {
    return true
  }
}

// 根据会话存储的状态高度设置导航栏的高度。
const setStatusHeight = () => {
  const statusHeight = getSession('statusHeight')
  if (statusHeight) {
    // 获取 van-nav-bar 元素并设置顶部内边距
    const navBar = document.querySelector('.van-nav-bar') as HTMLElement
    if (navBar) {
      navBar.style.paddingTop = `${statusHeight}px`
    }

    const navBarCon = document.getElementById('nav-bar-con') as HTMLElement
    if (navBarCon) {
      const newStyle = `${Number(statusHeight) + 46}px`
      navBarCon.style.height = newStyle
    }

    const vanImagePreview = document.querySelector(
      '.van-image-preview'
    ) as HTMLElement
    if (vanImagePreview) {
      vanImagePreview.style.top = `${Number(statusHeight)}px`
    }
  }
}

// 处理导航栏左侧按钮的点击事件 根据当前订单状态跳转到订单或首页。
const onClickLeft = () => {
  const { backRouteName } = route.query
  if (backRouteName) {
    router.push({
      name: String(backRouteName),
      query: route.query
    })
  } else {
    history.back()
  }
}

// 公共的关闭
const closeVisible = (visible: Ref<boolean>) => {
  visible.value = false
}

// 注册物理返回按钮事件处理函数。
const registerBackButton = () => {
  jsBridge.registerHandler(
    'callBackJs',
    (
      _data: string,
      responseCallback: (responseData: { message: string }) => void
    ) => {
      onBeforeLeave()
      onClickLeft()
      responseCallback({ message: 'callBackJs callCameraJs success' })
    }
  )
}

// 页面返回前的回调
const onBeforeLeave = () => {
  // 查看图片
  if (imagePreviewShow.value) {
    closeVisible(imagePreviewShow)
    instance.value.close()
    return
  }
  // 停靠点
  if (orderStopVisible.value) {
    closeVisible(orderStopVisible)
    return
  }
  // 开始服务
  if (orderStartVisible.value) {
    closeVisible(orderStartVisible)
    return
  }
}

const openNowLocationMap = (addressName: string) => {
  if (isWeChatBrowser) {
    const { latitude, longitude } = wxConfigStore.wxLocation
    wx.openLocation({
      latitude: latitude, // 纬度，浮点数，范围为90 ~ -90
      longitude: longitude, // 经度，浮点数，范围为180 ~ -180。
      name: addressName, // 位置名
      address: '', // 地址详情说明
      scale: 10, // 地图缩放级别,整型值,范围从1~28。默认为最大
      infoUrl: '' // 在查看位置界面底部显示的超链接,可点击跳转
    })
  }
}

// activated 生命周期钩子
onActivated(() => {
  const { type, address, lat, lng, startDashboardUrl, startMileage } =
    route.query
  if (type === 'start') {
    startFormData.value.departureLocation = String(address)
    startFormData.value.latitude = String(lat)
    startFormData.value.longitude = String(lng)
    if (startDashboardUrl) {
      startFormData.value.startDashboardUrl = String(startDashboardUrl)
    }
    if (startMileage) {
      startFormData.value.startMileage = String(startMileage)
    }
  }
  if (type === 'stop') {
    stopFormData.value.stopName = String(address)
    stopFormData.value.latitude = String(lat)
    stopFormData.value.longitude = String(lng)
  }
  registerBackButton()
  setStatusHeight()
})

onMounted(() => {
  // initWeChatConfig() // 注入微信权限验证配置
  setStatusHeight() // 设置导航栏高度
  registerBackButton() // 注册物理按键返回事件
  receiveAppData() // 接收APP传过来的数据
  getDriverOrderDetails() // 获取司机订单详情
  getDispatchDict() // 获取改派字典
  getAnomalyDict() // 获取异常字典
})
</script>

<template>
  <Transition :name="Transition.fade">
    <div v-if="pageShow" class="page min-h-100vh bg-#f5f5f5">
      <div v-if="!isWeChatBrowser" id="nav-bar-con" class="h-46px">
        <van-nav-bar
          :fixed="true"
          :placeholder="true"
          :safe-area-inset-top="true"
          @click-left.stop="onClickLeft"
        >
          <template #left>
            <van-icon name="arrow-left" size="22" />
          </template>
          <template #title>
            <span @click="onClickNavTitle">订单详情</span>
          </template>
        </van-nav-bar>
      </div>
      <empty-page
        v-if="isErrorPage"
        :description="errorPageDescription"
        :error-type="errorType"
        :is-refresh="isRefresh"
        @refresh="getDriverOrderDetails"
      />
      <div v-else class="pb-20px">
        <div class="bg-#fff px-16px pt-8px pb-5px mb-8px">
          <div class="flex justify-between items-center mb-5px">
            <span class="text-#333 text-14px"
              >订单号：{{ orderDetailInfo.orderNumber }}</span
            >
            <span class="text-#0F62FE">
              {{ calculateOrderStatus(Number(orderDetailInfo.orderStatus)) }}
            </span>
          </div>
          <div class="text-#606162 text-11px">
            <span>来自：{{ orderDetailInfo.franchiseeCorporateName }}</span>
          </div>
        </div>

        <div class="bg-#fff px-20px mb-8px">
          <div class="flex justify-between items-center text-11px lh-30px">
            <span class="text-#606162 w-80px flex-none">服务时间</span>
            <span class="text-#333 font-500 text-right">
              {{ fmtDate(orderDetailInfo.useStartDate, 'YYYY-MM-DD HH:mm') }}
            </span>
          </div>
          <div class="flex justify-between items-center text-11px lh-30px">
            <span class="text-#606162 w-80px flex-none">用车性质</span>
            <span class="text-#333 font-500 text-right">
              {{ orderDetailInfo.userType }}
            </span>
          </div>
          <div class="flex justify-between items-center text-11px lh-30px">
            <span class="text-#606162 w-80px flex-none">车型</span>
            <span class="text-#333 font-500 text-right">
              {{ orderDetailInfo.vehicleTypeName }}/{{
                orderDetailInfo.carModelName
              }}
            </span>
          </div>
          <div class="flex justify-between items-center text-11px lh-30px">
            <span class="text-#606162">航班/车次</span>
            <span class="text-#333 font-500">
              {{ orderDetailInfo.trainFlight }}
            </span>
          </div>
          <div
            v-if="orderDetailInfo.isShowDriverPrice"
            class="flex justify-between items-center text-11px lh-30px"
          >
            <span class="text-#606162">司机价格</span>
            <span class="text-#333 font-500">
              {{ orderDetailInfo.driverPrice }}
            </span>
          </div>

          <van-divider class="mt-15px mb-12px" />

          <div class="pb-18px">
            <div class="text-#606162 text-12px">服务地址</div>
            <div
              class="text-#606162 text-12px mt-9px"
              @click="openNowLocationMap(orderDetailInfo.departureLocation)"
            >
              <van-icon name="location" color="#0F62FE" class="mr-2px" />
              <span>{{
                orderDetailInfo.departureLocation
                  ? orderDetailInfo.departureLocation
                  : '听客户安排'
              }}</span>
            </div>
            <div
              class="text-#606162 text-12px mt-9px"
              @click="openNowLocationMap(orderDetailInfo.destination)"
            >
              <van-icon name="location" color="#F56C6C" class="mr-2px" />
              <span>{{
                orderDetailInfo.destination
                  ? orderDetailInfo.destination
                  : '听客户安排'
              }}</span>
            </div>
          </div>
        </div>

        <div class="bg-#fff px-20px pb-13px mb-18px">
          <div class="flex justify-between text-11px lh-30px">
            <span class="text-#606162 w-80px flex-none">客户代表</span>
            <span class="text-#333 font-500 text-right">
              <span>
                {{ calculateCustomerNameAndPhone(orderDetailInfo.customerMsg) }}
              </span>
            </span>
          </div>
          <div class="flex justify-between text-11px lh-30px">
            <span class="text-#606162 w-80px flex-none">备注</span>
            <span class="text-#333 font-500 text-right">
              {{ orderDetailInfo.tripDescription }}
            </span>
          </div>

          <!-- 改派/用车性质变更 -->
          <div class="flex justify-between items-center mt-20px">
            <van-button
              v-if="Number(orderDetailInfo.orderStatus) !== 5"
              block
              :type="isReassignChange ? 'default' : 'danger'"
              class="shadow-box h-38px mr-3px mb-15px text-12px"
              :disabled="isReassignChange"
              @click="handleOrderChange"
            >
              {{ isReassignChange ? '改派(审批中)' : '申请改派' }}
            </van-button>
            <van-button
              v-if="Number(orderDetailInfo.orderStatus) !== 5"
              block
              :type="isNatureChange ? 'default' : 'danger'"
              class="shadow-box h-38px mr-3px mb-15px text-12px"
              :disabled="isNatureChange"
              @click="handleReasonChange"
            >
              {{ `用车性质${isNatureChange ? '(审批中)' : '变更'}` }}
            </van-button>
            <van-button
              v-if="Number(orderDetailInfo.orderStatus) !== 5"
              block
              :type="isAnomalyChange ? 'default' : 'danger'"
              class="shadow-box h-38px mb-15px text-12px"
              :disabled="isAnomalyChange"
              @click="handleAnomalyChange"
            >
              {{ `${isAnomalyChange ? '(审批中)' : '异常报备'}` }}
            </van-button>
          </div>

          <!-- 联系客户 -->
          <div class="flex justify-between items-center">
            <van-button
              class="flex-1 shadow-box mb-15px h-38px mr-3px"
              :disabled="
                !orderDetailInfo.customerMsg ||
                orderDetailInfo.customerMsg.length === 0
              "
              @click.stop="
                callPhoneNumber(
                  extractCustomerPhone(orderDetailInfo.customerMsg)
                )
              "
            >
              <van-icon name="phone-o" size="16" class="mr-5px" />
              <span class="text-12px">拨打电话</span>
            </van-button>
            <van-button
              class="flex-1 shadow-box mb-15px h-38px mr-3px"
              :disabled="
                !orderDetailInfo.customerMsg ||
                orderDetailInfo.customerMsg.length === 0
              "
              @click.stop="
                sendPhoneMsg(extractCustomerPhone(orderDetailInfo.customerMsg))
              "
            >
              <van-icon name="envelop-o" size="16" class="mr-5px" />
              <span class="text-12px">发送短信</span>
            </van-button>
            <van-button
              class="flex-1 shadow-box mb-15px h-38px"
              :disabled="
                !orderDetailInfo.customerMsg ||
                orderDetailInfo.customerMsg.length === 0
              "
              @click.stop="confirmCustomerContact"
            >
              <span class="text-12px p-0">客户联系确认</span>
            </van-button>
          </div>

          <!-- 订单操作 -->
          <van-button
            v-if="!notAllowStatus.includes(+orderDetailInfo.orderProcessStatus)"
            class="shadow-box h-38px"
            block
            type="primary"
            :loading="submitLoading"
            loading-text="请稍等..."
            @click="handlerOrder(orderDetailInfo)"
          >
            {{ handlerOrderText }}
          </van-button>
          <div
            v-if="stopsStatus.includes(+orderDetailInfo.orderProcessStatus)"
            class="flex justify-between items-center"
          >
            <van-button
              block
              type="primary"
              class="shadow-box h-38px mr-3px"
              @click="handleOrderStop"
            >
              增加停靠点
            </van-button>
            <van-button
              block
              :loading="submitLoading"
              type="primary"
              loading-text="请稍等..."
              class="shadow-box h-38px"
              @click="handleOrderEnd(orderDetailInfo)"
            >
              结束服务
            </van-button>
          </div>
        </div>
        <div
          v-if="orderDetailInfo.cloudOrderOtherInfoVO"
          class="bg-#fff px-20px b-13px lh-31px pb-20px mb-8px"
        >
          <div v-if="orderDetailInfo.cloudOrderOtherInfoVO.startDashboardUrl">
            <div class="text-#606162 text-11px pt-10px">开始用车仪表盘</div>
            <div class="w78px h78px">
              <van-image
                v-if="orderDetailInfo.cloudOrderOtherInfoVO.startDashboardUrl"
                :src="orderDetailInfo.cloudOrderOtherInfoVO.startDashboardUrl"
                width="100%"
                height="100%"
                @click="
                  ImagePreview(
                    orderDetailInfo.cloudOrderOtherInfoVO.startDashboardUrl
                  )
                "
              ></van-image>
            </div>
            <div class="flex justify-between text-11px pt-10px">
              <span class="text-#606162 w-80px flex-none">开始里程</span>
              <span class="text-#333 font-500 text-right">
                {{ orderDetailInfo.cloudOrderOtherInfoVO.startMileage }} Km
              </span>
            </div>
            <div class="flex justify-between text-11px">
              <span class="text-#606162 w-80px flex-none">出发地</span>
              <span class="text-#333 font-500 text-right">
                {{ orderDetailInfo.cloudOrderOtherInfoVO.departureLocation }}
              </span>
            </div>
          </div>
          <div
            v-if="
              orderDetailInfo.cloudOrderStopsVOS &&
              orderDetailInfo.cloudOrderStopsVOS.length > 0
            "
          >
            <van-divider />
            <div
              v-for="item in orderDetailInfo.cloudOrderStopsVOS"
              :key="item.id"
            >
              <div class="flex justify-between text-11px">
                <span class="text-#606162 w-80px flex-none">中途停靠点</span>
                <span class="text-#333 font-500 text-right">
                  {{ item.stopName }}
                </span>
              </div>
            </div>
          </div>
          <div v-if="orderDetailInfo.cloudOrderOtherInfoVO.endDashboardUrl">
            <van-divider />
            <div class="text-#606162 text-11px">结束用车仪表盘</div>
            <div class="w78px h78px">
              <van-image
                v-if="orderDetailInfo.cloudOrderOtherInfoVO.endDashboardUrl"
                :src="orderDetailInfo.cloudOrderOtherInfoVO.endDashboardUrl"
                width="100%"
                height="100%"
                @click="
                  ImagePreview(
                    orderDetailInfo.cloudOrderOtherInfoVO.endDashboardUrl
                  )
                "
              ></van-image>
            </div>
            <div class="flex justify-between text-11px pt-10px">
              <span class="text-#606162 w-80px flex-none">结束里程</span>
              <span class="text-#333 font-500 text-right">
                {{ orderDetailInfo.cloudOrderOtherInfoVO.endMileage }} Km
              </span>
            </div>
            <div class="flex justify-between text-11px">
              <span class="text-#606162 w-80px flex-none">目的地</span>
              <span class="text-#333 font-500 text-right">
                {{ orderDetailInfo.cloudOrderOtherInfoVO.destinationLocation }}
              </span>
            </div>
          </div>
          <div v-if="orderDetailInfo.cloudOrderOtherInfoVO.mileage">
            <van-divider />
            <div class="flex justify-between text-11px pt-10px">
              <span class="text-#606162 w-80px flex-none">实际公里数</span>
              <span class="text-#333 font-500 text-right">
                {{ orderDetailInfo.cloudOrderOtherInfoVO.mileage }} Km
              </span>
            </div>
            <div class="flex justify-between text-11px pt-10px">
              <span class="text-#606162 w-80px flex-none">停车费</span>
              <span class="text-#333 font-500 text-right">
                {{ orderDetailInfo.cloudOrderOtherInfoVO.parkingFee }} 元
              </span>
            </div>
            <div class="flex justify-between text-11px pt-10px">
              <span class="text-#606162 w-80px flex-none">路桥费</span>
              <span class="text-#333 font-500 text-right">
                {{ orderDetailInfo.cloudOrderOtherInfoVO.tollFee }} 元
              </span>
            </div>
            <div class="flex justify-between text-11px pt-10px">
              <span class="text-#606162 w-80px flex-none">燃油费</span>
              <span class="text-#333 font-500 text-right">
                {{ orderDetailInfo.cloudOrderOtherInfoVO.fuelCost }} 元
              </span>
            </div>
            <div class="flex justify-between text-11px pt-10px">
              <span class="text-#606162 w-80px flex-none">误餐费</span>
              <span class="text-#333 font-500 text-right">
                {{ orderDetailInfo.cloudOrderOtherInfoVO.mealAllowance }} 元
              </span>
            </div>
            <div class="flex justify-between text-11px pt-10px">
              <span class="text-#606162 w-80px flex-none">其他费用</span>
              <span class="text-#333 font-500 text-right">
                {{ orderDetailInfo.cloudOrderOtherInfoVO.otherExpenses }} 元
              </span>
            </div>
          </div>

          <div v-if="orderDetailInfo.cloudOrderOtherInfoVO.imgUrls">
            <van-divider />
            <div class="text-#606162 text-11px">上传凭证</div>
            <div class="upload-warp">
              <div
                v-for="(item, index) in JSON.parse(
                  orderDetailInfo.cloudOrderOtherInfoVO.imgUrls
                )"
                :key="index"
                class="upload-item"
                @click="ImagePreview(item)"
              >
                <van-image
                  v-if="item"
                  :src="item"
                  width="100%"
                  height="100%"
                ></van-image>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="orderDetailInfo.cloudOrerServiceProcessVOS"
          class="bg-#fff px-15px"
        >
          <steps
            :key="stepsKey"
            :steps-data="stepsData"
            :active="stepsActive"
          />
        </div>
      </div>
    </div>
  </Transition>

  <!-- 开始服务 -->
  <van-dialog
    v-model:show="orderStartVisible"
    show-cancel-button
    :before-close="oderStartBeforeClose"
    @closed="closeStartDialog"
  >
    <template #title>
      <div
        class="text-14px text-#333 text-left px-10px pb-8px b-b-1px b-#e5e5e5 b-solid b-0 box-border mx-10px"
      >
        旅程开始信息
      </div>
    </template>
    <template #default>
      <van-form ref="startInfoFormRef" class="p-10px" required>
        <van-field
          v-model="startFormData.startDashboardUrl"
          :border="false"
          name="开始用车仪表盘"
          label="开始用车仪表盘"
          label-align="top"
          input-align="left"
          :rules="[{ required: true, message: '请上传凭证' }]"
        >
          <template #input>
            <div
              v-if="!startFormData.startDashboardUrl"
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
                class="w-full h-full relative"
                :src="startFormData.startDashboardUrl"
                @click="ImagePreview(startFormData.startDashboardUrl)"
              >
                <!-- 删除按钮 -->
                <div class="absolute top-1px right-1px">
                  <van-icon
                    name="clear"
                    size="18"
                    @click.stop="delImageHandle('startDashboardUrl')"
                  />
                </div>
              </van-image>
            </div>
          </template>
        </van-field>
        <van-field
          v-model="startFormData.startMileage"
          name="开始里程"
          label="开始里程"
          placeholder="请输入"
          class="my-field"
          :border="false"
          type="digit"
          :rules="[{ required: true, message: '请输入开始公里数' }]"
        >
          <template #right-icon>
            <span>Km</span>
          </template>
        </van-field>
        <van-field
          v-model="startFormData.departureLocation"
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
    </template>
  </van-dialog>

  <!-- 中途停靠点 -->
  <van-dialog
    ref="stopDialogRef"
    v-model:show="orderStopVisible"
    show-cancel-button
    :beforeClose="oderStopBeforeClose"
    title="中途停靠点"
    @closed="closeStopDialog"
  >
    <van-form ref="stopInfoFormRef" class="px-12px" required>
      <van-field
        v-model="stopFormData.stopName"
        name="中途停靠点"
        label=""
        placeholder="点击选择停靠点"
        rows="1"
        autosize
        readonly
        type="textarea"
        :border="false"
        class="my-field my-field-border my-10px"
        input-align="left"
        :rules="[{ required: true, message: '请输入停靠点' }]"
        @click="goMap('stop')"
        @click-right-icon="goMap('stop')"
      >
        <template #right-icon>
          <van-icon name="location" color="#0F62FE" />
        </template>
      </van-field>
    </van-form>
  </van-dialog>

  <!-- 改派申请 -->
  <van-dialog
    ref="reassignDialogRef"
    v-model:show="reassignVisible"
    show-cancel-button
    :beforeClose="oderReassignBeforeClose"
    @closed="closeReassignDialog"
  >
    <template #title>
      <div
        class="flex flex-justify-between px-10px pb-8px b-b-1px b-#e5e5e5 b-solid b-0 box-border mx-10px"
      >
        <div class="text-14px text-#333 text-left font-500">改派申请</div>
        <div class="text-#0F62FE text-11px">
          {{ calculateOrderStatus(Number(orderDetailInfo.orderStatus)) }}
        </div>
      </div>
    </template>
    <template #default>
      <van-form ref="reassignInfoFormRef" required="auto">
        <van-cell-group inset class="py-20px m0">
          <van-field
            v-model="reassignFormData.reason"
            is-link
            readonly
            name="改派原因"
            label="改派原因"
            placeholder="请选择"
            :rules="[{ required: true, message: '请选择改派原因' }]"
            @click="showReasonAction = true"
          >
          </van-field>
          <van-field
            v-model="reassignFormData.imagesStr"
            :border="false"
            name="reassignImages"
            label-align="top"
            input-align="left"
            :rules="[{ required: true, message: '请上传图片' }]"
          >
            <template #label>
              <span>
                <span class="text-#333">请至少上传1张图片</span>
                <span class="text-#949596">
                  (请至少上传1张图片，至多上传3张图片！）</span
                >
              </span>
            </template>
            <template #input>
              <div class="flex">
                <template
                  v-for="(item, index) in reassignFormData.initiatorImgUrl"
                  :key="index"
                >
                  <div class="w69px h69px mr-10px">
                    <van-image
                      class="w-full h-full relative"
                      :src="item"
                      @click="ImagePreview(item)"
                    >
                      <!-- 删除按钮 -->
                      <div class="absolute top-1px right-1px">
                        <van-icon
                          name="clear"
                          size="18"
                          @click.stop="delImageHandle('ImgUrls', index)"
                        />
                      </div>
                    </van-image>
                  </div>
                </template>
              </div>
              <div
                v-if="reassignFormData.initiatorImgUrl.length < 3"
                class="upload-box"
              >
                <div
                  class="upload-item"
                  @click="uploadImageHandle('reassignImages')"
                >
                  <svg class="icon upload-icon" aria-hidden="true">
                    <use xlink:href="#icon-xiangji"></use>
                  </svg>
                  <span class="upload-text">拍照上传</span>
                </div>
              </div>
            </template>
          </van-field>
        </van-cell-group>
      </van-form>
    </template>
  </van-dialog>

  <!-- 改派原因 -->
  <van-action-sheet
    v-model:show="showReasonAction"
    :actions="reasonActions"
    cancel-text="取消"
    close-on-click-action
    @cancel="showReasonAction = false"
    @select="onSelectReason"
  />

  <!-- 用车性质变更 -->
  <van-dialog
    ref="natureChangeRef"
    v-model:show="natureChangeVisible"
    show-cancel-button
    :beforeClose="natureChangeBeforeClose"
    @closed="closeNatureChangeDialog"
  >
    <template #title>
      <div
        class="flex flex-justify-between px-10px pb-8px b-b-1px b-#e5e5e5 b-solid b-0 box-border mx-10px"
      >
        <div class="text-14px text-#333 text-left font-500">
          用车性质变更申请
        </div>
        <div class="text-#0F62FE text-11px">
          {{ calculateOrderStatus(Number(orderDetailInfo.orderStatus)) }}
        </div>
      </div>
    </template>
    <template #default>
      <van-form ref="natureFormRef">
        <van-field
          v-model="natureFormData.newUserTypeText"
          is-link
          readonly
          name=""
          label="变更为"
          placeholder="请选择"
          :rules="[{ required: true, message: '请选择' }]"
          @click="showNatureAction = true"
        >
          <template #label>
            <span class="text-#0F62FE text-14px mr-10px">
              {{ orderDetailInfo.userType }}</span
            >
            <span>变更为</span>
          </template>
        </van-field>
      </van-form>
    </template>
  </van-dialog>

  <!-- 异常报备 -->
  <van-dialog
    ref="anomalyChangeRef"
    v-model:show="anomalyVisible"
    show-cancel-button
    :beforeClose="anomalyChangeBeforeClose"
    @closed="anomalyDialogClosed"
  >
    <template #title>
      <div
        class="flex flex-justify-between px-10px pb-8px b-b-1px b-#e5e5e5 b-solid b-0 box-border mx-10px"
      >
        <div class="text-14px text-#333 text-left font-500">异常报备</div>
        <div class="text-#0F62FE text-11px"></div>
      </div>
    </template>
    <template #default>
      <van-form ref="anomalyFormRef">
        <van-field
          v-model="anomalyFormData.useStartDate"
          readonly
          label="服务时间"
          input-align="right"
          :border="false"
          class="py-5px"
        >
        </van-field>
        <van-field
          v-model="anomalyFormData.userType"
          readonly
          label="用车性质"
          input-align="right"
          :border="false"
          class="py-5px"
        >
        </van-field>
        <van-field
          v-model="anomalyFormData.carModel"
          readonly
          label="车型"
          input-align="right"
          :border="false"
          class="py-5px"
        >
        </van-field>
        <van-field
          v-model="anomalyFormData.trainFlight"
          readonly
          label="航班/车次"
          input-align="right"
          :border="false"
          class="py-5px"
        >
        </van-field>
        <van-field
          v-model="anomalyFormData.newUserTypeText"
          readonly
          is-link
          label="异况类型"
          input-align="right"
          placeholder="请选择"
          :border="false"
          :rules="[{ required: true, message: '请选择异况类型' }]"
          @click="showaAnomalyAction = true"
        >
        </van-field>
        <van-cell-group inset class="p-2px">
          <van-field
            v-model="anomalyFormData.description"
            class="border-1 b-solid b-#E5E5E5"
            rows="2"
            autosize
            label=""
            type="textarea"
            maxlength="50"
            placeholder="请输入"
            show-word-limit
          />
        </van-cell-group>
        <van-field
          v-model="anomalyFormData.imagesStr"
          :border="false"
          name="anomalyImages"
          label-align="top"
          input-align="left"
        >
          <template #label>
            <span>
              <span class="text-#949596">
                (请至少上传1张图片，至多上传3张图片！）</span
              >
            </span>
          </template>
          <template #input>
            <div class="flex">
              <template
                v-for="(item, index) in anomalyFormData.anomalyImgUrl"
                :key="index"
              >
                <div class="w69px h69px mr-10px">
                  <van-image
                    class="w-full h-full relative"
                    :src="item"
                    @click="ImagePreview(item)"
                  >
                    <!-- 删除按钮 -->
                    <div class="absolute top-1px right-1px">
                      <van-icon
                        name="clear"
                        size="18"
                        @click.stop="delImageHandle('anomaly', index)"
                      />
                    </div>
                  </van-image>
                </div>
              </template>
            </div>
            <div
              v-if="anomalyFormData.anomalyImgUrl.length < 3"
              class="upload-box"
            >
              <div
                class="upload-item"
                @click="uploadImageHandle('anomalyImages')"
              >
                <svg class="icon upload-icon" aria-hidden="true">
                  <use xlink:href="#icon-xiangji"></use>
                </svg>
                <span class="upload-text">拍照上传</span>
              </div>
            </div>
          </template>
        </van-field>
      </van-form>
    </template>
  </van-dialog>

  <!-- 用车性质选择 -->
  <van-action-sheet
    v-model:show="showNatureAction"
    :actions="natureActions"
    cancel-text="取消"
    close-on-click-action
    @cancel="showNatureAction = false"
    @select="onSelectNature"
  />

  <!-- 异况类型选择 -->
  <van-action-sheet
    v-model:show="showaAnomalyAction"
    :actions="anomalyActions"
    cancel-text="取消"
    close-on-click-action
    @cancel="showaAnomalyAction = false"
    @select="onSelectAnomaly"
  />
</template>

<style scoped lang="scss">
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

.upload-warp {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 3px;
  row-gap: 3px;
  column-gap: 3px;
  .upload-item {
    width: 78px;
    height: 78px;
    background: #fff;
    border-radius: 3px;
    border: 1px dashed #e5e5e5;
    padding: 3px;
    box-sizing: border-box;
  }
}

.shadow-box {
  box-shadow: 0px 0 7px 0px rgba(0, 0, 0, 0.14);
}
</style>
