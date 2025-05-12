import Cookies from 'js-cookie'

const TOKEN_KEY = 'Cloud-Auth-Token' as const

/**
 * 从 Cookie 中获取认证令牌
 * @returns { string | undefined } 认证令牌，或者 undefined 如果它未被设置
 */
export function getToken(): string | undefined {
  return Cookies.get(TOKEN_KEY)
}

/**
 * 保存认证令牌到 Cookie 中
 * @param {string} token - 要保存的认证令牌
 * @returns { void }
 */
export function setToken(token: string): void {
  Cookies.set(TOKEN_KEY, token)
}

/**
 * 从 Cookie 中删除认证令牌
 * @returns { void }
 */
export function removeToken(): void {
  Cookies.remove(TOKEN_KEY)
}
