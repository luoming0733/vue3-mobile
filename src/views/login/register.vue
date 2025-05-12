<script setup lang="ts">
import { showConfirmDialog, showToast } from 'vant'
import { onMounted, ref, watch } from 'vue'
import wx from 'weixin-js-sdk'

import { commonApi } from '@/apis'
import logo from '@/assets/images/login_logo.png'
import { CONST_ROUTES } from '@/constants'
import { ResultEnum } from '@/enums'
import router from '@/router'
import {
  getSession,
  getWeChatConfig,
  isWeChatBrowser,
  onClickNavTitle,
  startCountdown
} from '@/utils'
import jsBridge from '@/utils/jsBridge'

const registerFormRef = ref<any>(null)
const registerForm = ref({
  supplierSerialNo: '', // 加盟商车队编号
  supplierName: '', // 加盟商车队名称
  driverType: '2', // 司机类型
  driverTypeText: '加盟司机', // 司机类型
  driverName: '', // 司机姓名
  phoneNumber: '',
  code: '' // 验证码
})

const submitDisabled = ref(false)

const checked = ref(false)
const phoneKeyboardShow = ref(false)

const driverTypeActionsShow = ref(false)
const driverTypeActions = ref([
  { name: '加盟司机', value: '2' },
  { name: '自有司机', value: '1' }
])
// 倒计时
const sendSmsText = ref('获取验证码')

// 是否可点击
const sendSmsIsClick = ref(true)

// 判断是否调用jsBridge
const isJsBridge = ref(false)

const onClickLeft = () => {
  history.back()
}

// 设置导航栏高度
const setStatusHeight = () => {
  const statusHeight = getSession('statusHeight')
  if (statusHeight) {
    // 获取 van-nav-bar 元素并设置顶部内边距
    const navBar = document.querySelector('.van-nav-bar') as HTMLElement
    if (navBar) {
      navBar.style.paddingTop = `${statusHeight}px`
    }

    // 获取 nav-bar-con 元素并设置高度
    const navBarCon = document.querySelector('.nav-bar-con') as HTMLElement

    if (navBarCon) {
      // 通过字符串模板创建新的高度样式
      const newStyle = `${Number(statusHeight) + 46}px`
      // 将新的样式应用到 nav-bar-con 元素
      navBarCon.style.height = newStyle
    }
  }
}

// 注册物理按键返回事件
const registerBackButton = () => {
  jsBridge.registerHandler(
    'callBackJs',
    (
      _data: any,
      responseCallback: (responseData: { message: string }) => void
    ) => {
      isJsBridge.value = true
      onClickLeft()
      responseCallback({ message: 'callBackJs callCameraJs success' })
    }
  )
}

/**
 * Calls the 'doScanQr' handler of the native app to scan a QR code.
 *
 * @return {void}
 */
const scanHandler = () => {
  // 判断是否在微信环境
  if (isWeChatBrowser) {
    // 判断是否是IOS设备
    // const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase())
    // if (isIOS) {
    //   getWeChatConfig(window.entryUrl)
    // }
    wx.ready(function () {
      wx.scanQRCode({
        needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
        scanType: ['qrCode'], // 可以指定扫二维码还是一维码，默认二者都有
        success: function (res) {
          const result = res.resultStr // 当needResult 为 1 时，扫码返回的结果
          const data = { context: result }
          handleScanResult(data)
        },
        fail: function () {
          showToast({ message: '扫描失败' })
        }
      })
    })
  }
  // else if (isJsBridge.value) {
  //   jsBridge.callHandler('doScanQr', {}, (responseData: any) => {
  //     console.log('responseData-1101', responseData)
  //   })
  // } else {
  //   // 进入扫描二维码页面
  //   router.push({ name: CONST_ROUTES.SCAN_CODE.name })
  // }
  jsBridge.callHandler('doScanQr', {}, (responseData: any) => {
    console.log('responseData-1101', responseData)
  })
}

/**
 * Registers a handler for the 'callScanQrJs' event to receive the scan result.
 *
 * When the native app calls the 'callScanQrJs' handler, this function will be called.
 * The function will receive the scan result as a string through the `_data` parameter.
 * The function should then send a response message back to the native app by calling
 * the `responseCallback` function.
 *
 * @return {void}
 */
const registerScanResponse = () => {
  jsBridge.registerHandler(
    'callScanQrJs',
    (
      _data: any,
      responseCallback: (responseData: { message: string }) => void
    ) => {
      const data = JSON.parse(_data)
      handleScanResult(data)
      responseCallback({ message: 'callScanQrJs callCameraJs success' })
    }
  )
}

/**
 * Processes the scan result received from the native app.
 *
 * Extracts the URL from the `context` property of the input data, parses the URL to retrieve
 * query parameters, and updates the registration form with the supplier serial number and name.
 * If the supplier serial number is not present, a toast message is displayed indicating a scan failure.
 *
 * @param {Object} data - The scan result data containing the URL in its `context` property.
 * @param {string} data.context - The URL string to be parsed for query parameters.
 * @return {void}
 */
const handleScanResult = (data: any) => {
  const context = data.context
  // 解析URL中的参数
  const url = new URL(context)
  const params = url.searchParams
  const supplierSerialNo = params.get('k')
  const supplierName = params.get('t')
  if (!supplierSerialNo || supplierSerialNo === '') {
    showToast('扫码失败,请重新扫码')
    return
  }
  registerForm.value.supplierSerialNo = supplierSerialNo
  registerForm.value.supplierName = supplierName ?? ''
}

/**
 * Handles the selection of a driver type action.
 *
 * Updates the driver type in the registration form with the selected name
 * and hides the driver type action sheet. Logs the selected name to the console.
 *
 * @param {Object} param - 参数对象
 * @return {void}
 */
const driverTypeActionsOnSelect = ({
  name,
  value
}: {
  name: string
  value: string
}) => {
  registerForm.value.driverTypeText = name
  registerForm.value.driverType = value
  driverTypeActionsShow.value = false
}

/**
 * 发送用于驾驶员注册的短信代码。
 * @description
 * 验证注册表中的电话号码并发送短信
 * 提供的电话号码的代码。如果SMS显示祝酒消息
 * 发送失败或电话号码验证失败。启动倒计时
 * 发送成功后重新发送短信代码的计时器。
 *
 * @return {Promise<void>} 解决短信代码何时发送或是否发生错误。
 * @throws {Error} 如果SMS发送或电话号码验证失败，则记录错误。
 */
const sendSmsCode = async () => {
  if (!sendSmsIsClick.value) {
    showToast('请稍后再发送')
    return
  }
  try {
    // 先进行表单验证
    await registerFormRef.value.validate('phoneNumber')
    sendSmsIsClick.value = false
    sendSmsText.value = '发送中...'
    const { phoneNumber } = registerForm.value
    const url = 'sendPhoneCodeForDriverRegistration'
    const { code, message } = await commonApi.sendSms(phoneNumber, url)
    if (code !== ResultEnum.SUCCESS) {
      sendSmsText.value = '重新发送'
      sendSmsIsClick.value = true
      showToast(message)
      return
    }
    showToast('验证码已发送')
    startCountdown(sendSmsText, sendSmsIsClick)
  } catch (err: any) {
    sendSmsIsClick.value = true
    sendSmsText.value = '获取验证码'
  }
}

/**
 * @description: 提交注册信息
 * @param {object} registerForm - 注册信息
 * @return {Promise<void>}
 */
const onSubmit = () => {
  if (!checked.value) {
    return showToast({ message: '请阅读并同意用户服务协议、隐私政策' })
  }
  registerFormRef.value.validate().then(async () => {
    const { code, message } = await commonApi.driverRegister(registerForm.value)
    if (code !== ResultEnum.SUCCESS) {
      return showToast(message)
    }
    showConfirmDialog({
      title: '注册成功',
      message: '初始密码: 88888888，请前往登录页登录',
      showCancelButton: false
    }).then(() => {
      onClickLeft()
    })
  })
  console.log(registerForm.value)
}

watch(
  () => registerForm.value,
  () => {
    if (
      registerForm.value.supplierName &&
      registerForm.value.driverType &&
      registerForm.value.driverName &&
      registerForm.value.phoneNumber &&
      registerForm.value.code
    ) {
      submitDisabled.value = false
    } else {
      submitDisabled.value = true
    }
  },
  { deep: true, immediate: true }
)

onMounted(() => {
  // initWeChatConfig() // 注入微信权限验证配置
  setStatusHeight()
  registerBackButton()
  registerScanResponse()
})
</script>

<template>
  <div class="page">
    <div v-if="!isWeChatBrowser" class="nav-bar-con">
      <van-nav-bar
        :fixed="true"
        :placeholder="false"
        :safe-area-inset-top="false"
        @click-left="onClickLeft"
      >
        <template #left>
          <van-icon name="arrow-left" size="22" />
        </template>
        <template #title>
          <span @click="onClickNavTitle">注册</span>
        </template>
      </van-nav-bar>
    </div>

    <van-form
      ref="registerFormRef"
      class="pt-20px"
      required
      label-width="auto"
      @submit="onSubmit"
    >
      <div class="py-35px flex flex-justify-center">
        <div class="flex flex-items-center">
          <van-image width="139" height="auto" :src="logo" />
        </div>
      </div>
      <van-cell-group inset>
        <van-field
          v-model="registerForm.supplierName"
          name="supplierName"
          label=" "
          placeholder="所属加盟商车队"
          readonly
          :rules="[{ required: true, message: '请扫描加盟商车队二维码' }]"
          right-icon="scan"
          @click-right-icon="scanHandler"
        />
        <van-field
          v-model="registerForm.driverTypeText"
          label=" "
          name="driverTypeText"
          placeholder="司机类型"
          readonly
          :rules="[{ required: true, message: '请选择司机类型' }]"
          @click="driverTypeActionsShow = true"
        >
          <template #right-icon>
            <van-icon name="arrow-down" />
          </template>
        </van-field>
        <van-field
          v-model="registerForm.driverName"
          label=" "
          name="driverName"
          placeholder="请输入姓名"
          :rules="[{ required: true, message: '请输入姓名' }]"
        />
        <van-field
          v-model="registerForm.phoneNumber"
          label=" "
          name="phoneNumber"
          placeholder="请输入手机号码"
          readonly
          clickable
          :rules="[
            {
              required: true,
              message: '请输入手机号码',
              trigger: 'onChange'
            },
            {
              pattern: /^1[3-9]\d{9}$/,
              message: '请输入正确的手机号码',
              trigger: 'onBlur'
            }
          ]"
          @touchstart.stop="phoneKeyboardShow = true"
        />
        <van-field
          v-model="registerForm.code"
          label=" "
          name="code"
          type="digit"
          maxlength="6"
          placeholder="请输入验证码"
          :rules="[{ required: true, message: '请输入验证码' }]"
        >
          <template #button>
            <van-button
              size="small"
              type="default"
              :disabled="!sendSmsIsClick"
              @click="sendSmsCode"
              >{{ sendSmsText }}</van-button
            >
          </template>
        </van-field>
        <van-checkbox
          v-model="checked"
          class="mt-10px mb-30px ml-16px"
          icon-size="16px"
        >
          <span class="text-#606162 text-12px">
            我已阅读并同意用户<span>服务协议</span>、<span>隐私政策</span>
          </span>
        </van-checkbox>
      </van-cell-group>

      <div style="margin: 16px">
        <van-button
          block
          type="primary"
          native-type="submit"
          :disabled="submitDisabled"
        >
          提交
        </van-button>
      </div>
    </van-form>
  </div>

  <!-- 司机类型 -->
  <van-action-sheet
    v-model:show="driverTypeActionsShow"
    :actions="driverTypeActions"
    @select="driverTypeActionsOnSelect"
  />

  <!-- 手机号码数字键盘 -->
  <van-number-keyboard
    v-model="registerForm.phoneNumber"
    :show="phoneKeyboardShow"
    :maxlength="11"
    @blur="phoneKeyboardShow = false"
  />
</template>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  .nav-bar-con {
    height: 46px;
    box-sizing: border-box;
  }
}
</style>
