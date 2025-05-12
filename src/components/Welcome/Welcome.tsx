import { defineComponent } from 'vue'

import { welcomeProps } from './Welcome.define'
import styles from './Welcome.module.css'

export default defineComponent({
  name: 'Welcome',
  props: welcomeProps(),
  render() {
    return <h2 class={styles.welcome}>{this.msg}</h2>
  }
})
