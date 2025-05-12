/**
 * @dec 将 base64 编码的数据转换为 File 对象
 * @param {Object} urlData - 包含文件内容的 base64 编码数据
 * @param {string} fileName - 文件名称
 * @return {File} - 转换后的 File 对象
 */
export function base64ToFile(urlData: any, fileName: string) {
  const arr = urlData.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bytes = atob(arr[1]) // 解码base64
  let n = bytes.length
  const ia = new Uint8Array(n)
  while (n--) {
    ia[n] = bytes.charCodeAt(n)
  }
  return new File([ia], fileName, { type: mime })
}

/**
 * @dec 将文件对象转换为 Data URL 格式的 Base64 编码字符串
 * @param file 文件对象，通常是通过文件输入元素获取的
 * @returns Promise 对象，完成时解析为表示文件内容的 Base64 编码的 Data URL 字符串
 *
 * @示例
 * // 创建一个文件对象
 * const file = new File(['内容'], '文件名', { type: 'text/plain' });
 *
 * // 使用 FileToBase64 函数转换文件对象
 * FileToBase64(file).then(base64String => {
 *   console.log(base64String);
 * }).catch(error => {
 *   console.error('Error converting file to base64:', error);
 * });
 */
export function FileToBase64(file: any) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    let fileResult = '' as string
    reader.readAsDataURL(file)
    reader.onload = () => {
      fileResult = String(reader.result)
    }
    reader.onerror = (error: any) => {
      reject(error)
    }
    reader.onloadend = () => {
      resolve(fileResult)
    }
  })
}
