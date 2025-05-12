// store/auth.js
import { defineStore } from 'pinia'
import { reactive, toRefs } from 'vue'

import store from '.'

export const useAuthStore = defineStore('auth', () => {
  const state = reactive({
    user: null // 用户信息，如果为null则表示用户未登录
  })

  /**
   * 在auth存储中设置用户数据。
   * @param {any} userData - 要设置的用户数据。
   * @return {void} 无返回值。
   */
  function setUser(userData: any) {
    state.user = userData
  }

  /**
   * 清除用户数据。
   * @return {void} 无返回值。
   */
  function clearUser() {
    state.user = null
  }

  // 可以添加更多的actions来处理登录、登出等
  return {
    ...toRefs(state),
    setUser,
    clearUser
  }
})

/**
 * 返回身份验证存储钩子。
 * @return {object} 身份验证存储钩子对象。
 */
export function useAuthStoreHook() {
  return useAuthStore(store)
}
