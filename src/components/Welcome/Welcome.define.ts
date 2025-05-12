import { string } from 'vue-types'

export const welcomeProps = () => ({
  /**
   * 欢迎消息
   */
  msg: string().isRequired
})

export type WelcomeProps = Partial<
  ExtractPropTypes<ReturnType<typeof welcomeProps>>
>
