import { defineStore } from 'pinia'

export interface KeepAliveState {
  keepAliveComponents: string[]
}

export const useKeepAliveStore = defineStore('keepAlive', {
  state: () => ({ keepAliveComponents: [] as string[] }),

  getters: {
    getKeepAliveComponents: state => state.keepAliveComponents
  },

  actions: {
    /**
     * addKeepAlive
     * @description add the specified component to keep-alive list if not exist
     * @param {string} component - component name
     */
    addKeepAlive(component: string) {
      !this.keepAliveComponents.includes(component) &&
        this.keepAliveComponents.push(component)
    },

    /**
     * removeKeepAlive
     * @description remove the specified component from keep-alive list
     * @param {string} component - component name
     */
    removeKeepAlive(component: string) {
      const index = this.keepAliveComponents.indexOf(component)
      index !== -1 && this.keepAliveComponents.splice(index, 1)
    }
  }
})
