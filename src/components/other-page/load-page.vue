<template>
  <div class="flex flex-justify-center flex-items-center" :style="{ height }">
    <van-loading vertical>加载中...</van-loading>
  </div>
</template>

<script lang="ts" setup>
import { getHeight } from './'

defineOptions({
  name: 'LoadPage'
})

const props = defineProps({
  height: { type: [String, Number], default: '80vh' }
})

const height = getHeight(props.height)
</script>
