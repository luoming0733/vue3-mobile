import { useDark, useToggle } from '@vueuse/core'
import { computed } from 'vue'

export function useTheme() {
  const isDark = useDark()
  const toggleDark = useToggle(isDark)

  const theme = computed(() => (isDark.value ? 'dark' : 'light'))

  return {
    isDark,
    theme,
    toggleDark
  }
}
