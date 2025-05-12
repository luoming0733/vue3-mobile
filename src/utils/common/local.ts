/**
 * 从session storage中获取一个值
 * @param url 键
 * @returns 存储的值
 */
export const getSession = (url: string) => {
  return window.sessionStorage.getItem(url)
}

/**
 * 在session storage中设置一对键值
 * @param url 键
 * @param value 值
 * @returns 存储的值
 */
export const setSession = (url: string, value: any) => {
  return window.sessionStorage.setItem(url, value)
}

/**
 * 从session storage中删除一对键值
 * @param url 键
 * @returns 删除的值
 */
export const removeSession = (url: string) => {
  return window.sessionStorage.removeItem(url)
}

/**
 * 清空session storage
 * @returns {void}
 */
export const clearSession = () => {
  return window.sessionStorage.clear()
}

/**
 * 设置本地存储
 * @param name - 本地存储名称
 * @param data - 本地存储数据
 * @returns {void}
 */
export const setLocal = (name: string, data: any) => {
  return window.localStorage.setItem(name, JSON.stringify(data))
}

/**
 * 获取本地存储
 *
 * @param {string} name - 本地存储名称
 * @return {any} - 本地存储数据
 */
export const getLocal = (name: string): any => {
  const value = window.localStorage.getItem(name)
  if (value) {
    return JSON.parse(value)
  }
  return null
}

/**
 * 清除本地存储
 *
 * @param {string} name - 本地存储名称
 * @return {void}
 */
export const clearLocal = (name: string) => {
  return window.localStorage.removeItem(name)
}
