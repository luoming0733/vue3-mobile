namespace BaseResponseType {
  export interface Type {
    code: string
    message: string
  }
}

/** 定义平台相关的 */
namespace Platform {
  /** 司机信息 */
  export interface DriverInfoResponseData {
    corporateName: string
    driverCarUseArea: string
    driverFranchiseeSerialNo: string
    driverName: string
    driverSerialNo: string
    driverType: string
    loginTime: number
    phone: string
    token: string
  }
  /** 登录接口返回的数据 */
  export interface IGetLoginDriverInfoResponseType
    extends BaseResponseType.Type {
    data: DriverInfoResponseData
  }

  /** 微信配置 */
  export interface WeChatConfigResponseData {
    jsapiTicket: string
    signature: string
    appId: string
    nonceStr: string
    url: string
    timestamp: string
  }

  /** 微信签名 */
  export interface IWeChatSignatureResponseType extends BaseResponseType.Type {
    data: WeChatConfigResponseData
  }
}
