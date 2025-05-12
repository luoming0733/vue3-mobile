import { defineStore } from 'pinia'
import { reactive, toRefs } from 'vue'

import store from '.'

export const useBadgeStore = defineStore('badge', () => {
  const state = reactive({
    count: ''
  })

  function setBadge(count: string) {
    state.count = count
  }

  return {
    ...toRefs(state),
    setBadge
  }
})

export function useBadgeStoreHook() {
  return useBadgeStore(store)
}
