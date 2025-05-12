<template>
  <div
    id="empty"
    class="flex flex-col flex-items-center flex-justify-center"
    :style="{ height }"
  >
    <van-image :src="emptyImg" width="156" height="auto"></van-image>
    <div class="text-#999999 text-14px my-20px">{{ description }}</div>
    <div
      v-if="isRefresh"
      class="flex flex-items-center flex-justify-center text-center text-#999"
      @click="clickOnRefresh"
    >
      <van-icon name="replay" size="24" />
      <span class="text-#999">点击刷新</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import emptyImg from '@/assets/images/empty/empty.png'

import { getHeight } from './'

defineOptions({ name: 'Empty' })

const props = defineProps({
  height: { type: [String, Number], default: '80vh' },
  description: { type: String, default: '暂无数据' },
  isRefresh: { type: Boolean, default: false }
})

const height = getHeight(props.height)

const emit = defineEmits(['refresh'])

const clickOnRefresh = () => {
  emit('refresh')
}
</script>
