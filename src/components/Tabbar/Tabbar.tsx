// import { Icon } from '@iconify/vue'
import { Tabbar, TabbarItem } from 'vant'
import {
  computed,
  defineComponent,
  reactive,
  toRefs,
  Transition,
  watch
} from 'vue'
import { useRoute } from 'vue-router'

import HomeIcon from '@/components/my-components/icon.vue'
import { CONST_ROUTES } from '@/constants'
import { useStyle } from '@/hooks'
import { $t } from '@/locales'
import { useBadgeStore, useDateFilterStore } from '@/store'

import type { TabItem } from './Tabbar.define'

export default defineComponent({
  name: 'Tabbar',
  setup() {
    const badgeStore = useBadgeStore()
    const badge = computed(() => badgeStore.count)
    const state = reactive({
      activeTab: 0,
      tabs: [
        {
          label: $t('page.home.common.title'),
          name: CONST_ROUTES.HOME.name,
          path: CONST_ROUTES.HOME.path,
          icon: 'home',
          iconActive: 'home-active'
        },
        {
          label: $t('page.rushOrder.common.title'),
          name: CONST_ROUTES.ORDER.name,
          path: CONST_ROUTES.ORDER.path,
          icon: 'rush-order',
          iconActive: 'rush-order-active',
          badge: badge
        },
        {
          label: $t('page.notify.common.title'),
          name: CONST_ROUTES.NOTIFY.name,
          path: CONST_ROUTES.NOTIFY.path,
          icon: 'notice',
          iconActive: 'notice-active'
        },
        {
          label: $t('page.me.common.title'),
          name: CONST_ROUTES.MY.name,
          path: CONST_ROUTES.MY.path,
          icon: 'me',
          iconActive: 'me-active'
        }
      ] as TabItem[]
    })

    const route = useRoute()
    const { Transition } = useStyle()

    const show = computed(() =>
      [
        CONST_ROUTES.HOME.name,
        CONST_ROUTES.NOTIFY.name,
        CONST_ROUTES.MY.name,
        CONST_ROUTES.ORDER.name
      ].includes(route.name as string)
    )

    watch(
      () => route.path,
      () => {
        const index = state.tabs.findIndex(v => v.name === route.name)

        if (index > -1) {
          state.activeTab = index
        }
        if (index > 0) {
          useDateFilterStore().clearDate()
          useDateFilterStore().setText('全部订单')
        }
      },
      {
        immediate: true
      }
    )

    return {
      ...toRefs(state),
      transitionName: Transition.slideUp,
      show
    }
  },
  render() {
    return (
      <Transition name={this.transitionName}>
        <Tabbar
          v-show={this.show}
          v-model={this.activeTab}
          inactiveColor="#AAB0B6"
          activeColor="#0f62fe"
          placeholder={false}
          fixed={true}
          class="h-50px"
        >
          {this.tabs.map((item, index) => (
            <TabbarItem key={item.name} to={item.path} badge={item.badge}>
              {{
                /**
                 *  Icon component for the tab item. It will be rendered as a slot
                 *  in the TabbarItem component.
                 *
                 *  @return {VNode} The icon VNode.
                 */
                icon: () => (
                  <HomeIcon
                    icon={
                      this.activeTab === index ? item.iconActive : item.icon
                    }
                  />
                ),
                default: () => <span>{item.label}</span>
              }}
            </TabbarItem>
          ))}
        </Tabbar>
      </Transition>
    )
  }
})
