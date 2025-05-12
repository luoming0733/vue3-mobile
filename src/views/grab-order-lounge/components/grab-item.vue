<script setup lang="ts">
import { formatToDateTime } from '@/utils'
defineOptions({ name: 'GrabItem' })

defineProps({
  data: {
    type: Object,
    default: () => {}
  }
})

const emit = defineEmits(['rushOrder'])

/**
 * Emit rushOrder event with the given data
 * @param {object} data - Order data
 */
const rushOrder = (data: any) => {
  emit('rushOrder', data)
}

/**
 * Return the number of people in a string format
 * @param {number} number - The number of people
 * @return {string} The number of people in a string format. If the number is 0, return '未知'
 */
const peopleNumber = (num: number) => {
  return num === 0 ? '人数:未知' : `人数:${num}人`
}

/**
 * Determine whether to show the "price exceeds" tag
 * @param {string} isGabEnabled - Whether the order can be grabbed
 * @param {boolean | null} isPriceExceeds - Whether the price exceeds the limit
 * @return {boolean} Whether to show the tag
 */
const showPriceExceedsTag = (
  isGabEnabled: string,
  isPriceExceeds: boolean | null
) => {
  return Number(isGabEnabled) === 0 && isPriceExceeds === false
}
</script>

<template>
  <div class="order-data">
    <div
      class="flex flex-justify-between flex-items-center text-#333 text-14px font-600"
    >
      <div :class="{ isFiled: data.isTimeExceeded === false }">
        <van-icon name="clock" class="mr-5px" size="14" />
        <span class="mr-5px">
          {{ formatToDateTime(data.useStartDate, 'yyyy-MM-dd HH:mm') }}
        </span>
      </div>
      <div class="pr-5px">
        <span>{{ data.userType }}</span>
      </div>
    </div>
    <div class="content">
      <van-row gutter="20">
        <van-col span="9">
          <svg class="icon w-44px" aria-hidden="true">
            <use xlink:href="#icon-a-bianzu12beifen"></use>
          </svg>
        </van-col>
        <van-col span="6"></van-col>
        <van-col span="9">
          <svg class="icon w-44px" aria-hidden="true">
            <use xlink:href="#icon-a-bianzu16beifen"></use>
          </svg>
        </van-col>
      </van-row>
      <van-row class="mt-7px" gutter="20">
        <van-col span="9">
          <div class="text-12px text-#333">
            {{ data.departureLocation ? data.departureLocation : '听客户安排' }}
          </div>
        </van-col>
        <van-col span="6">
          <svg class="icon w-44px" aria-hidden="true">
            <use xlink:href="#icon-bianzubeifen"></use>
          </svg>
        </van-col>
        <van-col span="9">
          <div class="text-12px text-#333">
            {{ data.destination ? data.destination : '听客户安排' }}
          </div>
        </van-col>
      </van-row>
    </div>
    <div class="tags-box">
      <div class="tags" :class="{ isFiled: data.isCarModelIncluded === false }">
        <span class="">{{ data.vehicleTypeName + data.carModelName }}</span>
      </div>
      <div class="tags">
        <span>{{ peopleNumber(Number(data.peopleNumber)) }}</span>
      </div>
      <div>
        <div
          v-if="showPriceExceedsTag(data.isGabEnabled, data.isPriceExceeds)"
          class="tags"
        >
          <svg class="icon text-13px" aria-hidden="true">
            <use xlink:href="#icon-prices-height"></use>
          </svg>
        </div>
      </div>
    </div>
    <!-- 抢单按钮 -->
    <van-button
      v-show="data.isGabEnabled"
      :type="+data.isGabEnabled === 1 ? 'success' : 'default'"
      :class="{ 'bg-#AAB0B6': +data.isGabEnabled === 0 }"
      :disabled="+data.isGabEnabled === 0"
      block
      class="mt-14px text-#fff"
      @click.stop="rushOrder(data)"
    >
      抢单</van-button
    >
  </div>
</template>

<style scoped lang="scss">
.order-data {
  background: #ffffff;
  border: 1px solid rgba(159, 160, 163, 0.2);
  border-radius: 7px;
  margin: 7px 0 14px 0;
  padding: 18px 12px;
  box-sizing: border-box;

  .content {
    background-color: #f4f4f4;
    padding: 12px 12px 16px 12px;
    margin-top: 11px;
  }

  .tags-box {
    display: flex;
    margin-top: 9px;

    .tags {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 17px;
      background: #ffffff;
      border-radius: 2px;
      border: 1px solid #d8d8d8;
      font-size: 10px;
      color: #949596;
      padding: 1px 6px;
      margin-right: 3px;
    }
  }
}
.isFiled {
  color: #f87171 !important;
  border-color: #f87171 !important;
}
</style>
