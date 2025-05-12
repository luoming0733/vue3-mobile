<template>
  <div class="nav-bar-con">
    <van-nav-bar
      :title="title"
      :fixed="fixed"
      :placeholder="placeholder"
      :safe-area-inset-top="safeAreaInsetTop"
      @click-left="onClickLeft"
    >
      <template v-if="showLeftIcon" #left>
        <van-icon name="arrow-left" size="22" />
      </template>
    </van-nav-bar>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { registerBackButton, setStatusHeight } from '@/utils'

defineOptions({
  name: 'MyNavBar'
})

defineProps({
  title: {
    type: String,
    default: ''
  },
  fixed: {
    type: Boolean,
    default: true
  },
  placeholder: {
    type: Boolean,
    default: false
  },
  safeAreaInsetTop: {
    type: Boolean,
    default: false
  },
  showLeftIcon: {
    type: Boolean,
    default: true
  }
})

const router = useRouter()

/**
 * Handles the click event on the left side of the navigation bar.
 * Navigates back to the previous route in the router history.
 */
const onClickLeft = () => router.back()

onMounted(() => {
  setStatusHeight()
  registerBackButton(onClickLeft)
})
</script>
