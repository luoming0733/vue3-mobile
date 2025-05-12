declare module '@iconify/vue' {
  export const Icon: {
    new (): {
      $props: import('@iconify/vue/dist/iconify').IconProps & { class?: any }
    }
  }

  export { addCollection, loadIcons } from '@iconify/vue/dist/iconify'
}
