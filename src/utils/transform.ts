/**
 * 将像素值转换为视口宽度（vw）值。
 *
 * @param {number} value - 需要转换的像素值。
 * @return {string} 转换后的视口宽度（vw）值。
 */
export function pxToVw(value: number) {
  return (
    ((value / Number(import.meta.env.VITE_APP_DESIGN_WIDTH)) * 100).toFixed(
      Number(import.meta.env.VITE_APP_DESIGN_UNIT_PRECISION)
    ) + 'vw'
  )
}
