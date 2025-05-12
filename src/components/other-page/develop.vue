<template>
  <div
    id="develop"
    class="flex flex-col flex-items-center flex-justify-center"
    :style="{ height }"
  >
    <van-image :src="noDevelop" width="156" height="auto"></van-image>
    <div class="text-#999999 text-14px mt-20px">努力研发中！</div>
  </div>
</template>

<script lang="ts" setup>
import noDevelop from '@/assets/images/empty/no-develop.png'

import { getHeight } from '.'
defineOptions({ name: 'Develop' })

const props = defineProps({
  height: { type: [String, Number], default: '80vh' }
})
const height = getHeight(props.height)
</script>
