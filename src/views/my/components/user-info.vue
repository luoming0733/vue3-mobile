<script lang="ts" setup>
import { showConfirmDialog } from 'vant'
import { ref } from 'vue'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

import avatar from '@/assets/images/avatar.png'
import { CONST_ROUTES } from '@/constants'
import { useFilterOrderStore } from '@/store'
import { getLocal } from '@/utils'
import jsBridge from '@/utils/jsBridge'

defineOptions({
  name: 'UserInfo'
})

const router = useRouter()

const lastClickTime = ref(0)
const clickCount = ref(0)

const modeLastClickTime = ref(0)
const modeClickCount = ref(0)

const mode = ref('')

const filterOrder = ref(false)

// 定义用户信息
interface UserInfoData {
  driverName: string
  phone: string
  driverSerialNo?: string
  token?: string
}

// 用户信息
const userInfoData = ref<UserInfoData>({
  driverName: '',
  phone: '',
  driverSerialNo: '',
  token: ''
})

// 设置用户信息
const setUserInfo = () => {
  const userInfo = getLocal('user')
  if (userInfo) userInfoData.value = userInfo
  filterOrder.value = useFilterOrderStore().isFilter
}

/**
 * Toggle the display of the VConsole debugging tool.
 * The VConsole will appear when the user clicks on the avatar 5 times within 3 seconds.
 * After the VConsole appears, the clickCount will be reset.
 * If the VConsole is already visible, it will be hidden again.
 */
const toggleVc = () => {
  const nowTime = new Date().getTime()
  const isDoubleClick = nowTime - lastClickTime.value < 3000
  clickCount.value = isDoubleClick ? clickCount.value + 1 : 0
  lastClickTime.value = nowTime
  if (clickCount.value >= 5) {
    const vConDom = document.getElementById('__vconsole') as HTMLElement
    clickCount.value = 0
    vConDom.style.display = vConDom.style.display === 'none' ? 'block' : 'none'
  }
}

/**
 * Calls the 'getStatusBarHeight' handler of the native app.
 *
 * The native app will handle the operation and return the status bar height.
 *
 * @return {void}
 */
const getUrl = () => {
  jsBridge.callHandler('getUrl', {}, (responseData: any) => {
    if (responseData) {
      const { url } = JSON.parse(responseData)
      mode.value = url.includes('dev') ? 'Dev' : 'Test'
    }
  })
}

/**
 * Toggles the display of the development/production environment switch.
 * The environment switch will appear when the user clicks on the driver name 5 times within 3 seconds.
 * After the environment switch appears, the clickCount will be reset.
 * If the environment switch is already visible, it will be hidden again.
 */
const toggleDv = () => {
  const nowTime = new Date().getTime()
  const isDoubleClick = nowTime - modeLastClickTime.value < 3000
  modeClickCount.value = isDoubleClick ? modeClickCount.value + 1 : 0
  modeLastClickTime.value = nowTime
  if (modeClickCount.value >= 5) {
    handleEnvironmentSwitch()
    modeClickCount.value = 0
  }
}

/**
 * Handles the environment switch between development and production modes.
 *
 * This function triggers a confirmation dialog asking the user to confirm
 * switching the environment. If confirmed, it toggles the mode between 'Dev'
 * and 'Test', updates the `mode` reactive state, and sends a request to load
 * the new environment URL using the jsBridge.
 *
 * The URLs for each mode are predefined. If the user cancels the dialog,
 * no changes are made.
 */
const handleEnvironmentSwitch = () => {
  const urls = {
    Dev: 'https://cloud.m.dev.supaidan.vip',
    Test: 'https://cloud.m.test.supaidan.vip'
  }
  const currentMode = mode.value
  const nextMode = currentMode === 'Dev' ? 'Test' : 'Dev'

  showConfirmDialog({
    title: '环境切换',
    message: `当前处于${currentMode === 'Dev' ? '开发' : '生产'}环境，是否切换到${nextMode === 'Dev' ? '开发' : '生产'}环境？`
  })
    .then(() => {
      mode.value = nextMode
      jsBridge.callHandler(
        'doLoadUrl',
        { url: urls[nextMode] },
        (responseData: string) => {
          console.log(responseData)
        }
      )
    })
    .catch(() => {
      // on cancel
    })
}

/**
 * Handles the change of the filter switch.
 *
 * This function is called when the user changes the switch of the filter.
 * It updates the `useFilterOrderStore` with the new value of the filter.
 */
const filterOrderChange = (value: boolean) => {
  useFilterOrderStore().setFilter(value)
}

/**
 * 修改手机号码
 */
const editPhone = () => {
  showConfirmDialog({
    title: '确定修改手机号码'
  }).then(() => {
    router.push(CONST_ROUTES.CHANGE_PHONE.path)
  })
}

onMounted(() => {
  setUserInfo()
  getUrl()
})
</script>

<template>
  <!-- 用户信息 -->
  <div class="user-info flex flex-items-center pl-18px">
    <!-- 头像 -->
    <div @click="toggleVc">
      <van-image width="69" height="69" :src="avatar" />
    </div>
    <!-- 用户名+电话号码 -->
    <div class="ml-16px text-#fff">
      <div class="font-800 text-20px mb-7px" @click="toggleDv">
        {{ userInfoData?.driverName }}
      </div>
      <div class="font-400 text-13px flex">
        <div class="mr-6px">
          <span>+86-</span> <span> {{ userInfoData?.phone }}</span>
        </div>
        <svg class="icon text-14px" aria-hidden="true" @click="editPhone">
          <use xlink:href="#icon-bianji"></use>
        </svg>
      </div>
      <!-- 筛选订单 -->
      <div class="filter-order">
        <span>筛选可抢订单</span>
        <van-switch
          v-model="filterOrder"
          size="16px"
          active-color="#0F62FE"
          inactive-color="#3E3F40"
          @change="filterOrderChange"
        />
      </div>
    </div>
  </div>

  <van-floating-bubble
    v-if="mode === 'Dev'"
    axis="xy"
    icon="chat"
    magnetic="x"
    :gap="50"
  >
    <template #default>
      <span>{{ mode }}</span>
    </template>
  </van-floating-bubble>
</template>

<style scoped lang="scss">
.user-info {
  height: 177px;
  background: url('@/assets/images/my-bgc.png') no-repeat 0 0 / 100% 100%;
}

.filter-order {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 250px;
  height: 33px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  margin-top: 10px;
  padding: 10px 8px;
  box-sizing: border-box;
  font-size: 13px;
}
</style>
