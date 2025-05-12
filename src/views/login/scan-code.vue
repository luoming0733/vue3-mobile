<script setup lang="ts">
import { QrcodeStream } from 'vue-qrcode-reader'
import { ref } from 'vue'
import { showSuccessToast } from 'vant'

// 定义变量
const dataList = ref('')
const result = ref(true)
const error = ref('')

// 扫码后返回的结果
const onDecode = (res: any) => {
  dataList.value = res
  result.value = false
  console.log('你好', dataList.value)
  showSuccessToast('扫描成功')
  // 调用后台接口存入数据库
  // 数据存入数据库后跳转页面
}
// 初始化摄像头
const onInit = async (promise: any) => {
  console.log('初始化摄像头', promise)
  try {
    await promise
  } catch (err: any) {
    if (err.name === 'NotAllowedError') {
      error.value = 'ERROR: 您需要授予相机访问权限'
    } else if (err.name === 'NotFoundError') {
      error.value = 'ERROR: 这个设备上没有摄像头'
    } else if (err.name === 'NotSupportedError') {
      error.value = 'ERROR: 所需的安全上下文(HTTPS、本地主机)'
    } else if (err.name === 'NotReadableError') {
      error.value = 'ERROR: 相机被占用'
    } else if (err.name === 'OverconstrainedError') {
      error.value = 'ERROR: 安装摄像头不合适'
    } else if (err.name === 'StreamApiNotSupportedError') {
      error.value = 'ERROR: 此浏览器不支持流API'
    }
  }
}
// 返回上一页箭头
const onClickLeft = () => {
  history.back()
}
</script>

<template>
  <div style="height: 100vh">
    <qrcode-stream @detect="onDecode" @error="onInit" style="height: 100%">
      <div>
        <div class="qr-scanner">
          <!--顶部左边的返回箭头-->
          <div>
            <van-icon class="scanImg" @click="onClickLeft" name="arrow-left" />
          </div>
          <!--中间的扫码框-->
          <div class="box">
            <div class="line"></div>
            <div class="angle"></div>
          </div>
          <div class="txt">将二维码/条码放入框内，即自动扫描</div>
        </div>
      </div>
    </qrcode-stream>
  </div>
</template>

<style scoped>
:deep(i.van-badge__wrapper.van-icon.van-icon-arrow-left.scanImg) {
  font-size: 40px;
  color: white;
}
.scanImg {
  margin-top: 30px;
  margin-left: 10px;
}
.error {
  font-weight: bold;
  color: red;
}
.cameraMessage {
  width: 100%;
  height: 60px;
}
.qr-scanner {
  background-size: 3rem 3rem;
  background-position: -1rem -1rem;
  width: 100%;
  /* height: 100%; */
  height: 100vh;
  /* height: 288px; */
  position: relative;
  background-color: #1110;
}
.qr-scanner .box {
  width: 213px;
  height: 213px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  overflow: hidden;
  border: 1px solid #3aa5ff;
}
.qr-scanner .txt {
  width: 100%;
  height: 35px;
  line-height: 35px;
  font-size: 14px;
  text-align: center;
  /* color: #f9f9f9; */
  margin: 0 auto;
  position: absolute;
  top: 70%;
  left: 0;
}
.qr-scanner .myQrcode {
  text-align: center;
  color: #3aa5ff;
}
.qr-scanner .line {
  height: calc(100% - 2px);
  width: 100%;
  background: linear-gradient(180deg, rgba(0, 255, 51, 0) 43%, #3aa5ff 211%);
  border-bottom: 1px solid #3aa5ff;
  transform: translateY(-100%);
  animation: radar-beam 2s infinite alternate;
  animation-timing-function: cubic-bezier(0.53, 0, 0.43, 0.99);
  animation-delay: 1.4s;
}

.qr-scanner .box:after,
.qr-scanner .box:before,
.qr-scanner .angle:after,
.qr-scanner .angle:before {
  content: '';
  display: block;
  position: absolute;
  width: 3vw;
  height: 3vw;
}

.qr-scanner .box:after,
.qr-scanner .box:before {
  top: 0;
  border-top-color: #3aa5ff;
}

.qr-scanner .angle:after,
.qr-scanner .angle:before {
  bottom: 0;
  border-bottom-color: #3aa5ff;
}

.qr-scanner .box:before,
.qr-scanner .angle:before {
  left: 0;
  border-left-color: #3aa5ff;
}

.qr-scanner .box:after,
.qr-scanner .angle:after {
  right: 0;
  border-right-color: #3aa5ff;
}

@keyframes radar-beam {
  0% {
    transform: translateY(-100%);
  }

  100% {
    transform: translateY(0);
  }
}
</style>
