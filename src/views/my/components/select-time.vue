<script lang="ts" setup>
import { showToast } from 'vant'
import { onMounted, ref } from 'vue'

import { useDateFilterStore } from '@/store'
import { getSession } from '@/utils'
import jsBridge from '@/utils/jsBridge'

const calendarRef = ref<any>(null)
const selectTimeRange = ref<Array<Date>>([])
const startDate = ref('')
const endDate = ref('')

// 两年内
const minData = new Date(new Date().setFullYear(new Date().getFullYear() - 2))
const maxData = new Date(new Date().setMonth(new Date().getMonth() + 1))

/**
 * Go back to the previous page.
 */
const onClickLeft = () => history.back()

/**
 * Confirm the selected time period.
 *
 * If the user has not selected a time period, show a toast hint.
 * Otherwise, update the `useDate` reactive state with the start and end timestamps,
 * and update the `dateFilterStore` with the formatted date range and the filter name.
 * Finally, go back to the previous page.
 */
const onClickRight = () => {
  if (selectTimeRange.value.length !== 2) {
    showToast({ message: '请选择时间区间', position: 'bottom' })
    return
  }
  const [start, end] = selectTimeRange.value
  startDate.value = formatDate(start)
  endDate.value = formatDate(end)
  useDateFilterStore().setUseDate({
    startDate: `${startDate.value} 00:00:00`,
    endDate: `${endDate.value} 23:59:59`
  })
  useDateFilterStore().setText(`${startDate.value} 至 ${endDate.value}`)
  history.back()
}

/**
 * Format a Date object into a string in the format 'YYYY/MM/DD'.
 * @param {Date} date - The Date object to be formatted.
 * @returns {string} The formatted date string.
 */
const formatDate = (date: Date) =>
  `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`

/**
 * Update the `selectTimeRange` reactive state with the new selected time period.
 *
 * @param {Array<Date>} values - The new selected time period.
 */
const select = (values: Array<Date>) => {
  selectTimeRange.value = values
}

// 设置导航栏高度
const setStatusHeight = () => {
  const statusHeight = getSession('statusHeight')
  if (statusHeight) {
    const navBar = document.querySelector('.van-nav-bar') as HTMLElement
    const navBarCon = document.querySelector('.nav-bar-con') as HTMLElement
    const calendar__header = document.querySelector(
      '.van-calendar__header'
    ) as HTMLElement
    navBar.style.paddingTop = `${statusHeight}px`
    navBarCon.style.height = `${Number(statusHeight) + 46}px`
    calendar__header.style.top = `${Number(statusHeight) + 46}px`
  }
}

// 注册物理按键返回事件
const registerBackButton = () => {
  jsBridge.registerHandler(
    'callBackJs',
    (
      _data: any,
      responseCallback: (responseData: { message: string }) => void
    ) => {
      onClickLeft()
      responseCallback({ message: 'callBackJs callCameraJs success' })
    }
  )
}

onMounted(() => {
  setStatusHeight() // 设置导航栏高度
  registerBackButton() // 注册物理按键返回事件
})
</script>

<template>
  <div class="nav-bar-con">
    <van-nav-bar
      title="选择时间段"
      :fixed="true"
      :placeholder="false"
      :safe-area-inset-top="false"
      :border="false"
      @click-left="onClickLeft"
      @click-right="onClickRight"
    >
      <template #left>
        <van-icon name="cross" size="22" />
      </template>
      <template #right>
        <span class="text-16px text-#333">确定</span>
      </template>
    </van-nav-bar>
  </div>
  <van-calendar
    ref="calendarRef"
    type="range"
    :min-date="minData"
    :max-date="maxData"
    :poppable="false"
    :show-title="false"
    :show-subtitle="false"
    :show-confirm="false"
    :default-date="null"
    color="#434445"
    @select="select"
  />
</template>

<style lang="scss" scoped>
.nav-bar-con {
  height: 46px;
}
:deep(.van-calendar__header) {
  position: sticky;
  top: 46px;
  background-color: #fff;
  z-index: 999;
}
</style>
