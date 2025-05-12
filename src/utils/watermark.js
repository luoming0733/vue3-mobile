/**
 * @示例
 *
 beforeUpload(file) {
  return new Promise((resolve, reject) => {
      // 1.调用方法1： 把文件转换为base64字符串
      fileByBase64(file, async (base64) => {
          // 2. 调用方法2：把base64转换为Canvas
          let tempCanvas = await this.imgToCanvas(base64)
          //3.调用方法3： 写入水印到Canvas
          const canvas = this.addWatermark(tempCanvas, '看看账号网');
          //4. 调用方法4：把Canvas转换为image文件
          const img = this.convasToImg(canvas)
          //5.调用方法5：被image转换为File文件(第二个参数为文件名)
          let newFile = base64ToFile(img.src, file.name)
          resolve(newFile)
      })
  })
},
 */

/**
 * 文件转base64
 * @param  file 文件流
 * @param  callback 回调函数
 */
export function fileByBase64(file, callback) {
  const reader = new FileReader()
  // 传入一个参数对象即可得到基于该参数对象的文本内容
  reader.readAsDataURL(file)
  reader.onload = function (e) {
    // target.result 该属性表示目标对象的DataURL
    callback(e.target.result)
  }
}

/**
 * 将base64编码的图片转换为canvas元素。
 *
 * @param {string} base64 - base64编码的图片字符串。
 * @return {HTMLCanvasElement} 包含图片的canvas元素。
 */
export async function imgToCanvas(base64) {
  // 创建img元素
  const img = document.createElement('img')
  img.setAttribute('src', base64)
  await new Promise(resolve => (img.onload = resolve))
  // 创建canvas DOM元素，并设置其宽高和图片一样
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  // 坐标(0,0) 表示从此处开始绘制，相当于偏移。
  canvas.getContext('2d').drawImage(img, 0, 0)

  return canvas
}

/**
 * 给指定的canvas元素添加水印。
 *
 * @param {HTMLCanvasElement} canvas - 要添加水印的canvas元素。
 * @param {string} text - 水印文本。
 * @return {HTMLCanvasElement} 添加了水印的canvas元素。
 */
export function addWatermark(canvas, text) {
  const ctx = canvas.getContext('2d')
  // 给上传的图片添加-水印图片
  ctx.drawImage(this.$refs.waterImg, 0, 0)

  // 一下是给图添加  水印文字的方法
  // 设置字体大小和字体
  // ctx.font = '20px Arial';
  // ctx.rotate(-0.4);// 设置文字旋转角度
  // 创建实心水印
  // ctx.strokeStyle = 'rgba(0,0,0,.8)';
  // ctx.fillText(text, (canvas.width)*(0.1), (canvas.height)*(0.1))
  // ctx.fillText(text, canvas.width / 2, canvas.height / 2)
  // 创建虚心水印
  // ctx.strokeStyle = 'rgba(0,0,0,.8)';
  // ctx.strokeText(text, (canvas.width)*(0.1), (canvas.height)*(0.15));
  // ctx.strokeText(text, (canvas.width)*(0.1), (canvas.height)*(0.45));
  // ctx.strokeText(text, canvas.width / 2, canvas.height / 2)
  return canvas
}

/**
 * 给指定的canvas添加重复的水印图案。
 *
 * @param {HTMLCanvasElement} canvas - 需要添加水印的canvas元素。
 * @param {string} text - 水印文本（当前实现中未使用）。
 * @return {HTMLCanvasElement} 添加了水印的canvas元素。
 */
export async function addWatermark2(canvas, text) {
  const ctx = canvas.getContext('2d')
  // 给上传的图片添加-水印图片
  // 创建平铺样式
  const pattern = ctx.createPattern(this.$refs.waterImg, 'repeat')
  // 应用平铺样式
  ctx.fillStyle = pattern
  // 在画布上平铺
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  return canvas
}

/**
 * 将canvas元素转换为image对象。
 *
 * @param {HTMLCanvasElement} canvas - 需要转换的canvas元素。
 * @return {HTMLImageElement} 从canvas创建的image对象。
 */
export function convasToImg(canvas) {
  // 新建Image对象，可以理解为DOM
  const image = new Image()
  // canvas.toDataURL 返回的是一串Base64编码的URL
  // 指定格式 PNG
  image.src = canvas.toDataURL('image/png')
  return image
}

/**
 * 将base64编码的字符串转换为File对象。
 *
 * @param {string} urlData - base64编码的字符串。
 * @param {string} fileName - 文件名。
 * @return {File} 转换后的File对象。
 */
export function base64ToFile(urlData, fileName) {
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
