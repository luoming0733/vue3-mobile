import { computed } from 'vue'

export function getHeight(height: number | string) {
  return computed(() => {
    return `${height}${typeof height === 'number' ? 'px' : ''}`
  })
}
