import type { Ref } from 'vue'

import { SeCondsEnum } from '@/enums'

import { isWeChatBrowser } from './wechat'

/**
 * 在浏览器中打开拨号界面，填充要拨打的电话号码
 *
 * @param {string} phoneNumber - 要拨打的电话号码
 */
export function callPhoneNumber(phoneNumber: string) {
  const a = document.createElement('a') as HTMLAnchorElement
  a.href = `tel:${phoneNumber}`
  a.click()
}

/**
 * 在浏览器中打开短信界面，填充要发送的短信号码和短信内容
 *
 * @param {string} phoneNumber - 要发送短信的手机号码。
 * @param {string} content - 要发送的短信内容。
 */
export function sendPhoneSmsToPhone(phoneNumber: string, smsContent: string) {
  const a = document.createElement('a') as HTMLAnchorElement
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase())
  if (isWeChatBrowser) {
    if (isIOS) {
      a.href = `sms:${phoneNumber}&body=${encodeURIComponent(smsContent)}`
    } else {
      a.href = `sms:${phoneNumber}?body=${encodeURIComponent(smsContent)}`
    }
  } else {
    a.href = `sms:${phoneNumber}_${encodeURIComponent(smsContent)}`
  }
  a.click()
}

/**
 * 点击导航栏标题时，平滑地滚动到顶部
 */
export function onClickNavTitle() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/**
 * 启动短信发送倒计时。
 *
 * @param {Ref<string>} smsSendText - 短信发送按钮的文本引用，用于显示倒计时。
 * @param {Ref<boolean>} isSmsSending - 短信发送状态的引用，用于指示是否可以重新发送短信。
 * @returns {number} 倒计时的定时器ID。
 */

export const startCountdown = (
  smsSendText: Ref<string>,
  isSmsSending: Ref<boolean>
) => {
  let remainingSeconds = SeCondsEnum.COUNTDOWN_SECONDS
  const interval = setInterval(() => {
    smsSendText.value = `${remainingSeconds--}s后重新获取`
    if (remainingSeconds < 0) {
      clearInterval(interval)
      smsSendText.value = '重新发送'
      isSmsSending.value = true
    }
  }, 1000)
  return interval
}
