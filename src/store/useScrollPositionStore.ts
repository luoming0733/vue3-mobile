import { defineStore } from 'pinia'
import { reactive, toRefs } from 'vue'

import store from '.'

export const useScrollPositionStore = defineStore('scrollPosition', () => {
  const state = reactive({
    scrollTop: 0
  })

  /**
   * Set the scroll top position.
   *
   * @param {number} scrollTop The top position of the scroll.
   */
  function setScrollTop(scrollTop: number) {
    state.scrollTop = scrollTop
  }

  return { ...toRefs(state), setScrollTop }
})

/**
 * Returns the scroll position store hook.
 *
 * @return {object} The scroll position store hook object.
 */
export function useScrollPositionStoreHook() {
  return useScrollPositionStore(store)
}
