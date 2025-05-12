<template>
  <van-steps direction="vertical" :active="stepsActive" active-color="#67C23A">
    <van-step v-for="(item, index) in stepsData" :key="index">
      <!-- 自定义激活状态图标 -->
      <template #active-icon>
        <svg class="icon w12px h12px" aria-hidden="true">
          <use xlink:href="#icon-steps1"></use>
        </svg>
      </template>
      <!-- 自定义未激活状态图标 -->
      <template #inactive-icon>
        <svg class="icon w12px h12px" aria-hidden="true">
          <use xlink:href="#icon-steps"></use>
        </svg>
      </template>
      <!-- 自定义已完成步骤对应的底部图标，优先级高于 inactive-icon -->
      <template #finish-icon>
        <svg class="icon w12px h12px" aria-hidden="true">
          <use xlink:href="#icon-steps1"></use>
        </svg>
      </template>
      <div class="flex justify-between inline-block text-11px">
        <span class="font-600 text-#333">{{ item.processName }}</span>
        <span class="font-400 text-#606162">{{
          calculateStepsTime(item.createDate)
        }}</span>
      </div>
    </van-step>
  </van-steps>
</template>

<script setup lang="ts">
import { watch } from 'vue'

import { calculateStepsTime } from '@/utils'

const props = defineProps({
  stepsData: {
    type: Array as () => {
      processName: string
      createDate: number
      active: number
    }[],
    default: () => []
  },
  stepsActive: {
    type: Number,
    default: -1
  }
})

watch(
  () => props.stepsData,
  () => {},
  {
    deep: true,
    immediate: true
  }
)
</script>

<style scoped lang="scss">
:deep(.van-hairline) {
  &::after {
    border: none;
  }
}
</style>
