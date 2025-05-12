import { ajax } from '@/utils'

export const noticeApi = {
  /**
   * 根据订单唯一标识集合和消息类型查询已发送消息
   */
  getNoticeList: (params: any) => {
    return ajax.get('/cloud-platform/cloudMessageNotify/find', {
      params
    }) as Promise<any>
  }
}
