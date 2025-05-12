/**
 * 用法：
 * import jsBridge from 'fileName.js'
 *
 * 1、给 App 端发送数据
 * jsBridge.callHandler(eventName, data, callback(reponseData))
 * 参数说明：
 * eventName (string): 必传, 与 App 端约定的事件名
 * data (object): 非必传, 发送给 App 端的数据
 * callback (function): 通信完成后，前端的回调，reponseData，是 App 端返回的数据
 *
 * 2、接收 App 端的数据
 * jsBridge.registerHandler(eventName, callback(data, responseCallback))
 * 参数说明：
 * eventName (string): 必传，与 App 端约定的事件名
 * callback (function): data: 是接收到的数据，responseCallback，通信完成后，传给 App 端的回调
 */

const isAndroid =
  navigator.userAgent.indexOf('Android') > -1 ||
  navigator.userAgent.indexOf('Adr') > -1
const isiOS = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)

//这是必须要写的，用来创建一些设置
function setupWebViewJavascriptBridge(callback) {
  if (isAndroid) {
    if (window.WebViewJavascriptBridge) {
      callback(WebViewJavascriptBridge)
    } else {
      document.addEventListener(
        'WebViewJavascriptBridgeReady',
        function () {
          callback(WebViewJavascriptBridge)
        },
        false
      )
    }
  }
  if (isiOS) {
    if (window.WebViewJavascriptBridge) {
      return callback(WebViewJavascriptBridge)
    }
    if (window.WVJBCallbacks) {
      return window.WVJBCallbacks.push(callback)
    }
    window.WVJBCallbacks = [callback]
    const WVJBIframe = document.createElement('iframe')
    WVJBIframe.style.display = 'none'
    WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__'
    document.documentElement.appendChild(WVJBIframe)
    setTimeout(function () {
      document.documentElement.removeChild(WVJBIframe)
    }, 0)
  }
}
setupWebViewJavascriptBridge(function (bridge) {
  if (isAndroid) {
    //安卓端，接收数据时，需要先进行初始化
    bridge.init(function (message, responseCallback) {
      const data = {
        'Javascript Responds': 'Wee!'
      }
      responseCallback(data)
    })
  }
})

export default {
  // 给 App 发送数据
  callHandler(name, data, callback) {
    setupWebViewJavascriptBridge(function (bridge) {
      bridge.callHandler(name, data, callback)
    })
  },
  // 接收 App 端的数据
  registerHandler(name, callback) {
    setupWebViewJavascriptBridge(function (bridge) {
      bridge.registerHandler(name, function (data, responseCallback) {
        callback(data, responseCallback)
      })
    })
  }
}
