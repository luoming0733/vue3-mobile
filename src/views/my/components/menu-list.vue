<script setup lang="ts">
import { showConfirmDialog, showLoadingToast, showToast } from 'vant'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { commonApi } from '@/apis'
import { CONST_ROUTES } from '@/constants'
import { CellPath, ResultEnum } from '@/enums'
import { $t } from '@/locales'
import { useAuthStore } from '@/store'
import {
  getLocal,
  removeToken,
  sendPhoneSmsToPhone,
  startCountdown
} from '@/utils'

defineOptions({ name: 'MenuList' })

const userInfo = getLocal('user')

const logoutConvoysShow = ref(false)

const sendSmsText = ref('发送验证码')
const sendSmsIsClick = ref(true)
const router = useRouter()
const logoutFormRef = ref<any>(null)
const logoutReason = ref('')

// 退出车队记录
const logoutRecordShow = ref(false)

// cell 列表
enum CellType {
  MY_ORDER,
  CERTIFICATE,
  MY_WALLET,
  MY_ACHIEVEMENT,
  LOGOUT,
  LOGOUT_CAR_LIST
}
const menuList = ref([
  {
    ...CONST_ROUTES.MY_ORDER,
    title: $t('page.me.menu.allOrder'),
    type: CellType.MY_ORDER,
    show: true
  },
  {
    ...CONST_ROUTES.DRIVING_CARD,
    title: $t('page.me.menu.driverCertification'),
    type: CellType.CERTIFICATE,
    show: true
  },
  {
    ...CONST_ROUTES.MY_VEHICLE,
    title: $t('page.me.menu.myCar'),
    show: true
  },

  {
    ...CONST_ROUTES.MY_ACHIEVEMENT,
    title: $t('page.me.menu.myPerformance'),
    type: CellType.MY_ACHIEVEMENT,
    show: true
  },
  {
    ...CONST_ROUTES.MY_WALLET,
    title: $t('page.me.menu.myWallet'),
    type: CellType.MY_WALLET,
    show: true
  },
  {
    ...CONST_ROUTES.CHANGE_PASSWORD,
    title: $t('page.me.menu.pwdChange'),
    show: true
  },
  {
    path: 'logoutConvoys',
    title: $t('page.me.menu.logoutConvoys'),
    type: CellType.LOGOUT_CAR_LIST,
    // show: userInfo?.driverType !== '1'
    show: true
  },
  {
    path: 'logout',
    title: $t('page.me.menu.loginOut'),
    type: CellType.LOGOUT,
    show: true
  }
])

// logout dialog config
const confirmLogoutDialogConfig = {
  title: '确定退出登录?',
  message: '退出登录后将无法处理订单',
  confirmButtonText: '是',
  cancelButtonText: '否',
  showCancelButton: true
}

// logout carList dialog config
const confirmLogoutConvoysDialogConfig = {
  title: '确定退出车队?',
  confirmButtonText: '是',
  cancelButtonText: '否',
  showCancelButton: true
}

/**
 * logouts the user.
 *
 * @return {Promise<void>}  A promise that resolves when the user is logged out.
 */
const logout = async (): Promise<void> => {
  try {
    const { code, message } = await commonApi.logout()
    if (code === ResultEnum.SUCCESS) {
      removeToken()
      useAuthStore().clearUser()
      router.replace(CONST_ROUTES.LOGIN.path)
    } else {
      showToast({ message })
    }
  } catch (err: unknown) {
    showToast({ message: (err as Error).message || '退出失败' })
  }
}

/**查询是否有退出车队记录 */
const checkLogoutRecord = async () => {
  const loading = showLoadingToast({
    message: '加载中...'
  })
  try {
    const params = { approvalStatus: 0 }
    const { code, data } = await commonApi.checkLogoutRecord(params)
    if (code === ResultEnum.SUCCESS) {
      if (data && data.length > 0) {
        logoutRecordShow.value = true
        return
      } else {
        showConfirmDialog(confirmLogoutConvoysDialogConfig).then(
          showLogoutConvoysDialog
        )
        return
      }
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.close()
  }
}

/**
 * 打开退出车队弹框
 */
const showLogoutConvoysDialog = () => {
  logoutConvoysShow.value = true
}

/**
 * 发送短信验证码
 */
const sendSmsCode = async () => {
  if (!sendSmsIsClick.value) return showToast({ message: '请稍后再发送' })
  sendSmsIsClick.value = false
  sendSmsText.value = '发送中...'
  const { phone } = userInfo
  const url = 'sendPhoneCodeForDriverExitTeam'
  try {
    const { code, message } = await commonApi.sendSms(phone, url)
    if (code !== ResultEnum.SUCCESS) {
      sendSmsText.value = '重新发送'
      sendSmsIsClick.value = true
      showToast({ message })
      return
    }
    startCountdown(sendSmsText, sendSmsIsClick)
    showToast('验证码已发送')
  } catch (error) {
    console.error(error)
    // 可以添加更具体的错误处理逻辑，例如根据不同类型错误给用户提示等
    sendSmsText.value = '重新发送'
    sendSmsIsClick.value = true
  }
}

/**
 * 退出车队弹框关闭后
 */
const logoutConvoysClosed = () => {
  logoutFormRef.value.resetValidation()
  logoutReason.value = ''
}

/**
 * 退出车队前确认
 * @param {string} action 确认动作
 * @returns {Promise<boolean>} 退出结果
 */
const logoutConvoysBeforeClose = (action: string): any => {
  if (action === 'confirm') {
    logoutFormRef.value
      .validate()
      .then(async () => {
        try {
          const params = {
            approvalReason: logoutReason.value,
            approvalType: 3
          }
          const { code, message } = await commonApi.driverExitTeam(params)
          if (code !== ResultEnum.SUCCESS) {
            showToast({ message })
            return false
          }
          logoutConvoysShow.value = false
          logoutRecordShow.value = true
          // removeToken()
          // useAuthStore().clearUser()
          // router.replace(CONST_ROUTES.LOGIN.path)
          return true
        } catch (err: unknown) {
          showToast({ message: (err as Error).message || '退出失败' })
          return false
        }
      })
      .catch(() => {
        return false
      })
  } else {
    logoutReason.value = ''
    return true
  }
}

/**
 * Handles cell click events.
 *
 * @param {string} path - The route path associated with the clicked cell.
 * If the path corresponds to the logout option, shows a confirmation dialog
 * before logging out. Otherwise, navigates to the specified route path.
 */
const onCellClick = (path: string) => {
  if (path === CellPath.LOGOUT) {
    return showConfirmDialog(confirmLogoutDialogConfig).then(logout)
  }
  if (path === CellPath.LOGOUT_CONVOYS) {
    checkLogoutRecord()
    return
  }
  router.push({ path })
}

const sendSmsContent = () => {
  sendPhoneSmsToPhone('10000', '查话费')
}
</script>

<template>
  <!-- 菜单列表 -->
  <van-cell-group class="m0">
    <template v-for="item in menuList" :key="item.path">
      <van-cell
        v-if="item.show"
        is-link
        class="flex-items-center"
        @click="onCellClick(item.path)"
      >
        <template #title>
          <span class="custom-title ml10px">{{ item.title }}</span>
        </template>
      </van-cell>
    </template>
  </van-cell-group>

  <div class="px-10px hidden">
    <van-button class="mt-10px" block type="primary" @click="sendSmsContent"
      >测试</van-button
    >
  </div>

  <van-dialog
    v-model:show="logoutConvoysShow"
    :title="$t('page.me.menu.logoutConvoys')"
    show-cancel-button
    :before-close="logoutConvoysBeforeClose"
    @closed="logoutConvoysClosed"
  >
    <van-form ref="logoutFormRef">
      <van-cell-group inset>
        <van-field
          v-model="logoutReason"
          label-width="60"
          rows="4"
          autosize
          type="textarea"
          label="退出原因"
          placeholder="请输入"
          maxlength="100"
          show-word-limit
          :rules="[{ required: true, message: '请填写退出原因' }]"
        />
        <!-- <van-field
          v-model="logoutForm.phone"
          readonly
          placeholder="请输入手机号"
        />
        <van-field
          v-model="logoutForm.smsCode"
          center
          clearable
          type="digit"
          :maxlength="6"
          placeholder="请输入短信验证码"
          :rules="[{ required: true, message: '请输入短信验证码' }]"
        >
          <template #button>
            <van-button size="small" type="default" @click="sendSmsCode">
              {{ sendSmsText }}
            </van-button>
          </template>
        </van-field> -->
      </van-cell-group>
    </van-form>
  </van-dialog>

  <van-dialog
    v-model:show="logoutRecordShow"
    :title="$t('page.me.menu.logoutConvoys')"
    show-cancel-button
    :show-confirm-button="false"
    cancel-button-text="关闭"
  >
    <div class="p-20px text-13px text-#3E3F40">已提交申请,请耐心等待审核!</div>
  </van-dialog>
</template>
