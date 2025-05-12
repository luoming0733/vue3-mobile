<script setup lang="ts">
import { showToast } from 'vant'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { commonApi } from '@/apis'
import logo from '@/assets/images/login_logo.png'
import { CONST_ROUTES } from '@/constants'
import { ResultEnum } from '@/enums/httpEnum'
import { $t } from '@/locales'
import { getLocal, setLocal, setToken, startCountdown } from '@/utils'
import jsBridge from '@/utils/jsBridge'

defineOptions({ name: CONST_ROUTES.LOGIN.name })

// 跳转路由
const router = useRouter()

// 登录表单
const loginForm = ref({
  phoneNumber: getLocal('rememberPhone') || '',
  driverPassword: '',
  code: '',
  loginType: ''
})

const isPasswordLogin = ref(true)

// 倒计时
const sendSmsText = ref($t('page.login.codeLogin.getCode'))

// 是否可点击
const sendSmsIsClick = ref(true)

// 登录按钮loading
const submitLoading = ref(false)

// 协议
const checked = ref(false)

// // 找回密码
// const showResetPasswordDialog = () => {
//   showDialog({
//     title: '温馨提示',
//     message: '请联系调度重置密码'
//   })
// }

/**
 * 发送验证码
 * @return {Promise<void>}
 */
const sendLoginCode = async () => {
  if (!sendSmsIsClick.value) {
    showToast('请稍后再发送')
    return
  }
  // 校验手机号码
  const validPhone =
    /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/.test(
      loginForm.value.phoneNumber
    )
  if (!validPhone) return showToast('请输入正确的手机号')

  try {
    sendSmsIsClick.value = false
    const { phoneNumber } = loginForm.value
    const res = await commonApi.sendSms(phoneNumber, 'sendPhoneCode')
    if (res.code !== ResultEnum.SUCCESS) {
      showToast(res.message)
      return
    }
    showToast('验证码已发送')
    startCountdown(sendSmsText, sendSmsIsClick)
  } catch (error) {
    console.error(error)
    sendSmsText.value = $t('page.login.codeLogin.getCode')
  }
}

/**
 * 注册
 */
const goRegister = () => {
  router.push({ name: CONST_ROUTES.REGISTER.name })
}

/**
 * 登录
 * @param {object} values - 登录表单数据
 * @return {Promise<void>} 提交完成时解析的 Promise。
 */
const onSubmit = async ({
  phoneNumber,
  driverPassword,
  code
}: {
  phoneNumber: string
  driverPassword: string
  code: string
}) => {
  if (!phoneNumber) {
    showToast({ message: '请输入手机号', position: 'bottom' })
    return
  }
  if (!driverPassword && isPasswordLogin.value) {
    showToast({ message: '请输入密码', position: 'bottom' })
    return
  }
  if (!code && !isPasswordLogin.value) {
    showToast({ message: '请输入验证码', position: 'bottom' })
    return
  }
  if (!checked.value) {
    showToast({
      message: '请同意服务条款及隐私政策',
      position: 'bottom'
    })
    return
  }

  // 校验手机号码
  const validPhone =
    /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/.test(
      loginForm.value.phoneNumber
    )
  if (!validPhone) {
    showToast({ message: '请输入正确的手机号', position: 'bottom' })
    return
  }

  try {
    submitLoading.value = true
    const res = await commonApi.login({
      phoneNumber,
      driverPassword,
      code,
      loginType: isPasswordLogin.value ? 1 : 2
    })
    if (res.code === ResultEnum.SUCCESS) {
      router.push({ path: CONST_ROUTES.HOME.path })
      setLocal('user', res.data) // 保存用户信息
      setLocal('rememberPhone', phoneNumber) // 记住账号
      setToken(res.data.token) // 设置token
    } else {
      showToast({
        message: res.message,
        position: 'bottom'
      })
    }
  } finally {
    submitLoading.value = false
  }
}

/**
 * 注册 'callBackJs' 回调事件
 * @return {void}
 */
const registerBackButton = () => {
  jsBridge.registerHandler(
    'callBackJs',
    (_: any, responseCallback: (responseData: { message: string }) => void) => {
      doExitApp()
      responseCallback({ message: 'callBackJs callCameraJs success' })
    }
  )
}

/**
 * 调用退出按钮
 * @return {void}
 */
const doExitApp = () => {
  jsBridge.callHandler('doExitApp', {}, (responseData: string) => {
    console.log(responseData)
  })
}

// /**
//  * 获取位置信息
//  * @return {Promise<void>}
//  */
// const testGetLocation = () => {
//   jsBridge.callHandler(
//     'getLongitudeAndLatitude',
//     { param: '获取手机经纬度' },
//     (responseData: string) => {
//       if (!responseData) return
//       try {
//         const responseDataObj = JSON.parse(responseData)
//         const { longitude, latitude, locationType } = responseDataObj
//         getAddressByLongLat(longitude, latitude) // 修复了 longitude 的重复传递
//       } catch (error) {
//         console.error('解析响应数据失败:', error)
//       }
//     }
//   )
// }

// /**
//  * 根据经纬度获取地址
//  *
//  * @param {string} longitude - 经度
//  * @param {string} latitude - 纬度
//  * @return {Promise<void>}
//  */
// const getAddressByLongLat = async (longitude: string, latitude: string) => {
//   if (!longitude || !latitude) return
//   try {
//     const params = {
//       longitude,
//       latitude,
//       version: '2.0',
//       appkey: import.meta.env.VITE_AMAP_KEY
//     }
//     const {
//       code,
//       data,
//       message
//     }: {
//       code: string
//       data: { address: string; city: string }
//       message: string
//     } = await commonApi.getAddressByLongLat({
//       params
//     })
//     showToast({
//       message: code === ResultEnum.SUCCESS ? data.address : message
//     })
//   } catch (err: unknown) {
//     console.error(err as Error)
//   }
// }

// 前往服务条款
const goAgreement = () => {
  console.log('前往服务条款')

  // router.push({
  //   path: CONST_ROUTES.AGGREEMENT.path
  // })
}

// 前往隐私政策
const goPrivacy = () => {
  console.log('前往隐私政策')
  // router.push({
  //   path: CONST_ROUTES.PRIVACY.path
  // })
}

onMounted(() => {
  registerBackButton()
})
</script>

<template>
  <div class="w-full min-h-100vh">
    <div class="pt-60px flex flex-justify-center">
      <div class="flex flex-items-center">
        <van-image width="139" height="auto" :src="logo" />
      </div>
    </div>
    <!-- 密码登录 -->
    <van-form class="mt-75px px-20px" @submit="onSubmit">
      <van-field
        v-model="loginForm.phoneNumber"
        name="phoneNumber"
        placeholder="请输入手机号"
        :maxlength="11"
        type="tel"
      >
        <template #left-icon>
          <div>
            <span class="text-#3E3F40 b-r-1px b-#3E3F40 b-solid b-0 pr-5px">
              +86
            </span>
          </div>
        </template>
      </van-field>
      <van-field
        v-if="isPasswordLogin"
        v-model="loginForm.driverPassword"
        type="password"
        name="driverPassword"
        placeholder="请输入密码"
      >
      </van-field>
      <van-field
        v-else
        v-model="loginForm.code"
        type="digit"
        name="code"
        placeholder="请输入验证码"
        :maxlength="6"
      >
        <template #button>
          <van-button
            size="small"
            type="default"
            :disabled="!sendSmsIsClick"
            @click="sendLoginCode"
          >
            {{ sendSmsText }}
          </van-button>
        </template>
      </van-field>

      <!-- 协议阅读 -->
      <div class="flex items-center px-20px mt-15px">
        <van-checkbox
          v-model="checked"
          checked-color="#0F62FE"
          shape="square"
          icon-size="16px"
        ></van-checkbox>
        <div class="text-#606162 text-12px ml-5px">
          已阅读并同意<span class="text-#0F62FE" @click="goAgreement">
            {{ $t('page.login.register.service') }} </span
          >及
          <span class="text-#0F62FE" @click="goPrivacy">
            {{ $t('page.login.register.policy') }}
          </span>
        </div>
      </div>
      <div style="margin: 50px 16px 20px">
        <van-button
          block
          type="primary"
          class="h-41px"
          :loading="submitLoading"
          native-type="submit"
        >
          {{ $t('page.login.common.login') }}
        </van-button>
      </div>
    </van-form>

    <div class="flex justify-between px-35px text-#606162 text-13px">
      <div type="text" @click="goRegister">
        {{ $t('page.login.common.register') }}
      </div>
      <!-- <div type="text" @click="showResetPasswordDialog">{{ $t('page.login.pwdLogin.forgetPassword') }}</div> -->
      <div type="text" @click="isPasswordLogin = !isPasswordLogin">
        {{
          isPasswordLogin
            ? $t('page.login.codeLogin.title')
            : $t('page.login.pwdLogin.title')
        }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$icon-size: 18px;

::v-deep(.van-field__left-icon) {
  display: flex;
  align-items: center;
  & > .icon {
    width: $icon-size;
    height: $icon-size;
  }
}
.login-warp {
  background: url(@/assets/images/login-bgc.jpg) no-repeat;
}

.login-btn {
  background: linear-gradient(#4382f7 0%, #60c0fc 100%);
}
</style>
