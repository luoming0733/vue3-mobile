import { ajax } from '@/utils'

import type { LoginParams, SendSmsParams } from '../params'
import type { ILoginResponse, ISendSmsResponse } from '../response'

export type { LoginParams, SendSmsParams }
export type { ILoginResponse, ISendSmsResponse }

type SendSmsUrl =
  | 'sendPhoneCodeForDriverExitTeam'
  | 'sendPhoneCode'
  | 'sendPhoneCodeForDriverRegistration'
  | 'sendPhoneCodeForDriverChangePassword'
  | 'sendPhoneCodeForDriverUpdateOldPhone'
  | 'sendPhoneCodeForDriverUpdateNewPhone'

export const commonApi = {
  /**
   * @description 获取短信验证码
   * @param { string } phoneNumber - 手机号
   * @param { url } url - 'sendPhoneCodeForDriverExitTeam'  | 'sendPhoneCode'  | 'sendPhoneCodeForDriverRegistration'
   * @returns { Promise<ISendSmsResponse> }
   */
  sendSms(phoneNumber: string, url: SendSmsUrl): Promise<ISendSmsResponse> {
    return ajax.post(`/cloud-platform/cloudDriverLogin/${url}`, {
      phoneNumber
    })
  },

  /**
   * @description 登录
   * @param { Object } data - 登录参数
   * @property { string } phoneNumber - 手机号
   * @property { string } driverPassword - 密码
   * @property { string } code - 验证码
   * @property { number } loginType - 登录类型，1-账号密码登录，2-验证码登录
   * @returns { Promise }
   */
  login(data: LoginParams): Promise<ILoginResponse> {
    return ajax.post('/cloud-platform/cloudDriverLogin/doLogin', data)
  },

  /**
   * @description 登出
   * @returns { Promise }
   *  Logout the current user
   */
  logout(): Promise<ILoginResponse> {
    return ajax.post('/cloud-platform/cloudDriverLogin/doLogout')
  },

  /**
   * 上传文件到服务器。
   *
   * @param {Object} data - 要上传的文件数据。
   * @return {Promise} 一个 Promise，它在服务器响应后解析。
   */
  uploadFile(data: any): Promise<any> {
    return ajax.post(`${ajax.uploadUrl}/platform-admin/file/upload`, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  /**
   * 根据地理坐标获取位置信息。
   *
   * @param {Object} data - 地理坐标数据
   * @return {Promise} 一个包含位置信息的 Promise
   */
  getAddressByLongLat(data: any): Promise<any> {
    return ajax.get(`${ajax.locationUrl}/map/amap/reverseAddress`, data)
  },

  /**
   * 根据字典类型获取字典项列表
   * @param {Object} type - 字典类型
   * @return {Promise}
   */
  getDicts(type: string): Promise<any> {
    return ajax.get(`/cloud-platform/dictionary/type/${type}`)
  },

  /**
   * 查询司机退出车队记录
   */
  checkLogoutRecord(params: any): Promise<any> {
    return ajax.get(
      '/cloud-order/cloudDriverOrderController/findDriverExitApprovalInfo',
      { params }
    )
  },

  /**
   * 让司机退出团队。
   * @returns {Promise<any>} 一个 Promise，在司机退出团队后解析。
   */
  driverExitTeam(data: any): Promise<any> {
    return ajax.post(
      `/cloud-order/cloudDriverOrderController/driverExitTeam`,
      data
    )
  },

  /**
   * 司机注册
   */
  driverRegister(data: any): Promise<any> {
    return ajax.post(
      '/cloud-platform/cloudDriverLogin/driverRegistration',
      data
    )
  },

  /**
   * 根据token获取登录司机信息
   */
  getLoginDriverInfo(
    token: string
  ): Promise<Platform.IGetLoginDriverInfoResponseType> {
    return ajax.get('/cloud-platform/cloudDriverLogin/getDriverInfoByToken', {
      params: { token }
    })
  },

  /**
   * 获取微信签名
   * @param url - 当前页面的url
   * @returns {Promise} 一个 Promise，它在服务器响应后解析。
   */
  getSignature(url: string): Promise<Platform.IWeChatSignatureResponseType> {
    return ajax.get('/cloud-platform/wxSignatureController/wx-signature', {
      params: { url }
    })
  }
}
