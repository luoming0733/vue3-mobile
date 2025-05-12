<template>
  <div class="warp">
    <div class="left">
      <img src="@/assets/images/home/home_company.png" alt="" width="37" />
      <div class="text">所属公司</div>
    </div>
    <div class="right">
      <div class="text-#333333">{{ userInfoData.corporateName }}</div>
      <div class="text-#949596">{{ userInfoData.driverName }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getLocal } from '@/utils'

const userInfoData = getLocal('user')
</script>

<style lang="scss" scoped>
.warp {
  width: 354px;
  height: 52px;
  padding: 7px;
  background: linear-gradient(90deg, #ffffff 0%, rgba(255, 255, 255, 0.3) 100%);
  border-radius: 7px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  .left {
    display: flex;
    align-items: center;
    border-right: 2px solid #fff;
    padding-right: 8px;
    .text {
      margin-left: 4px;
      width: 32px;
      height: 37px;
      font-weight: 600;
      font-size: 13px;
      color: #5276ed;
      line-height: 18px;
      letter-spacing: 3px;
      text-align: left;
      font-style: normal;
    }
  }
  .right {
    margin-left: 16px;
    font-weight: 500;
    font-size: 13px;
    line-height: 18px;
    text-align: left;
    font-style: normal;
  }
}
</style>
