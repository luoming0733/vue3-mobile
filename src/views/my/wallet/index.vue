// 我的钱包
<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

import develop from '@/components/other-page/develop.vue'
import { isWeChatBrowser, registerBackButton, setStatusHeight } from '@/utils'

const router = useRouter()

const onClickLeft = () => {
  router.back()
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
        title="我的钱包"
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
    <develop />
  </div>
</template>
