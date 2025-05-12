import { createPinia } from 'pinia'
// @ts-ignore
import piniaPersist from 'pinia-plugin-persist'

const store = createPinia()
store.use(piniaPersist)

export default store

export * from './auth'
export * from './useBadgeStore'
export * from './useDateFilterStore'
export * from './useFilterOrderStore'
export * from './useKeepAliveStore'
export * from './useScrollPositionStore'
export * from './useTabBadgeStore'
export * from './useWxConfigStore'
