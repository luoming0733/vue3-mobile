import { defineStore } from 'pinia'
import { reactive, toRefs } from 'vue'

import store from '.'

export const useWxConfigStore = defineStore('wxConfig', () => {
  const state = reactive({
    configSuccess: false,
    wxLocation: {
      latitude: 0,
      longitude: 0
    }
  })

  function setConfigSuccess(success: boolean) {
    state.configSuccess = success
  }

  function setWxLocation(latitude: number, longitude: number) {
    state.wxLocation.latitude = latitude
    state.wxLocation.longitude = longitude
  }

  return { ...toRefs(state), setConfigSuccess, setWxLocation }
})

export function useWxConfigStoreHook() {
  return useWxConfigStore(store)
}
