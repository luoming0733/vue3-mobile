<template>
  <div class="m-10px bg-#fff shadow b b-solid b-#e5e5e5">
    <div
      class="flex flex-justify-between flex-items-center mx-12px h-44px font-600 b-b-1px b-solid b-#e5e5e5 b-0 text-#333 box-border"
    >
      <div class="code-title">订单号</div>
      <div class="code-item">{{ orderDetailInfo.orderNumber }}</div>
    </div>
    <div class="py-10px px-12px">
      <div class="flex h-30px lh-30px font-400 text-14px">
        <div class="w-100px text-#949596 lh-21px">开始时间</div>
        <div class="flex-1 text-right lh-21px">
          {{ startTime }}
        </div>
      </div>
      <div class="flex h-30px lh-30px font-400 text-14px">
        <div class="w-100px text-#949596 lh-21px">车型-车牌</div>
        <div class="flex-1 text-right lh-21px">
          {{ orderDetailInfo.carModelName }}-{{ orderDetailInfo.licensePlate }}
        </div>
      </div>
      <div class="flex h-30px lh-30px font-400 text-14px">
        <div class="w-100px text-#949596 lh-21px">用车性质</div>
        <div class="flex-1 text-right lh-21px">
          {{ orderDetailInfo.userType }}
        </div>
      </div>
      <div class="flex h-30px lh-30px font-400 text-14px">
        <div class="w-100px text-#949596 lh-21px">出发地</div>
        <div class="flex-1 text-right lh-21px">
          {{ orderDetailInfo.departureLocation }}
        </div>
      </div>
      <div class="flex h-30px lh-30px font-400 text-14px">
        <div class="w-100px text-#949596 lh-21px">目的地</div>
        <div class="flex-1 text-right lh-21px">
          {{ orderDetailInfo.destination }}
        </div>
      </div>
      <div class="flex h-30px lh-30px font-400 text-14px">
        <div class="w-100px text-#949596 lh-21px">航班/车次</div>
        <div class="flex-1 text-right lh-21px">
          {{ orderDetailInfo.trainFlight }}
        </div>
      </div>
      <!-- <div class="flex h-30px lh-30px font-400 text-14px">
        <div class="w-100px text-#949596 lh-21px">旅客姓名</div>
        <div class="flex-1 text-right lh-21px">{{ orderDetailInfo.passengers }}</div>
      </div>
      <div class="flex h-30px lh-30px font-400 text-14px">
        <div class="w-100px text-#949596 lh-21px">旅客电话</div>
        <div class="flex-1 text-right lh-21px">
          {{ orderDetailInfo.contractAmount }}
        </div>
      </div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import { fmtDate } from '@/utils'

defineOptions({
  name: 'OrderInfo'
})

const props = defineProps({
  orderDetailInfo: {
    type: Object,
    required: true
  }
})

const startTime = computed(() => {
  const useStartDate = props.orderDetailInfo.useStartDate
  return useStartDate ? fmtDate(props.orderDetailInfo.useStartDate) : ''
})
</script>

<style scoped lang="scss"></style>
