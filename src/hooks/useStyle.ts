export function useStyle() {
  /**
   * 单行省略
   */
  const ellipsis = 'van-ellipsis'

  /**
   * 多行省略
   * @param {number} line 行数，默认为2
   */
  const multiEllipsis = (line = 2) => `van-multi-ellipsis--l${line}`

  /**
   * 1px 边框
   */
  enum Hairline {
    /**
     * 上边框
     */
    top = 'van-hairline--top',
    /**
     * 下边框
     */
    bottom = 'van-hairline--bottom',
    /**
     * 左边框
     */
    left = 'van-hairline--left',
    /**
     * 右边框
     */
    right = 'van-hairline--right',
    /**
     * 上下边框
     */
    topBottom = 'van-hairline--top-bottom',
    /**
     * 全边框
     */
    surround = 'van-hairline--surround'
  }

  /**
   * 动画
   */
  enum Transition {
    /**
     * 淡入
     */
    fade = 'van-fade',
    /**
     * 上滑进入
     */
    slideUp = 'van-slide-up',
    /**
     * 下滑进入
     */
    slideDown = 'van-slide-down',
    /**
     * 左滑进入
     */
    slideLeft = 'van-slide-left',
    /**
     * 右滑进入
     */
    slideRight = 'van-slide-right'
  }

  return {
    ellipsis,
    multiEllipsis,
    Hairline,
    Transition
  }
}
