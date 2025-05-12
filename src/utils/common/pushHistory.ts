import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'

let handlePopState: (e: PopStateEvent) => void

/**
 *
 * @param backRouteName -返回的路由名称
 * @param currentUrl -当前地址
 * @param currentTitle -当前标题
 */
export function pushHistory(
  backRouteName: any,
  currentUrl: string,
  currentTitle: string
) {
  const route = useRoute()
  const router = useRouter()
  /**
   * Handle the popstate event.
   * @param {PopStateEvent} e - PopStateEvent object.
   *
   * If the backRouteName is given, push the route with the given name and query.
   * Otherwise, go back to the previous page.
   */
  handlePopState = (e: PopStateEvent) => {
    // 阻止默认的回退行为
    e.preventDefault()
    if (backRouteName) {
      router.push({
        name: String(backRouteName),
        query: route.query
      })
    } else {
      history.back()
    }
  }
  window.addEventListener('popstate', handlePopState, false)
  const state = {
    title: currentTitle,
    url: currentUrl
  }
  window.history.pushState(state, currentTitle, currentUrl)
}

/**
 * @description - remove the popstate event listener
 * This function is used to remove the popstate event listener that is set by the pushHistory function.
 * It is useful when you need to remove the event listener manually.
 */
export function removePopStateListener() {
  if (handlePopState) {
    window.removeEventListener('popstate', handlePopState, false)
  }
}
