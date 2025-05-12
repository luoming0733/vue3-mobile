import { ajax } from '@/utils'

export const vehicleApi = {
  /**
   * 获取我的车辆
   * @returns {Promise<any>} 一个 Promise，它在服务器响应后解析。
   */
  getMyVehicle(): Promise<any> {
    return ajax.get('/cloud-platform/cloudVehicles/getVehicles')
  },

  /**
   * 获取汽车型号类型
   * @returns {Promise<any>} 一个 Promise，它解析为包含汽车型号类型数据的响应。
   */

  getCarModelType(): Promise<any> {
    return ajax.get(
      '/cloud-platform/dictionary/findParentAndChildrenByType/CAR_MODEL'
    )
  },

  /**
   * 获取汽车类型
   * @returns {Promise<any>} 一个 Promise，它解析为包含汽车类型数据的响应。
   */
  getVehicleType(): Promise<any> {
    return ajax.get('/cloud-platform/dictionary/type/CAR_MODEL')
  },

  /**
   * Updates the vehicle information.
   *
   * @param {any} data - The data containing the vehicle's updated information.
   * @return {Promise<any>} A Promise that resolves when the vehicle's information has been updated.
   */

  updateVehicle(data: any): Promise<any> {
    return ajax.post('/cloud-platform/cloudVehicles/vehiclesUpdate', data)
  },

  /**
   * Adds a new vehicle to the system.
   *
   * @param {any} data - The data containing the new vehicle's information.
   * @return {Promise<any>} A Promise that resolves when the vehicle has been added.
   */
  addVehicle(data: any): Promise<any> {
    return ajax.post('/cloud-platform/cloudVehicles/vehiclesAdd', data)
  },

  /**
   * Adds or updates a vehicle in the system.
   *
   * @param {any} data - The data containing the vehicle's information.
   * @param {'Add' | 'Update'} url - Specifies the operation to perform: 'Add' to add a new vehicle or 'Update' to update an existing vehicle.
   * @return {Promise<any>} A Promise that resolves when the vehicle has been added or updated.
   */
  addOrUpdateVehicle(data: any, url: 'Add' | 'Update'): Promise<any> {
    return ajax.post(`/cloud-platform/cloudVehicles/vehicles${url}`, data)
  }
}
