import { format } from 'date-fns'

const DATE_TIME_FORMAT = 'yyyy-MM-dd HH:mm:ss'

/**
 * 将给定的日期格式化为指定格式的字符串。
 *
 * @param {number | Date} date - 要格式化的日期。
 * @param {string} formatStr - T- 格式化字符串（默认为DATE_FORMAT）。
 * @return {string} 格式化后的日期字符串。
 */
export function formatToDateTime(
  date: number | Date,
  formatStr = DATE_TIME_FORMAT
): string {
  return format(date, formatStr)
}
