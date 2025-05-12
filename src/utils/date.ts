import 'dayjs/locale/zh-cn'

import dayjs, { type ConfigType } from 'dayjs'

// 初始化中文环境
dayjs.locale('zh-cn')

// 类型定义
type DateInput = ConfigType
type DayjsInstance = dayjs.Dayjs

/**
 * Safely creates a Day.js instance from the given date input.
 *
 * @param {DateInput} value - The date input to create a Day.js instance from, which can be a string, number, Date object, or Day.js object.
 * @return {DayjsInstance | null} A valid Day.js instance if the input is valid, otherwise null.
 */

const safeDayjs = (value: DateInput): DayjsInstance | null => {
  const instance = dayjs(value)
  return instance.isValid() ? instance : null
}

/**
 * 根据指定的格式将给定的日期值格式化为字符串表示。
 *
 * @param {DateInput} value - 要格式化的日期值，可以是字符串、数字、Date对象或Day.js对象。
 * @param {string} [fmt='YYYY-MM-DD HH:mm:ss'] - 用于格式化日期的格式字符串，默认为'YYYY-MM-DD HH:mm:ss'。
 * @return {string} 格式化后的日期字符串。
 */
export function fmtDate(value: DateInput, fmt = 'YYYY-MM-DD HH:mm:ss'): string {
  const instance = safeDayjs(value)
  return instance ? instance.format(fmt) : ''
}

/**
 * 转化时间格式为时间戳
 * @param {DateInput} value - 要格式化的日期值，可以是字符串、数字、Date对象或Day.js对象。
 * @return {string} 格式化后的日期字符串。
 */
export function fmtDateToTimestamp(value: DateInput): number {
  const instance = safeDayjs(value)
  return instance ? instance.valueOf() : 0
}

/**
 * 返回给定日期值的当天的开始时间。
 *
 * @param {DateInput} value - 日期值，可以是字符串、数字、Date对象或Day.js对象。
 * @return {Date | null} 当天的开始时间，如果给定的日期值无效时返回null。
 */
export function startOfDay(value: DateInput): Date | null {
  const instance = safeDayjs(value)
  return instance ? instance.startOf('day').toDate() : null
}

/**
 * 返回给定日期值的当天的结束时间。
 *
 * @param {DateInput} value - 日期值，可以是字符串、数字、Date对象或Day.js对象。
 * @return {Date | null} 当天的结束时间，如果给定的日期值无效时返回null。
 */
export function endOfDay(value: DateInput): Date | null {
  const instance = safeDayjs(value)
  return instance ? instance.endOf('day').toDate() : null
}
