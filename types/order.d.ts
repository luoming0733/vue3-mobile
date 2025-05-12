/**
 * 基础响应类型
 */
namespace BaseResponseType {
  export interface Type {
    code: string
    message: string
  }
}

/**
 * 抢单
 */
namespace GrabList {
  // 先定义最内层records数组中每个元素对应的类型
  export interface RecordType {
    actualAmount: null | number // 这里假设实际金额可能为null或者数字类型，根据实际情况调整
    addType: string
    carModelName: string
    carModelSerialNo: string
    carUseArea: string
    carUseAreaName: null | string
    cloudDriverSerialNo: null | string
    cloudOrerServiceProcessVOS: null | any[] // 不太明确具体类型，暂设为null或者数组类型
    contactPerson: string
    contactPhone: string
    contractAmount: null | number
    createBy: string
    createDate: number
    customerMsg: string
    deleteBy: null | string
    deleteDate: null | number
    deleteFlag: number
    departureLocation: string
    destination: string
    driverPhone: null | string
    franchiseeCorporateName: string
    franchiseeSerialNo: string
    id: number
    isGabEnabled: string
    isPriceExceeds: boolean
    licensePlate: null | string
    meetingBusinessName: null | string
    meetingBusinessSerialNo: null | string
    meetingContactIdCard: string
    meetingContactSerialNo: string
    meetingSerialNo: string
    orderNumber: string
    orderProcessStatus: string
    orderStatus: string
    passengers: string
    peopleNumber: string
    serialNo: string
    subOrderSerialNo: string
    subOrderStatus: string
    supplierName: null | string
    supplierSerialNo: null | string
    trainFlight: string
    tripDescription: string
    updateBy: string
    updateDate: number
    useDate: number
    useEndDate: null | number
    useStartDate: number
    userType: string
    userTypeSerialNo: string
    vehiclePrice: number
    vehiclePriceSerialNo: string
    vehicleTypeName: string
    vehicleTypeSerialNo: string
    version: number
  }

  // 定义data字段对应的类型
  export interface Data {
    countId: null | number
    current: number
    maxLimit: null | number
    optimizeCountSql: boolean
    orders: any[] // 同样不太明确orders具体元素类型，暂设为any数组
    pages: number
    records: RecordType[]
    searchCount: boolean
    size: number
    total: number
  }

  // 定义整个响应结构的类型
  export interface ResponseType extends BaseResponseType.Type {
    data: Data
  }

  // 定义传参的类型
  export interface ParamsType {
    page: number
    size: number
    orderSerialNo?: string
    orderStatus?: string | number | null
    includeGrabbed?: boolean
  }
}

/**
 * 订单详情
 */
namespace OrderDetails {
  // 订单详情返回的数据
  export interface ResponseType extends BaseResponseType.Type {
    data: RecordType
  }
  // 获取订单详情/操作订单 传参
  export interface ParamsType {
    orderSerialNo: string
    subOrderSerialNo: string
  }
  // 操作订单返回的数据
  export interface OperateResponseType extends BaseResponseType.Type {
    data: null
  }
}

/**
 * 订单数量
 */
namespace OrderStatusCount {
  export interface DataType {
    allOrders: number
    completeOrders: number
    inProgressOrders: number
    pendingOrders: number
  }
  export interface ResponseType extends BaseResponseType.Type {
    data: DataType
  }
}

/**
 * 待抢单数量
 */
namespace PendingOrderCount {
  export interface ResponseType extends BaseResponseType.Type {
    data: number
  }
}
