import axios from 'axios'
import { showConfirmDialog } from 'vant'
import { onBeforeMount, onMounted, reactive } from 'vue'

export function useUpdate() {
  const state = reactive({
    META_KEY: 'version-no',
    curVersion: null as Nullable<string>,
    timer: null as Nullable<number>,
    show: false
  })

  function showNotify() {
    state.show = true

    showConfirmDialog({
      title: '更新提示',
      message: '发现新版本，请刷新后使用哦',
      showCancelButton: false
    }).then(() => {
      state.show = false
      window.location.reload()
    })
  }

  /**
   * 获取当前版本号
   * @description 通过meta标签来获取当前版本号
   * @return {void} 无返回值
   */
  function getCurVersion() {
    let version = ''
    const metaList = document.querySelectorAll('meta')

    if (metaList.length) {
      metaList.forEach(item => {
        if (item.name === state.META_KEY) {
          version = item.content
        }
      })
    }

    state.curVersion = version
  }

  /**
   * 获取新版本
   * @description
   *  1.  GET  request  timestamp  params
   *  2.  parse  response  html  get  meta[name=version-no]
   *  3.  compare  curVersion  and  newVersion
   *  4.  if  newVersion  is  newer  than  curVersion  and  show  is  false
   *      1.  show  notify
   *      2.  reload  page
   */
  async function getNewVersion() {
    const timestamp = new Date().getTime()
    const response = await axios.get(
      `${window.location.origin}/${import.meta.env.VITE_APP_NAME}`,
      {
        params: { timestamp }
      }
    )

    const el = document.createElement('html')
    el.innerHTML = response.data

    let newVersion = ''

    const metaList = el.querySelectorAll('meta')

    if (metaList.length) {
      metaList.forEach(item => {
        if (item.name === state.META_KEY) {
          newVersion = item.content
        }
      })
    }
    // console.group('版本检测')
    // console.log('现版本：', state.curVersion)
    // console.log('新版本：', newVersion)
    console.groupEnd()

    if (newVersion && newVersion !== state.curVersion && !state.show) {
      // showNotify()
      // 有新版本，直接刷新
      window.location.reload()
    }
  }

  /**
   * Retrieves the current version from meta tags and checks for a new version.
   *
   * @description
   *  1. Calls 'getCurVersion' to fetch the current version from the document's meta tags.
   *  2. Calls 'getNewVersion' to check if there is a newer version available.
   */

  function getVersion() {
    getCurVersion()
    getNewVersion()
  }

  function setTimer() {
    state.timer = setInterval(getNewVersion, 30 * 60 * 1000)
  }

  function clearTimer() {
    if (state.timer) {
      clearInterval(state.timer)
      state.timer = null
    }
  }

  /**
   * Handles the visibility change event of the document.
   * If the document becomes visible, starts the timer and checks for a new version.
   * If the document becomes hidden, clears the timer.
   * @return {void} 无返回值
   */
  function onVisibilityChange() {
    if (!document.hidden) {
      setTimer()
      getVersion()
    } else {
      clearTimer()
    }
  }

  onMounted(() => {
    const url = window.location.origin

    // 非本地环境生效
    if (!/localhost/.test(url) && !/192\./.test(url)) {
      getVersion()
      setTimer()
      document.addEventListener('visibilitychange', onVisibilityChange)
    }
  })

  onBeforeMount(() => {
    clearTimer()
    document.removeEventListener('visibilitychange', onVisibilityChange)
  })
}
