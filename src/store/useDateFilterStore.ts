import { defineStore } from 'pinia'
import { reactive, toRefs } from 'vue'

import store from '.'

export const useDateFilterStore = defineStore('dateFilter', () => {
  const state = reactive({
    startDate: '',
    endDate: '',
    text: '全部订单'
  })

  /**
   * Set the start and end dates.
   *
   * @param {object} data - Object with `startDate` and `endDate` properties.
   * @return {void} Nothing.
   */
  function setUseDate(data: { startDate: string; endDate: string }) {
    Object.assign(state, data)
  }

  /**
   * Set the text in the date filter component.
   *
   * @param {string} text - The text to set.
   * @return {void} Nothing.
   */
  function setText(text: string) {
    state.text = text
  }

  /**
   * Clear the start and end dates.
   *
   * @return {void} Nothing.
   */
  function clearDate() {
    state.startDate = ''
    state.endDate = ''
  }

  return { ...toRefs(state), setUseDate, setText, clearDate }
})

/**
 * Returns the date filter store hook.
 *
 * @return {object} The date filter store hook object.
 */
export function useDateFilterStoreHook() {
  return useDateFilterStore(store)
}
