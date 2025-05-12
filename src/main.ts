import './assets/icons'
import './assets/styles'
import 'uno.css'
import '@/assets/icons/icon'

// import '../permission.js'
import { createApp } from 'vue'

import App from './App.vue'
import { useErrorHandler, useVant } from './hooks'
import router from './router'
import store from './store'

async function bootstrap() {
  const app = createApp(App)

  app.use(router)
  app.use(store)

  useErrorHandler(app)
  useVant(app)

  await router.isReady()

  // 定义一个全局过滤器
  app.config.globalProperties.$filters = {
    formatTime(time: number) {
      if (!time) {
        return ''
      }
      return new Date(time).toLocaleString()
    }
  }

  app.mount('#app')
}
bootstrap()
