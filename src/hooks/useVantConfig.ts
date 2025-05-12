import type { ConfigProviderProps } from 'vant'
import { computed } from 'vue'

import { useTheme } from './useTheme'

export function useVantConfig() {
  const { theme } = useTheme()

  return computed<ConfigProviderProps>(() => ({
    tag: 'div',
    theme: theme.value,
    themeVarsScope: 'global',
    iconPrefix: 'van-icon'
  }))
}
