import { showToast } from 'vant'
import wx from 'weixin-js-sdk'

import { commonApi } from '@/apis'
import { ResultEnum } from '@/enums'
import { useWxConfigStore } from '@/store'
/**
 *
 * @returns 是否是微信浏览器
 */
export const isWeChat = () => {
  return /MicroMessenger/i.test(navigator.userAgent)
}

export const isWeChatBrowser = isWeChat()

/**
 * 获取微信配置
 * @param url - 当前页面的URL
 * @returns
 */
export const getWeChatConfig = async () => {
  const url = window.location.href.split('#')[0]
  try {
    const { code, data, message } = await commonApi.getSignature(url)
    if (code !== ResultEnum.SUCCESS) {
      if (isWeChat()) {
        showToast('获取微信JS-SDK失败' + message)
      }
      return
    }
    const wxConfigStore = useWxConfigStore()

    wx.config({
      debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
      appId: data.appId, // 必填，公众号的唯一标识
      timestamp: +data.timestamp, // 必填，生成签名的时间戳
      nonceStr: data.nonceStr, // 必填，生成签名的随机串
      signature: data.signature, // 必填，签名
      jsApiList: [
        'getLocation',
        'scanQRCode',
        'chooseImage',
        'getLocalImgData',
        'openLocation'
      ]
    })
    wx.ready(function () {
      console.log('微信配置成功')
      wxConfigStore.setConfigSuccess(true)
      wx.getLocation({
        type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
        success: function (res) {
          console.log(res)
          const { latitude, longitude } = res
          wxConfigStore.setWxLocation(Number(latitude), Number(longitude))
          // wxConfigStore.setWxLocation(res)
        }
      })
    })
    wx.error(function (res) {
      console.log('微信配置错误', res)
      wxConfigStore.setConfigSuccess(false)
    })
  } catch (err) {
    console.warn(err)
    console.log('获取授权失败')
  }
}
