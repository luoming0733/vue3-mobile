import { resolve } from 'node:path'

import { customHtml } from '@ttou/vite-html'
// import presetIcons from '@unocss/preset-icons'
import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import autoprefixer from 'autoprefixer'
import postcssMobileForever from 'postcss-mobile-forever'
import postcssNested from 'postcss-nested'
import UnoCSS from 'unocss/vite'
import imagemin from 'unplugin-imagemin/vite'
import { VantResolver } from 'unplugin-vue-components/resolvers'
import components from 'unplugin-vue-components/vite'
import { CommonServerOptions, defineConfig, loadEnv } from 'vite'
import { analyzer } from 'vite-bundle-analyzer'
import { compression as compression2 } from 'vite-plugin-compression2'
import { viteVConsole } from 'vite-plugin-vconsole'
import vueSetupExtend from 'vite-plugin-vue-setup-extend'
// import basicSsl from '@vitejs/plugin-basic-ssl'

import { browserslist } from './package.json'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.')
  const commonServerOptions: CommonServerOptions = {
    host: true,
    open: true,
    port: 8080,
    proxy: {
      '/api': {
        target: env.VITE_APP_BASE_URL,
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      }
    }
  }

  return {
    // base: mode === 'development' ? '/' : `/${env.VITE_APP_NAME}/`,
    base: '/',
    css: {
      modules: {
        generateScopedName: '[local]__[hash:base64:5]'
      },
      postcss: {
        plugins: [
          autoprefixer(),
          postcssMobileForever({
            appSelector: '#app',
            unitPrecision: Number(env.VITE_APP_DESIGN_UNIT_PRECISION),
            viewportWidth: Number(env.VITE_APP_DESIGN_WIDTH),
            maxDisplayWidth: 600,
            landscapeWidth: 450,
            border: '#ebedf0',
            disableDesktop: true,
            disableLandscape: true,
            rootContainingBlockSelectorList: ['van-tabbar']
          }),
          postcssNested({ preserveEmpty: true })
        ]
      }
    },
    resolve: {
      alias: [
        {
          find: '@/',
          replacement: `${resolve(__dirname, 'src')}/`
        },
        ...(mode === 'production'
          ? [
              {
                find: 'vue-types',
                replacement: 'vue-types/shim'
              }
            ]
          : [])
      ]
    },
    plugins: [
      vue(),
      vueJsx(),
      // // 开启 https
      // basicSsl(),
      legacy({
        targets: browserslist
      }),
      components({
        dts: false,
        dirs: [],
        resolvers: [
          VantResolver({
            importStyle: false
          })
        ]
      }),
      customHtml({
        injectVer: `<meta name="version-no" content="${new Date().getTime()}"/>`,
        injectTitle: `<title>${env.VITE_APP_TITLE}</title>`,
        injectScript: `
          <script type="text/javascript" src="/vconsole.min.js"></script>
          <script type="text/javascript" src="/vconsole.config.js"></script>
        `
      }),
      compression2({
        exclude: [/\.(svg)$/]
      }),
      imagemin({
        mode: 'sharp',
        beforeBundle: true
      }),
      ...(mode === 'analyzer' ? [analyzer()] : []),
      UnoCSS({
        configFile: './uno.config.ts'
      }),
      vueSetupExtend(),
      // VConsole 调试工具配置
      viteVConsole({
        entry: resolve(__dirname, './src/main.ts'), // entry file
        localEnabled: mode !== 'prod', // dev environment
        enabled: mode !== 'prod', // build production
        config: {
          // vconsole options
          maxLogNumber: 1000,
          theme: 'light'
        }
      })
    ],
    optimizeDeps: {
      include: ['dayjs/locale/zh-cn'],
      exclude: ['vue-demi']
    },
    build: {
      cssTarget: ['chrome61'],
      chunkSizeWarningLimit: 1024,
      reportCompressedSize: false,
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
          manualChunks: {
            vue: ['vue', 'vue-router', 'vue-types', '@vueuse/core'],
            vant: ['vant'],
            iconify: ['@iconify/vue']
          }
        }
      }
    },
    server: {
      ...commonServerOptions
    },
    preview: {
      ...commonServerOptions
    }
  }
})
