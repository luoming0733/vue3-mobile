// 修改密码
<script setup lang="ts">
import { showConfirmDialog, showLoadingToast, showToast } from 'vant'
import { ref } from 'vue'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { commonApi, userApi } from '@/apis'
import { CONST_ROUTES } from '@/constants'
import { ResultEnum } from '@/enums'
import { useAuthStore } from '@/store'
import {
  getLocal,
  isWeChatBrowser,
  registerBackButton,
  removeToken,
  setStatusHeight,
  startCountdown
} from '@/utils'

const router = useRouter()
const user = getLocal('user')

const formdata = ref<Auth.ChangePassword>({
  phoneNumber: user.phone,
  code: '',
  password: '',
  reenteredPassword: ''
})
const sendSmsText = ref('获取验证码')
const sendSmsIsClick = ref(true)

const showPassword = ref(false)

const submitDisabled = ref(false)

// 返回
const onClickLeft = () => {
  router.back()
}

// 获取短信验证码
const sendSms = async () => {
  if (!sendSmsIsClick.value) return showToast({ message: '请稍后再发送' })
  sendSmsIsClick.value = false
  sendSmsText.value = '发送中...'
  const { phone } = user
  const url = 'sendPhoneCodeForDriverChangePassword'
  try {
    const { code, message } = await commonApi.sendSms(phone, url)
    if (code !== ResultEnum.SUCCESS) {
      sendSmsText.value = '重新发送'
      sendSmsIsClick.value = true
      showToast(message)
      return
    }

    showToast('验证码已发送')
    startCountdown(sendSmsText, sendSmsIsClick)
  } catch (error) {
    console.error(error as string)
  }
}

// 密码格式校验
const validatorPassword = (value: string) => {
  // 必须是6-20个英文字母、数字或符号(除空格)，且字母、数字和标点符号至少包含两种
  const regex =
    /^(?![a-zA-Z]+$)(?![0-9]+$)(?![\W]+$)(?=.{6,20}$)[a-zA-Z0-9\W]+$/

  return regex.test(value)
}

// 空格校验
const validatorEmpty = (value: string) => {
  const regex = /\s/

  return !regex.test(value)
}

// 二次密码校验
const validatorReenteredPassword = (value: string) => {
  return value === formdata.value.password
}

// 提交
const onSubmit = async (values: Auth.ChangePassword) => {
  submitDisabled.value = true
  try {
    showLoadingToast({
      message: '请稍等...',
      forbidClick: true
    })
    const { code, message } = await userApi.changePassword(values)
    if (code !== ResultEnum.SUCCESS) return showToast({ message })
    showConfirmDialog({
      message: '密码修改成功',
      confirmButtonText: '我知道了',
      showCancelButton: false
    }).then(() => {
      removeToken()
      useAuthStore().clearUser()
      router.replace(CONST_ROUTES.LOGIN.path)
    })
  } catch (error) {
    console.error(error)
  } finally {
    submitDisabled.value = false
  }
}

onMounted(() => {
  setStatusHeight()
  registerBackButton(onClickLeft)
})
</script>

<template>
  <div class="page" :class="{ 'pt-10px': isWeChatBrowser }">
    <div v-if="!isWeChatBrowser" class="nav-bar-con">
      <van-nav-bar
        title="修改密码"
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

    <van-form class="mt-12px" @submit="onSubmit">
      <van-cell-group inset class="py-40px">
        <div class="text-#010202 text-20px px-16px mb-40px">设置新密码</div>
        <van-field
          v-model="formdata.phoneNumber"
          name="phoneNumber"
          type="digit"
          placeholder="请输入手机号码"
          readonly
          :rules="[{ required: true, message: '请输入手机号码' }]"
        >
          <template #button>
            <van-button
              size="small"
              type="default"
              round
              plain
              :disabled="!sendSmsIsClick"
              @click="sendSms"
            >
              {{ sendSmsText }}
            </van-button>
          </template>
        </van-field>
        <van-field
          v-model="formdata.code"
          type="digit"
          name="code"
          :maxlength="6"
          placeholder="请输入验证码"
          :rules="[{ required: true, message: '请输入验证码' }]"
        >
        </van-field>

        <van-field
          v-model="formdata.password"
          :type="showPassword ? 'text' : 'password'"
          name="password"
          placeholder="输入新密码"
          :maxlength="20"
          :rules="[
            { required: true, message: '输入新密码' },
            { validator: validatorPassword, message: '密码格式不正确' },
            { validator: validatorEmpty, message: '密码不能包含空格' }
          ]"
        />
        <van-field
          v-model="formdata.reenteredPassword"
          :type="showPassword ? 'text' : 'password'"
          name="reenteredPassword"
          placeholder="确认新密码"
          :maxlength="20"
          :rules="[
            {
              required: true,
              message: '请输入确认密码'
            },
            {
              validator: validatorReenteredPassword,
              trigger: 'onChange',
              message: '两次密码不一致'
            }
          ]"
        />

        <div class="p-16px text-#555555 text-11px">
          必须是6-20个英文字母、数字或符号(除空格)，且字母、数字和标点符号至少包含两种
        </div>

        <van-checkbox
          v-model="showPassword"
          shape="square"
          class="p-16px"
          icon-size="18px"
        >
          <span class="text-#555 text-14px">显示密码</span>
        </van-checkbox>

        <div class="submit-password-btn">
          <van-button
            block
            type="primary"
            native-type="submit"
            :disabled="submitDisabled"
          >
            提交
          </van-button>
        </div>
      </van-cell-group>
    </van-form>
  </div>
</template>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background-color: #f4f4f4;
  .nav-bar-con {
    height: 46px;
  }
}

.submit-password-btn {
  position: fixed;
  width: 100%;
  left: 0;
  bottom: 100px;
  padding: 0 30px;
  box-sizing: border-box;
}
</style>
