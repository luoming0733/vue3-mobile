/**
 * 登录传参信息
 */
export interface LoginParams {
  phoneNumber: string
  driverPassword?: string
  code?: string
  loginType: 2 | 1
}

/**
 * 获取短信验证码参数
 */
export interface SendSmsParams {
  phoneNumber: string
}

/**
 * 获取司机订单列表参数
 */
export interface DriverOrderListParams {
  page: number
  size: number
  orderSerialNo?: string
  orderStatus?: string | number | null
}

/**
 * 获取司机订单详情参数
 */
interface DriverOrderDetailsParams {
  orderSerialNo: string
  subOrderSerialNo: string
}
