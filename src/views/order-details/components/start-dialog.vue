<template>
  <van-dialog
    v-model:show="dialogVisible"
    show-cancel-button
    @confirm="confirm"
    @closed="closed"
    @cancel="cancel"
  >
    <template #title>
      <div
        class="text-14px text-#333 text-left px-10px pb-8px b-b-1px b-#e5e5e5 b-solid b-0 box-border mx-10px"
      >
        旅程开始信息
      </div>
    </template>
    <template #default>
      <van-form class="px-10px">
        <van-field
          v-model="formData.startMileage"
          name="开始里程"
          label="开始里程"
          placeholder="请输入"
          class="my-field"
          :border="false"
          type="number"
          :rules="[{ required: true, message: '请输入开始公里数' }]"
        >
          <template #right-icon>
            <span>Km</span>
          </template>
        </van-field>
        <van-field
          v-model="formData.departureLocation"
          name="出发地"
          label="出发地"
          placeholder="请点击按钮获取"
          readonly
          clearable
          :border="false"
          rows="1"
          autosize
          type="textarea"
          class="my-field my-field-border"
          :rules="[{ required: true, message: '请输入出发地' }]"
          @click-right-icon="goMap('start')"
          @click="goMap('start')"
        >
          <template #right-icon>
            <van-icon name="location" color="#0F62FE" />
          </template>
        </van-field>
      </van-form>
    </template>
  </van-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { CONST_ROUTES } from '@/constants'

const route = useRoute()
const router = useRouter()

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const formData = ref({
  startDashboardUrl: '',
  startMileage: '',
  departureLocation: '',
  latitude: '',
  longitude: ''
})

const emit = defineEmits(['update:show', 'confirm'])

// 确定
const confirm = () => {
  emit('update:show', false)
  emit('confirm', formData.value)
}

// 事件关闭
const closed = () => {
  emit('update:show', false)
}

const cancel = () => {
  emit('update:show', false)
}

// 前往地图选择位置
const goMap = (type: string) => {
  const { orderStatus, orderNumber, subOrderSerialNo } = route.query
  router.push({
    name: CONST_ROUTES.SELECT_ADDRESS.name,
    query: {
      type: type,
      backPath: '/orderDetails',
      orderStatus,
      orderNumber,
      subOrderSerialNo
    }
  })
}

const dialogVisible = computed(() => props.show)
</script>
