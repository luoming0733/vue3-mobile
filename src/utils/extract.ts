import { splitSurname } from './common/calculate'

// 常量定义
const PHONE_REGEX = /^1[3-9]\d{9}$/
const NAME_REGEX = /^[\u4e00-\u9fa5]{2,}(?:·[\u4e00-\u9fa5]+)*$/
const NAME_PHONE_REGEX = /^\s*([^\d]+?)\s*(\d{11})\s*$/ // 严格匹配11位数字

interface NamePhoneResult {
  name: string
  phone: string
}

/**
 * 验证并提取姓名和电话号码
 * @param {string} input - 客户信息
 * @return {NamePhoneResult} 包含姓名和电话号码的对象
 * @throws {Error} 包含具体错误原因
 */
export const extractNameAndPhone = (input: string): NamePhoneResult => {
  if (!input) return { name: '', phone: '' }
  const normalized = input.trim().replace(/\s+/g, ' ')

  const match = normalized.match(NAME_PHONE_REGEX)
  if (!match) throw new Error('格式错误：请输入 "姓名 电话"')

  const [, name = '', phone = ''] = match || []

  // 验证姓名
  if (!NAME_REGEX.test(name)) {
    throw new Error('姓名格式不正确，请使用中文姓名')
  }

  // 验证电话号码
  if (!PHONE_REGEX.test(phone)) {
    throw new Error('手机号格式错误，请输入11位有效号码')
  }

  return { name: name.trim(), phone }
}

/**
 * 生成客户信息（姓名+电话号码）
 * @param {string} input - 客户信息
 * @return {string | undefined} 客户信息
 * @throws {Error} 包含具体错误原因
 */
export const calculateCustomerNameAndPhone = (
  input: string
): string | undefined => {
  try {
    const { name, phone } = extractNameAndPhone(input)
    const surname = splitSurname(name)
    return `${surname}先生/女士 ${phone}`
  } catch (error) {
    console.warn('客户信息生成失败:', error)
    return undefined
  }
}

/**
 * 提取客户电话号码
 *
 * @param {string} input - 客户信息
 * @return {string | undefined} 客户电话号码
 * @throws {Error} 包含具体错误原因
 */
export const extractCustomerPhone = (input: string): string => {
  try {
    const { phone } = extractNameAndPhone(input)
    return phone
  } catch (error) {
    console.warn('电话提取失败:', error)
    return ''
  }
}
