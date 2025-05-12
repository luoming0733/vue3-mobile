declare module '@/utils/jsBridge' {
  interface JsBridge {
    registerHandler: (
      name: string,
      callback: (
        data: any,
        responseCallback: (responseData: any) => void
      ) => void
    ) => void

    callHandler: (
      name: string,
      data: any,
      callback: (responseData: any) => void
    ) => void
  }

  const jsBridge: JsBridge
  export default jsBridge
}
