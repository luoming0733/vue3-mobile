import type { AxiosInstance } from 'axios'
import MockAdapter from 'axios-mock-adapter'

export function useMock(instance: AxiosInstance) {
  const mock = new MockAdapter(instance, { delayResponse: 500 })

  mock.onGet('/api/demo/info').reply(200, {
    title: 'Hello World'
  })
}
