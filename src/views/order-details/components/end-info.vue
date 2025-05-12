<template>
  <div class="card-warp">
    <div class="title">
      <div class="code-title">旅程结束信息</div>
      <div class="code-item"></div>
    </div>
    <div class="content">
      <van-form v-if="isEdit" label-width="120">
        <van-field
          name="uploader"
          label="结束用车仪表盘"
          :border="false"
          input-align="right"
          class="p-0"
        >
          <template #input>
            <van-uploader v-model="formData.panelsImages" :max-count="1" />
          </template>
        </van-field>
        <van-field
          v-model="formData.endMileage"
          name="结束里程"
          label="结束里程"
          placeholder="请输入结束里程"
          class="my-field p-0 mt-10px"
          :border="false"
          input-align="right"
          type="number"
          @update:model-value="changeEndMileage"
        >
          <template #extra>
            <div class="my-field-right">KM</div>
          </template>
        </van-field>
        <van-field
          v-model="formData.destinationLocation"
          name="目的地"
          label="目的地"
          placeholder="请输入目的地"
          :border="false"
          class="my-field my-field-border p-0 mt-10px"
          input-align="right"
          @click-right-icon="goMap('end')"
          @click="goMap('end')"
        >
          <template #right-icon>
            <van-icon name="location" color="#0F62FE" />
          </template>
        </van-field>
      </van-form>

      <div v-else class="start-info text-14px">
        <div class="flex flex-justify-between mt-5px">
          <div class="label text-#949596">结束用车仪表盘</div>
          <div class="value text-#333333">
            <div class="w56px h56px">
              <van-image width="56px" height="56px" src=""></van-image>
            </div>
          </div>
        </div>
        <div class="flex flex-justify-between mt-15px">
          <div class="label text-#949596">结束里程</div>
          <div class="value text-#333333">111Km</div>
        </div>
        <div class="flex flex-justify-between mt-15px mb-5px">
          <div class="label text-#949596">目的地</div>
          <div class="value text-#333333">1121</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineExpose, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { CONST_ROUTES } from '@/constants'

defineOptions({
  name: 'OrderInfo'
})

const route = useRoute()
const router = useRouter()

const formData = ref({
  panelsImages: [],
  endMileage: '',
  destinationLocation: '',
  endDashboardUrl: '222'
})

defineProps({
  isEdit: {
    type: Boolean,
    default: true
  },
  data: {
    type: Object,
    default: () => {}
  }
})

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

const emit = defineEmits(['update:endMileage'])

const changeEndMileage = (val: number) => {
  emit('update:endMileage', val)
}

defineExpose({ formData })
</script>

<style scoped lang="scss">
.card-warp {
  margin: 10px;
  background: #ffffff;
  box-shadow: 1px 1px 5px 0px rgba(0, 0, 0, 0.1);
  border-radius: 14px;
  border: 1px solid #e5e5e5;
  .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 44px;
    border-bottom: 1px solid #d8d8d8;
    margin: 0 12px;
    font-weight: 600;
    font-size: 15px;
    color: #333333;
    box-sizing: border-box;
  }
  .content {
    padding: 10px 12px;
    &-item {
      display: flex;
      &-label {
        width: 100px;
        flex: 0 0 auto;
        font-weight: 400;
        font-size: 14px;
        color: #949596;
        line-height: 21px;
        text-align: left;
        font-style: normal;
      }
      &-value {
        flex: 1;
        text-align: right;
        font-weight: 400;
        font-size: 14px;
        color: #333333;
        line-height: 24px;
        font-style: normal;
      }
    }
  }
}
:deep(.my-field) {
  &.my-field-border {
    .van-cell__value {
      border-radius: 3px;
    }
  }
  .van-cell__value {
    padding: 5px 10px;
    border: 1px solid #e5e5e5;
    border-radius: 3px 0 0 3px;
    .van-field__control--right {
      text-align: left;
    }
  }
  .my-field-right {
    width: 42px;
    height: 35px;
    background: #f4f4f4;
    border-radius: 0px 3px 3px 0px;
    border: 1px solid #e5e5e5;
    border-left: none;
    line-height: 35px;
    text-align: center;
  }
}
.start-info {
  .label {
    width: 130px;
    flex: 0 0 auto;
  }
}
</style>
