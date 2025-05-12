<template>
  <van-nav-bar
    title="选择位置"
    :fixed="true"
    :placeholder="true"
    :safe-area-inset-top="true"
    @click-left="onClickLeft"
  >
    <template #left>
      <van-icon name="arrow-left" size="22" />
    </template>
  </van-nav-bar>
  <div class="page h-90vh">
    <!-- 搜索框 -->
    <div class="searchBox">
      <input
        id="search"
        type="text"
        placeholder="输入关键字选取地点"
        autocomplete="off"
      />
    </div>
    <div id="map" class="h-full w-full"></div>
    <div class="bg-#fff fixed bottom-0 left-0 w-full pt-20px pb-20px z-999">
      <div class="flex flex-justify-between flex-items-center mb-10px px-15px">
        <div class="flex-1 text-14px text-#949596">{{ addressValue }}</div>
        <div class="w-20px ml-10px" @click="getCurrentPosition">
          <van-loading
            v-if="locationLoad"
            type="spinner"
            color-blue
            size="24"
          />
          <van-icon v-else name="location" color-blue size="24" />
        </div>
      </div>
      <div class="px-15px">
        <van-button
          type="primary"
          size="small"
          class="w-full"
          @click="saveAddress"
        >
          确定
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onActivated, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { CONST_ROUTES } from '@/constants'
import { getSession } from '@/utils'
import jsBridge from '@/utils/jsBridge'

defineOptions({
  name: CONST_ROUTES.SELECT_ADDRESS.name
})

const onClickLeft = () => history.back()

const addressValue = ref<string>('')
const lat = ref<string>('')
const lng = ref<string>('')

// const map = ref<AMap.Map | null>(null)

const my_geolocation = ref<any>(null)

const locationLoad = ref(false)

const router = useRouter()
const route = useRoute()

const callBackPath = ref<any>('')
const callBackType = ref<any>('')

const initMap = () => {
  const map = new AMap.Map('map', {
    zoom: 18, // 初始地图级别
    resizeEnable: true, // 是否监控地图容器尺寸变化
    rotateEnable: false, // 是否允许旋转
    pitchEnable: true, // 是否允许倾斜
    pitch: 80, // 地图俯仰角度
    rotation: -15, // 地图旋转角度
    viewMode: '2D', //开启3D视图,默认为关闭
    buildingAnimation: false, //楼块出现是否带动画
    enableHighAccuracy: true, //是否使用高精度定位，默认:true
    expandZoomRange: true, // 是否扩展缩放范围
    zooms: [16, 18] // 地图缩放级别范围
  })

  //地图开始
  AMap.plugin(
    [
      'AMap.ToolBar',
      'AMap.Scale',
      'AMap.OverView',
      'AMap.MapType',
      'AMap.Geolocation'
    ],
    function () {
      const geolocation = new AMap.Geolocation({
        enableHighAccuracy: true, // 是否使用高精度定位，默认:true
        timeout: 4000, // 超过10秒后停止定位，默认：5s
        buttonPosition: 'RB', // 定位按钮的停靠位置
        buttonOffset: new AMap.Pixel(10, 50), // 定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
        panToLocation: true, // 定位成功后将定位到的位置作为地图中心点，默认：true
        zoomToAccuracy: true, // 定位成功后是否自动调整地图视野到定位点
        showCircle: false,
        buttonDom: '<input hidden="true" >'
      })
      my_geolocation.value = geolocation
      map.addControl(geolocation)
      geolocation.getCurrentPosition()
      AMap.event.addListener(geolocation, 'complete', onComplete) // 返回定位信息
      AMap.event.addListener(geolocation, 'error', onError) // 返回定位出错信息
    }
  )

  function onComplete(data: any) {
    // data是具体的定位信息
    console.log(data)
    locationLoad.value = false
  }

  function onError(data: any) {
    // 定位出错
    console.log(data)
    locationLoad.value = false
  }

  AMapUI.loadUI(['misc/PositionPicker'], function (PositionPicker: any) {
    const positionPicker = new PositionPicker({
      mode: 'dragMap', //dragMap：拖拽地图，dragMarker：拖拽点
      map: map,
      iconStyle: {
        //自定义外观
        url: '//webapi.amap.com/ui/1.0/assets/position-picker2.png',
        ancher: [24, 40],
        size: [48, 48]
      }
    })

    positionPicker.on('success', function (positionResult: any) {
      const addressStr = positionResult.address
      const townshipStr = positionResult.regeocode.addressComponent.township
      // 截取 township 后面的地址
      const index = addressStr.indexOf(townshipStr)
      if (index > 0) {
        addressValue.value = addressStr.substring(index + townshipStr.length)
      } else {
        addressValue.value = positionResult.address
      }

      lat.value = positionResult.position.lat
      lng.value = positionResult.position.lng
      // document.getElementById('address').innerHTML = positionResult.address
    })
    positionPicker.on('fail', function () {
      // document.getElementById('address').innerHTML = ' '
      addressValue.value = ''
      lat.value = ''
      lng.value = ''
    })
    positionPicker.start()
  })
  AMapUI.loadUI(['misc/PoiPicker'], function (PoiPicker: any) {
    const poiPicker = new PoiPicker({
      input: 'search'
    })

    // 初始化poiPicker  点击搜索结果列表的回调
    poiPicker.on('poiPicked', function (poiResult: any) {
      const item = poiResult.item
      map.setCenter([item.location.lng, item.location.lat])
    })
  })
}

// 手动获取定位
const getCurrentPosition = () => {
  locationLoad.value = true
  my_geolocation.value.getCurrentPosition()
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

// 设置状态栏高度
const setStatusHeight = () => {
  const statusHeightValue = getSession('statusHeight')
  if (statusHeightValue) {
    const navBar = document.querySelector('.van-nav-bar') as HTMLElement
    const page = document.querySelector('.page') as HTMLElement

    if (navBar && page) {
      navBar.style.paddingTop = `${statusHeightValue}px`
      page.style.minHeight = `calc(100vh - 46px - ${statusHeightValue}px)`
    }
  }
}

// 保存地址
const saveAddress = () => {
  const {
    orderStatus,
    orderNumber,
    subOrderSerialNo,
    startDashboardUrl,
    startMileage,
    backRouteName
  } = route.query
  router.push({
    path: callBackPath.value,
    query: {
      type: callBackType.value,
      address: addressValue.value,
      lat: lat.value,
      lng: lng.value,
      orderStatus,
      orderNumber,
      subOrderSerialNo,
      startDashboardUrl,
      startMileage,
      backRouteName,
      endDashboardUrl: route.query?.endDashboardUrl,
      endMileage: route.query?.endMileage,
      mileage: route.query?.mileage,
      parkingFee: route.query?.parkingFee,
      tollFee: route.query?.tollFee,
      fuelCost: route.query?.fuelCost,
      mealAllowance: route.query?.mealAllowance,
      otherExpenses: route.query?.otherExpenses,
      ImgUrls: route.query?.ImgUrls
    }
  })
}

onMounted(() => {
  // 获取路由参数
  const { type, backPath } = router.currentRoute.value.query
  callBackPath.value = backPath
  callBackType.value = type

  initMap()
  registerBackButton()
  setStatusHeight()
})

onActivated(() => {
  // 获取路由参数
  const { type, backPath } = router.currentRoute.value.query
  callBackPath.value = backPath
  callBackType.value = type
  registerBackButton()
  setStatusHeight()
})
</script>

<style scoped lang="scss">
@import '@/assets/styles/profile.scss';

.searchBox {
  position: fixed;
  top: 20;
  left: 0;
  width: 100%;
  z-index: 9999;
  height: auto;
  padding: 10px 20px;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0);
}

#search {
  width: 100%;
  height: 38px;
  border-radius: 20px;
  border: 1px solid #ccc;
  outline: none;
  background: rgba(255, 255, 255, 0.5);
  padding-left: 10px;
  box-sizing: border-box;
}
</style>
