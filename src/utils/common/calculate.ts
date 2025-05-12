import { fmtDate } from '../date'

/**
 * 根据姓名和身份证号码计算姓氏。
 *
 * @param {string} name - 姓名。
 * @param {string} idCard - 身份证号码。
 * @return {string} 包含性别称呼的姓氏。
 */
export function calculateSurname(name: string, idCard: string): string {
  const [surname] = name.split('')
  const sex = getSexByIdCard(idCard)
  return `${surname}${sex}`
}

/**
 * 根据姓名分割成单字，用于计算姓氏。
 */
export function splitSurname(name: string): string {
  const nameArr = name.split('')
  return nameArr[0]
}

/**
 * 根据身份证号码判断性别
 * @param {string} idCard - 身份证号码
 * @return {string} 性别（先生/女士）
 */
export function getSexByIdCard(idCard: string): string {
  const secondLastDigit = idCard.slice(-2, -1)
  return parseInt(secondLastDigit) % 2 !== 0 ? '先生' : '女士'
}

/**
 * 计算步骤完成时间
 * @param {Number} time - 时间戳
 * @return {string} 时间日期
 */
export function calculateStepsTime(time: number): string {
  return time ? fmtDate(time, 'YYYY-MM-DD HH:mm:ss') : ''
}

// 类型定义
type OrderStatusConfig = {
  text: string
  color: string
}

// 常量配置
const ORDER_STATUS_CONFIG: Record<number, OrderStatusConfig> = {
  2: { text: '待服务', color: 'danger' },
  3: { text: '待服务', color: 'danger' },
  4: { text: '服务中', color: 'warning' },
  5: { text: '已完成', color: 'default' },
  6: { text: '已取消', color: 'danger' }
}

/**
 * 获取订单状态配置
 * @param status - 订单状态码
 * @returns 状态配置信息（包含文本和颜色）
 */
function getOrderStatusConfig(status: number): OrderStatusConfig {
  return ORDER_STATUS_CONFIG[status] || { text: '', color: '' }
}

/**
 * 计算订单状态背景色
 * @param {Number} status - 订单状态
 * @return {string} 颜色
 */
export function calculateOrderStatusColor(status: number): string {
  return getOrderStatusConfig(status).color
}

/**
 * 计算订单状态
 * @param {Number} status - 订单状态
 * @return {string} 订单状态
 */
export function calculateOrderStatus(status: number): string {
  return getOrderStatusConfig(status).text
}
