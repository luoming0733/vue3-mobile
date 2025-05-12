<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { CONST_ROUTES } from '@/constants'
import { getSession } from '@/utils'
import jsBridge from '@/utils/jsBridge'

const cellList = ref([
  {
    path: CONST_ROUTES.REAL_NAME.path,
    title: CONST_ROUTES.REAL_NAME.title
  },
  // {
  //   path: CONST_ROUTES.DRIVING_CARD.path,
  //   title: CONST_ROUTES.DRIVING_CARD.title
  // },
  {
    path: CONST_ROUTES.DRIVING_LICENSE.path,
    title: CONST_ROUTES.DRIVING_LICENSE.title
  }
])

// 点击返回按钮
const onClickLeft = () => {
  history.back()
}

// 设置导航栏高度
const setStatusHeight = () => {
  const statusHeightValue = getSession('statusHeight')
  if (statusHeightValue) {
    const navBar = document.querySelector('.van-nav-bar') as HTMLElement
    const page = document.querySelector('.page') as HTMLElement

    if (navBar && page) {
      navBar.style.paddingTop = `${statusHeightValue}px`
      page.style.minHeight = `calc(100vh - 46px - ${statusHeightValue}px)`
    } else {
      console.error('未找到对应元素')
    }
  } else {
    console.error('statusHeight 不存在或不合法')
  }
}

// 注册物理按键返回事件
const registerBackButton = () => {
  jsBridge.registerHandler(
    'callBackJs',
    (
      _data: string,
      responseCallback: (responseData: { message: string }) => void
    ) => {
      onClickLeft()
      responseCallback({ message: 'callBackJs callCameraJs success' })
    }
  )
}

onMounted(() => {
  registerBackButton()
  setStatusHeight()
})
</script>

<template>
  <van-nav-bar
    title="证件信息"
    :fixed="true"
    :placeholder="true"
    :safe-area-inset-top="true"
    @click-left="onClickLeft"
  >
    <template #left>
      <van-icon name="arrow-left" size="22" />
    </template>
  </van-nav-bar>
  <!-- 菜单列表 -->
  <van-cell-group class="m0">
    <van-cell
      v-for="item in cellList"
      :key="item.path"
      is-link
      :to="{ path: item.path }"
      class="flex-items-center"
    >
      <template #title>
        <span class="custom-title ml10px">{{ item.title }}</span>
      </template>
    </van-cell>
  </van-cell-group>
</template>

<style scoped lang="scss">
@import '@/assets/styles/profile.scss';
</style>
