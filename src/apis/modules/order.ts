import { ajax } from '@/utils'

import type { IGetDriverHomeCompletionCountsResponse } from '../response'

export type { IGetDriverHomeCompletionCountsResponse }

export const orderApi = {
  /**
   * 我的-订单列表查询
   * @param {GrabList.ParamsType} params
   * @returns {Promise<any>}
   */
  getDriverMyOrderList(
    params: GrabList.ParamsType
  ): Promise<GrabList.ResponseType> {
    return ajax.post(
      '/cloud-order/cloudDriverOrderController/getDriverOrderList',
      params
    )
  },

  /**
   * 获取司机抢单列表
   * @param {GrabList.ParamsType} params - 司机抢单列表参数
   * @returns {Promise<GrabList.ResponseType>} - 司机抢单列表
   */
  getDriverGrabOrderList(
    params: GrabList.ParamsType
  ): Promise<GrabList.ResponseType> {
    return ajax.post('/cloud-order/cloudDriverOrderController/grabList', params)
  },

  /**
   * 获取司机未完成订单
   */
  getDriverPendingOrderList(params: GrabList.ParamsType): Promise<any> {
    return ajax.post(
      '/cloud-order/cloudDriverOrderController/findUnfinishedOrders ',
      params
    )
  },

  /**
   * 获取司机订单列表
   */
  getDriverOrderList(params: GrabList.ParamsType): Promise<any> {
    return ajax.post('/cloud-order/cloudDriverOrderController/find', params)
  },

  /**
   * 获取司机订单详情
   */
  getDriverOrderDetails(
    params: OrderDetails.ParamsType
  ): Promise<OrderDetails.ResponseType> {
    return ajax.get('/cloud-order/cloudDriverOrderController/detail', {
      params
    })
  },

  /**
   * 司机操作订单
   * @param operate 操作
   * 司机抢单:'driverGrabOrder'
   * 司机确认:'driverConfirm
   * 司机出发:'driverSetOut'
   * 司机到达出发地: 'driverStartDeparture'
   * 司机开始服务: 'driverStartServer'
   * 司机到达停靠站: 'arriveStops'
   * 结束订单: 'endOrder'
   */
  operateOrder(
    data: OrderDetails.ParamsType,
    operate: string
  ): Promise<OrderDetails.OperateResponseType> {
    return ajax.post(`/cloud-order/cloudDriverOrderController/${operate}`, data)
  },

  /**
   * 查询待抢单数量
   */
  pendingOrderCount(): Promise<PendingOrderCount.ResponseType> {
    return ajax.get('/cloud-order/cloudDriverOrderController/grabListCount')
  },

  /**
   * 查询订单数量
   */
  orderCount(): Promise<OrderStatusCount.ResponseType> {
    return ajax.get(
      '/cloud-order/cloudDriverOrderController/getDriverOrderStatusCount'
    )
  },

  /**
   * 查询司机今日首页完成数
   */
  getDriverHomeCompletionCounts(): Promise<IGetDriverHomeCompletionCountsResponse> {
    return ajax.get(
      '/cloud-order/cloudDriverOrderController/todayDriverHomeStatistics'
    )
  },

  /**
   * 查询短信模板内容
   */
  getSmsContent(orderSerialNo: string): Promise<any> {
    return ajax.get('/cloud-order/cloudDriverOrderController/getSmsTemplate', {
      params: { orderSerialNo }
    })
  },

  /**
   * 发送短信确认
   */
  sendSmsConfirm(data: any): Promise<any> {
    return ajax.post(
      '/cloud-order/cloudDriverOrderController/customerContactConfirm',
      data
    )
  },

  /**
   * 异常报备
   */
  reportException(data: any): Promise<any> {
    return ajax.post('/cloud-platform/exceptionReport/add', data)
  }
}
