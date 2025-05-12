declare module '@/utils/request.js' {
  import { AxiosRequestConfig, AxiosResponse } from 'axios'

  function request(config: AxiosRequestConfig): Promise<AxiosResponse>

  export default request
}
