// 修改密码

<script setup lang="ts">
import { showConfirmDialog, showLoadingToast, showToast } from 'vant'
import type { Ref } from 'vue'
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

const formdata = ref<Auth.ChangePhone>({
  oldPhone: user.phone,
  newCode: '',
  newPhone: '',
  oldCode: ''
})

const sendSmsTextOld = ref('获取验证码')
const sendSmsIsClickOld = ref(true)

const sendSmsTextNew = ref('获取验证码')
const sendSmsIsClickNew = ref(true)

const submitDisabled = ref(false)

// 返回
const onClickLeft = () => {
  router.back()
}

// 校验新手机号
const validatorNewPhone = (value: string) => {
  const phoneRegex =
    /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/

  return phoneRegex.test(value)
}

const smsClickStatusMap: Record<'Old' | 'New', Ref<boolean>> = {
  Old: sendSmsIsClickOld,
  New: sendSmsIsClickNew
}

const sendSmsTextStatusMap: Record<'Old' | 'New', Ref<string>> = {
  Old: sendSmsTextOld,
  New: sendSmsTextNew
}

// 获取短信验证码
const sendSms = async (type: 'Old' | 'New') => {
  const clickStatus = smsClickStatusMap[type].value
  if (!clickStatus) {
    return showToast({ message: '请稍后再发送' })
  }
  smsClickStatusMap[type].value = false
  sendSmsTextStatusMap[type].value = '发送中...'
  const phone =
    type === 'Old' ? formdata.value.oldPhone : formdata.value.newPhone
  const url =
    type === 'Old'
      ? 'sendPhoneCodeForDriverUpdateOldPhone'
      : 'sendPhoneCodeForDriverUpdateNewPhone'
  try {
    const { code, message } = await commonApi.sendSms(phone, url)
    if (code !== ResultEnum.SUCCESS) {
      sendSmsTextStatusMap[type].value = '重新发送'
      smsClickStatusMap[type].value = true
      showToast(message)
      return
    }
    showToast('验证码已发送')
    startCountdown(sendSmsTextStatusMap[type], smsClickStatusMap[type])
  } catch (error) {
    console.error(error as string)
  }
}

// 提交
const onSubmit = async (values: Auth.ChangePhone) => {
  submitDisabled.value = true
  try {
    showLoadingToast({
      message: '请稍等...',
      forbidClick: true
    })
    const { code, message } = await userApi.updatePhoneNumber(values)
    if (code !== ResultEnum.SUCCESS) return showToast({ message })
    showConfirmDialog({
      message: '手机号码修改成功,请重新登录',
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
  <div class="page">
    <div v-if="!isWeChatBrowser" class="nav-bar-con">
      <van-nav-bar
        title="手机号修改"
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
        <div class="text-#010202 text-20px px-16px mb-40px">当前手机号验证</div>
        <van-field
          v-model="formdata.oldPhone"
          name="oldPhone"
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
              :disabled="!sendSmsIsClickOld"
              @click="sendSms('Old')"
            >
              {{ sendSmsTextOld }}
            </van-button>
          </template>
        </van-field>
        <van-field
          v-model="formdata.oldCode"
          type="digit"
          name="oldCode"
          :maxlength="6"
          placeholder="请输入验证码"
          :rules="[{ required: true, message: '请输入验证码' }]"
        >
        </van-field>

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

      <van-cell-group inset class="py-40px mt-10px">
        <div class="text-#010202 text-20px px-16px mb-40px">新手机号验证</div>
        <van-field
          v-model="formdata.newPhone"
          name="newPhone"
          type="digit"
          placeholder="请输入手机号码"
          :maxlength="11"
          :rules="[
            { required: true, message: '请输入新手机号码' },
            {
              validator: validatorNewPhone,
              trigger: 'onChange',
              message: '请输入正确的手机号码'
            }
          ]"
        >
          <template #button>
            <van-button
              size="small"
              type="default"
              round
              plain
              :disabled="!sendSmsIsClickNew"
              @click="sendSms('New')"
            >
              {{ sendSmsTextNew }}
            </van-button>
          </template>
        </van-field>
        <van-field
          v-model="formdata.newCode"
          type="digit"
          name="newCode"
          :maxlength="6"
          placeholder="请输入新手机号验证码"
          :rules="[{ required: true, message: '请输入验证码' }]"
        >
        </van-field>
        <span></span>
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
