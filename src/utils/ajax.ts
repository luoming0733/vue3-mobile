import type {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios'
import axios from 'axios'
import { showDialog, showToast } from 'vant'

import { useAuthStore } from '@/store'
import { getToken } from '@/utils'

// 常量
const AUTH_TOKEN_HEADER = 'Cloud-Auth-Token'
const LOGIN_TIMEOUT_CODE = '101'
const NETWORK_ERROR_CODE = 'ERR_NETWORK'
const GATEWAY_PATH = 'gateway'
const LOGIN_PATH = '/login'
const TIMEOUT = 10 * 1000

// 环境变量类型
interface EnvConfig {
  uploadUrl: string
  locationUrl: string
  apis: Record<string, string>
}

/**
 * @description 读取环境变量
 * @returns {EnvConfig} 一个对象，包含了环境变量中的uploadUrl、locationUrl和apis
 */
const getEnvConfig = (): EnvConfig => {
  const {
    VITE_GLOB_UPLOAD_URL = '',
    VITE_APP_LOCATION_URL = '',
    ...env
  } = import.meta.env

  return {
    uploadUrl: VITE_GLOB_UPLOAD_URL,
    locationUrl: VITE_APP_LOCATION_URL,
    apis: {
      development: env.VITE_APP_DEV_BASE_URL ?? '',
      production: env.VITE_APP_BASE_URL ?? '',
      test: env.VITE_APP_TEST_BASE_URL ?? '',
      dev: env.VITE_APP_API ?? ''
    }
  }
}

/**
 * 创建一个包含基础 URL、上传 URL 和位置 URL 的基础配置对象。
 *
 * 基础 URL 根据当前环境模式（development、production 或 test）确定，
 * 如果模式不被识别，则回退到生产 URL。
 *
 * @returns {Object} - 基础配置对象
 */
const createBaseConfig = () => {
  const { MODE } = import.meta.env
  const { apis, uploadUrl, locationUrl } = getEnvConfig()

  return {
    baseURL: apis[MODE] || apis.production,
    uploadUrl,
    locationUrl
  }
}

//  Axios 类型
interface CustomAxiosInstance extends AxiosInstance {
  uploadUrl: string
  locationUrl: string
}

/**
 * 创建一个具有自定义配置和属性的 Axios 实例。
 *
 * @returns { CustomAxiosInstance } - 创建的 Axios 实例，具有自定义的配置和属性。
 */
const createService = (): CustomAxiosInstance => {
  const { baseURL, uploadUrl, locationUrl } = createBaseConfig()

  const service = axios.create({
    baseURL,
    timeout: TIMEOUT,
    headers: { 'Content-Type': 'application/json' }
  }) as CustomAxiosInstance

  // 添加自定义属性
  service.uploadUrl = uploadUrl
  service.locationUrl = locationUrl

  return service
}

/**
 * 为提供的 Axios 实例设置请求拦截器。
 *
 * @param { CustomAxiosInstance } service - 要设置请求拦截器的 Axios 实例。
 *
 * 如果请求 URL 不包含 GATEWAY_PATH，拦截器会在请求头中添加授权令牌。
 * 该令牌通过 getToken 函数获取，并添加到 AUTH_TOKEN_HEADER 常量下。
 * 如果令牌不可用，请求将不带令牌发送。
 *
 * @returns 修改后的请求配置或一个包含错误的被拒绝的 promise。
 */
const setupRequestInterceptor = (service: CustomAxiosInstance) => {
  service.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const isGateway = config.url?.includes(GATEWAY_PATH)
      if (config.headers && !isGateway) {
        const token = getToken()
        if (token) {
          config.headers[AUTH_TOKEN_HEADER] = token
        }
      }
      return config
    },
    (error: AxiosError) => Promise.reject(error)
  )
}

/**
 * 为提供的 Axios 实例设置响应拦截器。
 *
 * 该拦截器处理一些特定的错误情况。
 *
 * 如果响应数据的代码为 LOGIN_TIMEOUT_CODE，handleLoginTimeout 函数将被调用，并 reject 响应的数据。
 *
 * 如果响应是一个错误，handleNetworkError 函数将被调用，并 reject 一个标准化的错误对象。
 *
 * @param { CustomAxiosInstance } service - 要设置响应拦截器的 Axios 实例。
 *
 * @returns 修改后的响应配置或一个包含错误的被拒绝的 promise。
 */
const setupResponseInterceptor = (service: CustomAxiosInstance) => {
  service.interceptors.response.use(
    (response: AxiosResponse) => {
      const { data } = response
      if (data.code === LOGIN_TIMEOUT_CODE) {
        handleLoginTimeout()
        return Promise.reject(data)
      }
      return data
    },
    (error: AxiosError) => {
      handleNetworkError(error)
      return Promise.reject(normalizeError(error))
    }
  )
}

// 错误消息常量
const errorMessages: Record<string, string> = {
  NETWORK_ERROR_CODE: '网络异常，请检查网络连接！',
  LOGIN_TIMEOUT_CODE: '登录超时，请重新登录！',
  UNKNOWN_ERROR: '未知错误'
}

/**
 * @description 登录超时处理
 *  1. 显示超时提示
 *  2. 清除用户信息
 *  3. 跳转到登录页
 */
const handleLoginTimeout = async () => {
  await showDialog({ message: errorMessages.LOGIN_TIMEOUT_CODE })
  const authStore = useAuthStore()
  authStore.clearUser()
  window.location.href = LOGIN_PATH
}

/**
 * @description 网络异常处理
 *  1. 显示网络异常提示
 *
 * @param {AxiosError} error - Axios 错误对象
 */
const handleNetworkError = (error: AxiosError) => {
  if (error.code === NETWORK_ERROR_CODE) {
    showToast({ message: errorMessages.NETWORK_ERROR_CODE })
  }
}

/**
 * 将 Axios 错误对象规范化为一个标准化的错误对象。
 *
 * @param {AxiosError} error - 要规范化的 Axios 错误对象。
 *
 * @returns {Object} 一个标准化的错误对象，具有以下属性：
 *   - code: 错误代码，或者 'UNKNOWN_ERROR' 如果错误代码未知。
 *   - message: 错误信息，或者一个默认信息如果错误信息未知。
 *   - data: 错误响应数据，或者 null 如果没有响应数据。
 */
const normalizeError = (error: AxiosError) => {
  return {
    code: error.code || 'UNKNOWN_ERROR',
    message: error.message || errorMessages.UNKNOWN_ERROR,
    data: error.response?.data || null
  }
}

// 创建并配置服务实例
const ajax = createService()
setupRequestInterceptor(ajax)
setupResponseInterceptor(ajax)

export { ajax }
