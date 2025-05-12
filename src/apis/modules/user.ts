import { ajax } from '@/utils'

export const userApi = {
  /**
   * Retrieves the driver's home completion counts from the server.
   *
   * @return {Promise<IGetInfoRes>} A Promise that resolves to the driver's home completion counts.
   */
  getDriverHomeCompletionCounts(): Promise<any> {
    return ajax.get(
      '/cloud-order/cloudDriverOrderController/driverHomeCompletionCounts'
    )
  },

  /**
   * Changes the password for the current user.
   *
   * @param {Auth.ChangePassword} data - The data to change the password with.
   * @return {Promise<any>} A Promise that resolves when the password has been changed.
   */
  changePassword(data: Auth.ChangePassword): Promise<any> {
    return ajax.post(
      '/cloud-platform/cloudDriverLogin/resetDriverPassword',
      data
    )
  },

  /**
   * Retrieves detailed information about the driver.
   *
   * @return {Promise<any>} A Promise that resolves to the driver's detailed information.
   */

  getDriverInfo(): Promise<any> {
    return ajax.get('/cloud-platform/cloudDriverInfo/driverDetails')
  },

  /**
   * Updates the driver's information.
   *
   * @param {any} data - The data containing the driver's updated information.
   * @return {Promise<any>} A Promise that resolves when the driver's information has been updated.
   */

  updateDriverInfo(data: any): Promise<any> {
    return ajax.post('/cloud-platform/cloudDriverInfo/driverUpdate', data)
  },

  /**
   * Changes the phone number for the current user.
   *
   * @param {Auth.ChangePhone} data - The data to change the phone number with.
   * @return {Promise<any>} A Promise that resolves when the phone number has been changed.
   */
  updatePhoneNumber(data: Auth.ChangePhone): Promise<any> {
    return ajax.post('/cloud-platform/cloudDriverInfo/driverUpdatePhone', data)
  }
}
