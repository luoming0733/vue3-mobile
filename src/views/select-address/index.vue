<script setup lang="ts">
import { onActivated, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { CONST_ROUTES } from '@/constants'
import { getSession, isWeChatBrowser } from '@/utils'
import jsBridge from '@/utils/jsBridge'

defineOptions({
  name: CONST_ROUTES.SELECT_ADDRESS.name
})

const addressValue = ref<string>('')
const lat = ref<string>('')
const lng = ref<string>('')

const My_Map = ref<AMap.Map | null>(null)

const my_geolocation = ref<any>(null)

const locationLoad = ref(true)

const router = useRouter()
const route = useRoute()

const callBackPath = ref<any>('')
const callBackType = ref<any>('')

const searchValue = ref<string>('')
const oAddMapPlaceSearch = ref<any>(null)

const addressList = ref<any>([])

const searchResList = ref<any>([])

const onClickLeft = () => history.back()

const citycode = ref('0731')

const searchFocus = ref(false)

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

  My_Map.value = map

  //地图开始
  AMap.plugin(
    [
      'AMap.ToolBar',
      'AMap.Scale',
      'AMap.OverView',
      'AMap.MapType',
      'AMap.Geolocation',
      'AMap.PlaceSearch'
    ],
    function () {
      const geolocation = new AMap.Geolocation({
        enableHighAccuracy: true, // 是否使用高精度定位，默认:true
        timeout: 4000, // 超过10秒后停止定位，默认：5s
        buttonPosition: 'LB', // 定位按钮的停靠位置
        buttonOffset: new AMap.Pixel(10, 50), // 定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
        panToLocation: true, // 定位成功后将定位到的位置作为地图中心点，默认：true
        zoomToAccuracy: true, // 定位成功后是否自动调整地图视野到定位点
        showCircle: false,
        buttonDom: '<input hidden="true" >'
      })
      my_geolocation.value = geolocation
      map.addControl(geolocation)
      geolocation.getCurrentPosition()
      AMap.event.addListener(geolocation, 'complete', onCompletePosition) // 返回定位信息
      AMap.event.addListener(geolocation, 'error', onErrorPosition) // 返回定位出错信息

      const placeSearch = new AMap.PlaceSearch({
        city: citycode.value,
        type: '', // 数据类别
        pageSize: 10, // 每页结果数,默认10
        pageIndex: 1, // 请求页码，默认1
        extensions: 'base' //返回信息详略，默认为base（基本信息）
      })
      oAddMapPlaceSearch.value = placeSearch

      AMap.event.addListener(placeSearch, 'complete', onSearchComplete)
      AMap.event.addListener(placeSearch, 'error', onSearchError)
    }
  )

  /**
   * @description 定位成功回调
   * @param {Object} data  定位信息
   */
  function onCompletePosition(data: any) {
    lat.value = data.position.lat
    lng.value = data.position.lng
    locationLoad.value = false
    citycode.value = data.addressComponent.citycode
  }

  /**
   * @description 定位出错回调
   * @param {Object} data  定位信息
   */
  function onErrorPosition(data: any) {
    locationLoad.value = false
    console.log(data)
  }

  /**
   * @description 搜索完成回调
   * @param {Object} data 搜索结果
   */
  function onSearchComplete(data: any) {
    if (data.info === 'OK') {
      searchResList.value = data.poiList.pois
    }
    if (data.info === '"TIP_CITIES"') {
      searchResList.value = []
    }
    console.log(data)
  }

  /**
   * @description 搜索失败回调
   * @param {Object} data 搜索结果
   */
  function onSearchError(data: any) {
    console.log(data)
  }

  AMapUI.loadUI(['misc/PositionPicker'], function (PositionPicker: any) {
    console.log('misc/PositionPicker')

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
      _toTop()
      addressList.value = positionResult.regeocode.pois
    })
    positionPicker.on('fail', function () {
      addressList.value = []
    })
    positionPicker.start()
  })
}

/**
 * @description 搜索框输入时触发
 * @param {string} query 搜索关键词
 */
const searchOnUpdate = (query: string) => {
  if (query && oAddMapPlaceSearch) {
    oAddMapPlaceSearch.value.search(query)
  } else {
    searchResList.value = []
  }
}

const searchOnCancel = () => {
  searchFocus.value = false
  searchResList.value = []
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
      ImgUrls: route.query?.ImgUrls,
      fuelCostIncluded: route.query?.fuelCostIncluded
    }
  })
}

// 选择地址,拖拽地图,选择位置
const selectAddress = (val: any) => {
  // 保存地址
  addressValue.value = val.name
  lat.value = val.location.lat
  lng.value = val.location.lng
  saveAddress()
}

const _setDistanceUnit = (distance: number) => {
  if (
    isNaN(distance) ||
    distance === null ||
    distance === Infinity ||
    distance === undefined
  ) {
    return ''
  }

  if (distance <= 0) {
    return ''
  }

  if (distance < 1000) {
    return `${distance}米`
  } else {
    return `${(distance / 1000).toFixed(2)}公里`
  }
}

// 滚动条置顶
function _toTop() {
  setTimeout(() => {
    document
      .querySelector('.select-address-warp')
      ?.scrollTo({ top: 0, behavior: 'smooth' })
  }, 200)
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

<template>
  <van-nav-bar
    v-if="!isWeChatBrowser"
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
    <div id="map" class="h-50vh w-full"></div>
    <!-- 定位图标 -->
    <div
      class="location-icon flex flex-justify-center flex-items-center"
      @click="getCurrentPosition"
    >
      <van-loading v-if="locationLoad" type="spinner" size="18" />
      <svg v-else class="w18px w18px" aria-hidden="true">
        <use xlink:href="#icon-dingwei"></use>
      </svg>
    </div>

    <!-- 地址选择 -->
    <div class="select-address-warp">
      <!-- 搜索框 -->
      <van-search
        v-model="searchValue"
        :show-action="searchFocus"
        placeholder="请输入搜索关键词"
        @focus="searchFocus = true"
        @update:model-value="searchOnUpdate"
        @cancel="searchOnCancel"
        @clear="searchResList = []"
      ></van-search>
      <div v-if="searchFocus" class="select-address-list">
        <div
          v-for="(item, index) in searchResList"
          :key="index"
          class="select-address-item"
        >
          <div
            class="flex flex-items-center py-15px b-b-1px b-b-#e5e5e5"
            @click="selectAddress(item)"
          >
            <div class="w-30px">
              <van-icon
                v-if="index === 0"
                name="location"
                color="#1296fa"
                size="20"
              />
              <van-icon v-else name="circle" size="12" />
            </div>
            <div class="flex-1">
              <div class="flex flex-justify-between">
                <div class="text-#333">{{ item.name }}</div>
                <div class="text-#949596 text-12px w-35px text-right flex-none">
                  {{ _setDistanceUnit(item.distance) }}
                </div>
              </div>
              <div class="text-#949596 text-12px">{{ item.address }}</div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="select-address-list">
        <div
          v-for="(item, index) in addressList"
          :key="index"
          class="select-address-item"
        >
          <div
            class="flex flex-items-center py-15px b-b-1px b-b-#e5e5e5"
            @click="selectAddress(item)"
          >
            <div class="w-30px">
              <van-icon
                v-if="index === 0"
                name="location"
                color="#1296fa"
                size="20"
              />
              <van-icon v-else name="circle" size="12" />
            </div>
            <div class="flex-1">
              <div class="flex flex-justify-between">
                <div class="text-#333">{{ item.name }}</div>
                <div class="text-#949596 text-12px w-35px text-right flex-none">
                  {{ _setDistanceUnit(item.distance) }}
                </div>
              </div>
              <div class="text-#949596 text-12px">{{ item.address }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
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

.select-address-warp {
  overflow-y: auto;
  position: fixed;
  bottom: 0;
  z-index: 999;
  background: #fff;
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  height: 50vh;
  // 隐藏滚动条
  &::-webkit-scrollbar {
    display: none;
  }
  .select-address-list {
    height: 100%;
    .select-address-item {
      border-bottom: 1px solid #eee;
    }
  }
}

.location-icon {
  position: fixed;
  left: 10px;
  top: 45vh;
  width: 30px;
  height: 30px;
  z-index: 9999;
  box-sizing: border-box;
  background: #fff;
  border-radius: 50%;
}
</style>
