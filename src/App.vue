<script lang="ts">
import { defineComponent, onMounted } from 'vue'

import { useKeepAliveStore } from '@/store'
import { setSession } from '@/utils'
import jsBridge from '@/utils/jsBridge'

import { Tabbar } from './components'
import { useUpdate, useVantConfig } from './hooks'

export default defineComponent({
  name: 'App',
  components: {
    Tabbar
  },
  setup() {
    const config = useVantConfig()

    useUpdate()

    /**
     * 获取当前环境 URL 并确定应用是否在开发环境中运行。
     *
     * 调用 'getUrl' 处理程序并处理响应以检查 URL 是否包含 'dev.hnlot.com.cn'。
     * 如果包含，则设置 VConsole 显示样式为 'block'，使其可见。否则，设置显示样式为 'none'，隐藏它。
     *
     * 记录响应数据到控制台。
     */
    const getEnv = () => {
      jsBridge.callHandler('getUrl', {}, (responseData: any) => {
        if (responseData) {
          const { url } = JSON.parse(responseData)
          const isDev = url.includes('dev.hnlot.com.cn')
          const vConDom = document.getElementById('__vconsole') as HTMLElement
          vConDom.style.display = isDev ? 'block' : 'none'
        }
      })
    }

    /**
     * The list of components that should be kept alive.
     *
     * @type {string[]}
     */
    const keepAliveComponents = useKeepAliveStore().getKeepAliveComponents

    /**
     * Calculates the status bar height adjusted for the device pixel ratio.
     *
     * This function takes the raw status bar height as input and, if a device pixel ratio
     * is present, it adjusts the height accordingly by dividing the input by the pixel ratio.
     * The adjusted height is then returned as an integer value.
     *
     * @param {number} responseData - The raw status bar height received.
     * @return {number} The adjusted status bar height.
     */
    const calculateStatusHeight = (responseData: number) => {
      let statusHeight = responseData
      if (window.devicePixelRatio) {
        statusHeight = Math.floor(responseData / window.devicePixelRatio)
      }
      return statusHeight
    }

    /**
     * Handles the response from the `getStatusBarHeight` operation.
     *
     * This function takes the raw response data and resolves the Promise with the
     * calculated status bar height if the response is valid. If the response is null,
     * the Promise is rejected with an error message.
     *
     * @param {any} responseData - The raw response data.
     * @param {function(number)} resolve - The function to call if the response is valid.
     * @param {function(string)} reject - The function to call if the response is null.
     */
    const handleResponse = (
      responseData: any,
      resolve: (value: number) => void,
      reject: (reason: string) => void
    ) => {
      if (responseData) {
        const statusHeight = calculateStatusHeight(responseData)
        setSession('statusHeight', Number(statusHeight))
        resolve(statusHeight)
      } else {
        reject('getStatusBarHeight failed')
      }
    }

    /**
     * Asynchronously retrieves the status bar height using the jsBridge.
     *
     * This function returns a Promise that resolves with the status bar height,
     * adjusted for the device pixel ratio if applicable. The height is also stored
     * in the session storage for later use. If the operation fails, the Promise
     * is rejected with an error message.
     *
     * @return {Promise<number>} A Promise that resolves with the status bar height.
     */
    const getStatusHeight = () => {
      return new Promise(
        (
          resolve: (value: number) => void,
          reject: (reason: string) => void
        ) => {
          jsBridge.callHandler(
            'getStatusBarHeight',
            { param: 'mobileStatusHeight' },
            (responseData: any) => {
              handleResponse(responseData, resolve, reject)
            }
          )
        }
      )
    }

    onMounted(() => {
      getStatusHeight()
      getEnv()
    })

    return {
      config,
      keepAliveComponents
    }
  }
})
</script>

<template>
  <van-config-provider v-bind="config">
    <RouterView v-slot="{ Component }">
      <keep-alive :include="keepAliveComponents">
        <component :is="Component" />
      </keep-alive>
    </RouterView>
    <Tabbar />
  </van-config-provider>
</template>
