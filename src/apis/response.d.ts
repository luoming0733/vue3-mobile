export interface IResponse<ResponseType = null> {
  code: string
  status: number
  data: ResponseType
  message: string
}

/**
 * @description 获取短信验证码
 */
export interface ISendSmsResponse extends IResponse<null> {}

/**
 * @description 登录
 */
export interface ILoginResponse
  extends IResponse<{
    driverName: string
    driverSerialNo: string
    phone: string
    token: string
    corporateName: string
    driverCarUseArea: string
    driverFranchiseeSerialNo: string
    loginTime: number
  }> {}

interface IGetInfoData {
  [key: string]: number // Add this line to allow for string keys
  todayCompletedCount?: number
  todayGrabCount?: number
  todayTaskCount?: number
}

/**
 * @description 获取司机首页数据
 */
export interface IGetDriverHomeCompletionCountsResponse
  extends IResponse<IGetInfoData> {}

// 司机抢单
interface OrderData {
  countId: string | null
  current: number
  maxLimit: string | null
  optimizeCountSql: boolean
  orders: any[]
  pages: number
  records: OrderRecord[]
  searchCount: boolean
  size: number
  total: number
}

// 司机抢单
interface OrderRecord {
  actualAmount: number | null
  addType: string
  carModelName: string
  carModelSerialNo: string
  carUseArea: string
  carUseAreaName: string | null
  cloudDriverSerialNo: string | null
  cloudOrerServiceProcessVOS: any[] | null
  contactPerson: string
  contactPhone: string
  contractAmount: number | null
  createBy: string
  createDate: number
  customerMsg: string
  deleteBy: string | null
  deleteDate: number | null
  deleteFlag: number
  departureLocation: string
  destination: string
  driverPhone: string | null
  franchiseeCorporateName: string
  franchiseeSerialNo: string
  id: number
  isGabEnabled: string
  isPriceExceeds: boolean
  licensePlate: string | null
  meetingBusinessName: string | null
  meetingBusinessSerialNo: string | null
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
  supplierName: string | null
  supplierSerialNo: string | null
  trainFlight: string
  tripDescription: string
  updateBy: string
  updateDate: number
  useDate: number
  useEndDate: number | null
  useStartDate: number
  userType: string
  userTypeSerialNo: string
  vehiclePrice: number
  vehicleTypeName: string
  vehicleTypeSerialNo: string
  version: number
}

/**
 * @dec 获取司机抢单列表
 */
export interface IGetDriverGrabOrderListResponse {
  code: string
  data: OrderData
  message: string
}
