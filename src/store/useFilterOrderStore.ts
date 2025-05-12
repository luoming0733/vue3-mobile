import { defineStore } from 'pinia'
import { reactive, toRefs } from 'vue'

import store from '.'

export const useFilterOrderStore = defineStore('filterOrder', () => {
  const state = reactive({
    isFilter: false
  })

  function setFilter(filter: boolean) {
    state.isFilter = filter
  }

  return { ...toRefs(state), setFilter }
})

export function useFilterOrderStoreHook() {
  return useFilterOrderStore(store)
}
