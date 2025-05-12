import { defineStore } from 'pinia'
import { reactive, toRefs } from 'vue'

import store from '.'

export const useTabBadgeStore = defineStore('tabBadge', () => {
  const state = reactive({
    allOrders: 0,
    completeOrders: 0,
    inProgressOrders: 0,
    pendingOrders: 0
  })

  /**
   * Sets the tab badge count.
   *
   * @param {object} data - Object with `pendingOrders` and `inProgressOrders` properties.
   * @return {void} Nothing.
   */
  function setBadge(data: {
    allOrders: number
    completeOrders: number
    inProgressOrders: number
    pendingOrders: number
  }) {
    Object.assign(state, data)
  }

  return { ...toRefs(state), setBadge }
})

/**
 * Returns the tab badge store hook.
 *
 * @return {object} The tab badge store hook object.
 */
export function useTabBadgeStoreHook() {
  return useTabBadgeStore(store)
}
