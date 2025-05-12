<template>
  <canvas
    ref="cvs"
    :class="cvsClass"
    :width="props.width"
    :height="props.height"
  ></canvas>
</template>

<script setup>
import { nextTick, reactive, ref, watch } from 'vue'
const props = defineProps({
  // 是否开启服务端验证
  servertest: {
    type: Boolean,
    default: false
  },

  width: {
    type: Number,
    default: 300
  },
  height: {
    type: Number,
    default: 45
  },
  strokeWidth: {
    type: Number,
    default: 5
  },

  // 滑块宽度
  dropWidth: {
    type: Number,
    default: 50
  },

  // 已激活验证背景色 activeBgColor | 验证中激活的背景色 testIngBgColor| 验证成功激活的背景色 successBgColor
  // 验证成功文本色 tipSucColor| 验证失败文本色 tipTailColor | 验证中的文本色 tipTestIngColor | 待验证文本色 tipNoneColor
  // 移动滑块背景色 dropColor
  // 滑块原始背景色  slideColor

  // 滑块颜色
  dropColor: {
    type: String,
    default: '#fff'
  },

  // 待验证文本色
  tipNoneColor: {
    type: String,
    default: '#000'
  },

  // 验证成功文本色
  tipSucColor: {
    type: String,
    default: '#fff'
  },

  // 验证中的文本色
  tipTestIngColor: {
    type: String,
    default: '#fff'
  },

  // 验证失败文本色
  tipTailColor: {
    type: String,
    default: '#ee0a24'
  },

  // 验证中提示
  testTip: {
    type: String,
    default: '正在验证...'
  },

  // 滑块背景色颜色
  slideColor: {
    type: String,
    default: '#e8e8e8'
  },

  // 滑块背景色颜色
  tipTxt: {
    type: String,
    default: '向右滑动验证'
  },

  // 验证通过背景色
  successBgColor: {
    type: String,
    default: '#07c160'
  },

  //  验证失败背景色
  tailBgColor: {
    type: String,
    default: '#ee0a24'
  },

  // 已激活的背景色
  activeBgColor: {
    type: String,
    default: '#1989fa'
  },

  // 验证中激活的背景色
  testIngBgColor: {
    type: String,
    default: '#ff976a'
  },

  // 验证成功文字提示
  successTip: {
    type: String,
    default: '太棒了，恭喜你验证通过！'
  },

  // 验证失败文字提示
  failTip: {
    type: String,
    default: '验证失败，请重试'
  },

  // 文本大小
  fontSize: {
    type: Number,
    default: 16
  },

  // 文本位置
  marginLeft: {
    type: Number,
    default: 15
  }
})
const emit = defineEmits(['statu'])

let vfcx = null
const cvs = ref()
const cvsClass = ref('cur-none')

const vfcres = {
  startX: 0, //开始拖动滑块位置
  endX: 0, //结束拖动滑块位置
  timed: 0, //拖动所用时间 || 低于30毫秒认定为机器
  guiji: [], //拖动轨迹 | 连续2个2数之差相同判定为机器
  width: props.width
}

const vfcStatu = reactive({
  statu: 'none'
})
// 监听数据，并发给父级
watch(vfcStatu, res => {
  emit('statu', res, vfcres)
  // 验证成功
  if (res.statu === 'success') {
    vfcx.anmateOff = false
    vfcx.activeBgColor = props.successBgColor
    vfcx.tipTxt = props.successTip
    vfcx.colors.slideColor = props.successBgColor
    vfcx.evNone()
  } else if (res.statu === 'tail') {
    // 验证失败
    vfcx.reset()
    vfcx.tipTxt = props.failTip
    vfcx.fontColor = props.tipTailColor
    vfcx.draw()
  } else if (res.statu === 'update') {
    // 更新数据
    vfcx.reset()
    vfcx.tipTxt = props.tipTxt
    vfcx.fontColor = props.tipNoneColor
    vfcx.draw()
  }
})

// 深度监听props数据
watch(
  props,
  () => {
    vfcx.reset()
    vfcx.tipTxt = props.tipTxt
    vfcx.successTip = props.successTip
    vfcx.testTip = props.testTip
    vfcx.failTip = props.failTip
    vfcx.draw()
  },
  {
    deep: true
  }
)

/**
 * 验证器
 * @param {Element} cvsEl canvas元素
 * @param {String, default:'cur-none'} cvsClass canvas的class
 * @param {Boolear, default:fasle} vfcres 验证结果
 * @param {Number, default:5} strokeWidth 滑块内边距
 * @param {Number,default:50} dropWidth 滑块宽度
 * @param {color,default:'#fff'} dropColor 移动滑块背景色
 * @param {color,default:'#e8e8e8'} slideColor 滑块背景色颜色
 * @param {color,default:'skyblue'} activeBgColor 已激活验证背景色
 * @param {color,default:'#ff976a'} testIngBgColor 验证中激活的背景色
 * @param {color,default:'#07c160'} successBgColor 验证成功激活的背景色
 * @param {color,default:'#07c160'} tipSucColor 验证成功文本色
 * @param {color,default:'#ee0a24'} tipTailColor 验证失败文本色
 * @param {color,default:'#fff'} tipTestIngColor 验证中的文本色
 * @param {color,default:'#000'} tipNoneColor 待验证文本色
 * @param {String,default:'向右滑动验证'} tipTxt 文字提示
 * @param {String,default:'太棒了，恭喜你验证通过！'} successTip 验证成功文字提示
 * @param {String,default:'验证失败，请重试...'} failTip 验证失败文字提示
 * @param {Bool} servertest 是否开启前端验证模式
 * @param {String} testTip 验证提示
 */
class Vfcs {
  constructor(
    cvsEl,
    cvsClass,
    vfcres,
    vfcStatu,
    strokeWidth,
    dropWidth,
    fontSize,
    servertest,
    colors,
    tipTxt,
    marginLeft
  ) {
    this.cvsEl = cvsEl
    this.vfcres = vfcres
    this.cvsClass = cvsClass
    this.strokeWidth = strokeWidth
    this.dropWidth = dropWidth
    this.vfcStatu = vfcStatu

    this.colors = colors
    this.fontSize = fontSize
    this.dwonIsPath = false //是否按下验证滑块
    this.ctx = null
    this.allTipTxts = tipTxt
    this.tipTxt = this.allTipTxts.tipTxt

    this.fontColor = this.colors.tipNoneColor
    this.activeBgColor = this.colors.activeBgColor

    this.marginLeft = marginLeft

    this.servertest = servertest

    this.guiji = []
    this.startTime = 0
    this.endTime = 0
    this.startX = 0
    this.startY = 0
    this.moveX = 0
    this.moveY = 0
    this.fontOp = 1 //文本透明度
    this.met = false

    this.offX = 0 //x轴的位移
    this.minX = this.strokeWidth / 2
    this.maxX = this.cvsEl.width - this.dropWidth - this.strokeWidth
    // this.dropX最大值 -》  cW - this.dropWidth - this.strokeWidth / 2
    // this.dropX最小 -》   this.strokeWidth / 2
    this.dropX = this.minX + this.offX // 滑块位置
    this.toTouchEnd = false

    //是否按下滑块
    this.isDown = false

    this.testAm = null //验证中动画的id
    this.anmateOff = true //动画开关

    this.evsName = [] //事件名
    this.evsFun = [
      this.down.bind(this),
      this.move.bind(this),
      this.up.bind(this)
    ] //事件方法

    this.init()
  }

  init() {
    this.ctx = this.cvsEl.getContext('2d')
    this.draw()

    this.evsName = this.evType()

    // 给canvas添加事件
    this.evsName.forEach((evName, i) =>
      i === 0
        ? this.cvsEl.addEventListener(evName, this.evsFun[i])
        : document.addEventListener(evName, this.evsFun[i])
    )
  }

  // 绘制
  draw() {
    const cW = this.cvsEl.width,
      cH = this.cvsEl.height,
      c = this.ctx

    c.clearRect(0, 0, cW, cH)
    c.globalAlpha = this.fontOp // 设置图像透明度

    c.fillRect(0, 0, cW, cH)
    c.fillStyle = this.colors.slideColor
    c.strokeStyle = this.colors.slideColor
    c.lineWidth = this.strokeWidth
    c.fillRect(0, 0, cW, cH)
    c.strokeRect(0, 0, cW, cH)

    // 激活背景色
    c.fillStyle = this.activeBgColor
    c.strokeStyle = this.activeBgColor
    c.fillRect(this.minX + 2, this.minX, this.offX, cH - this.strokeWidth)
    // 文本提示
    c.textAlign = 'center'
    c.textBaseline = 'middle'
    c.fillStyle = this.fontColor
    c.font = `${this.fontSize}px 黑体`
    c.fillText(this.tipTxt, cW / 2 + this.marginLeft, cH / 2)

    // 验证失败
    // 待验证 | 验证中
    if (
      this.vfcStatu.statu === 'none' ||
      this.vfcStatu.statu === 'testing' ||
      this.vfcStatu.statu === 'servertest' ||
      this.vfcStatu.statu === 'tail' ||
      this.vfcStatu.statu === 'update'
    ) {
      // 滑块
      c.beginPath()
      c.fillStyle = this.colors.dropColor
      c.rect(this.dropX, this.minX, this.dropWidth, cH - this.strokeWidth)
      c.fill()

      // 箭头
      c.lineWidth = 2
      // 右边箭头
      c.moveTo(this.dropX + this.dropWidth / 1.7 - 5, this.strokeWidth + 10)
      c.lineTo(this.dropX + this.dropWidth / 1.7 + 5, cH / 2)
      c.lineTo(
        this.dropX + this.dropWidth / 1.7 - 5,
        cH - this.strokeWidth - 10
      )
      // 左边箭头
      c.moveTo(this.dropX + this.dropWidth / 1.7 - 15, this.strokeWidth + 10)
      c.lineTo(this.dropX + this.dropWidth / 1.7 - 5, cH / 2)
      c.lineTo(
        this.dropX + this.dropWidth / 1.7 - 15,
        cH - this.strokeWidth - 10
      )
      c.stroke()
      c.closePath()

      // 验证成功
    } else if (this.vfcStatu.statu === 'success') {
      // 滑块
      c.beginPath()
      c.fillStyle = this.colors.dropColor
      c.rect(this.dropX, this.minX, this.dropWidth, cH - this.strokeWidth)
      c.fill()
      c.closePath()

      // 圈
      c.beginPath()
      c.fillStyle = this.colors.successBgColor
      c.arc(this.dropWidth / 2 + this.dropX, cH / 2, cH / 3, 0, 2 * Math.PI)
      c.fill()
      c.closePath()

      // 勾
      c.beginPath()
      c.lineWidth = 3
      c.lineJoin = 'bevel'
      c.lineCap = 'round'
      c.strokeStyle = this.colors.dropColor
      c.moveTo(this.dropX + this.dropWidth / 2 - 8, cH / 2 + 1)
      c.lineTo(this.dropX + this.dropWidth / 2.1, cH / 1.6)
      c.lineTo(this.dropX + this.dropWidth / 2 + 8, cH / 2 - 5)

      c.stroke()
      c.closePath()
    }
  }

  // 滑块按下
  down(ev) {
    if (
      this.vfcStatu.statu === 'testing' ||
      this.vfcStatu.statu === 'servertest'
    )
      return

    this.setXY(ev)
    //按下滑块
    this.isDown = true
    this.startTime = new Date().getTime()
    // 若按下滑块
    const isPath = this.ctx.isPointInPath(this.startX, this.startY)
    this.dwonIsPath = isPath
  }

  // 滑块移动
  move(ev) {
    if (
      this.vfcStatu.statu === 'testing' ||
      this.vfcStatu.statu === 'servertest'
    )
      return

    this.setXY(ev)
    const isPath = this.ctx.isPointInPath(this.moveX, this.moveX)
    // pc 鼠标变手势
    if (ev.x)
      isPath === true
        ? (this.cvsClass.value = 'cur')
        : (this.cvsClass.value = 'cur-none')

    const x = Number(this.moveX.toFixed(2))
    const y = Number(this.moveY.toFixed(2))
    const moveTime = new Date().getTime()

    this.guiji.push({ x, y, moveTime })

    if (this.dwonIsPath === false || this.moveX <= 0) return

    if (this.isDown === true) {
      // 若滑到尾部
      this.toTouchEnd = this.touchDrosToEnd()
      if (this.toTouchEnd === true) {
        this.marginLeft = -15
        this.up()
      }
      this.draw()
    }
  }

  // 滑块抬起
  up() {
    if (
      this.vfcStatu.statu === 'testing' ||
      this.vfcStatu.statu === 'servertest' ||
      this.offX === 0 ||
      this.dwonIsPath === false ||
      this.moveX <= 0
    )
      return

    this.endTime = new Date().getTime()
    this.vfcres.startX = this.startX //鼠标/手指按下位置
    this.vfcres.endX = this.dropX + this.dropWidth + this.minX //鼠标/手指抬起位置
    this.vfcres.timed = this.endTime - this.startTime //耗时
    this.vfcres.guiji = this.guiji //滑动轨迹
    this.vfcres.width = this.cvsEl.width

    this.dwonIsPath = false
    this.isDown = false

    // 未滑动到尾部
    if (this.toTouchEnd === false) {
      this.dropX = this.minX // 滑块位置
      this.offX = 0
      this.tipTxt = this.allTipTxts.failTip
      this.fontColor = this.colors.tipTailColor

      // 滑动到尾部
    } else {
      this.vfcStatu.statu = 'testing'
      this.testAdmate() //开启动画
      // 验证中
      this.fontColor = this.colors.tipTestIngColor
      this.tipTxt = this.allTipTxts.testTip
      this.activeBgColor = this.colors.testIngBgColor
      this.dropX = this.maxX + this.minX // 滑块位置

      const test = this.testVer()

      setTimeout(() => {
        // 前端验证通过
        if (test === 'success') {
          // 已开启前端验证模式
          if (this.servertest === true) {
            this.vfcStatu.statu = 'servertest'
          } else {
            this.vfcStatu.statu = 'success'
          }

          // 前端验证不通过
        } else {
          this.vfcStatu.statu = 'tail'
        }
        this.marginLeft = 15
      }, 1000)
    }
    this.draw()

    this.guiji = []
  }

  // 重置滑块
  reset() {
    this.dropX = this.minX // 滑块位置
    this.anmateOff = false
    this.activeBgColor = this.colors.activeBgColor
    this.fontColor = this.colors.tipNoneColor
    this.tipTxt = this.allTipTxts.tipTxt
    this.offX = 0
    this.toTouchEnd = false
    this.guiji = []

    this.draw()
  }

  // 解绑事件
  evNone() {
    this.evsName.forEach((evName, i) =>
      i === 0
        ? this.cvsEl.removeEventListener(evName, this.evsFun[i])
        : document.removeEventListener(evName, this.evsFun[i])
    )
  }

  // 验证中动画
  testAdmate() {
    // 文本透明度
    if (this.met === false && this.fontOp >= 1) {
      this.met = true
    } else if (this.met === true && this.fontOp <= 0.5) {
      this.met = false
    }
    this.met === false ? (this.fontOp += 0.015) : (this.fontOp -= 0.015)

    this.draw()
    cancelAnimationFrame(this.testAm)
    this.testAm = window.requestAnimationFrame(this.testAdmate.bind(this))

    if (this.anmateOff === false) {
      cancelAnimationFrame(this.testAm)
      this.fontOp = 1
      this.testAm = null
      this.met = false
      this.anmateOff = true
    }
    this.draw()
  }

  /**
   * 验证是否滑动到尾部
   * @return {Number}  return true 到尾部，false 没到尾部
   */
  touchDrosToEnd() {
    const x = this.offX + this.dropWidth + this.strokeWidth
    const isSuccess = x >= this.cvsEl.width

    return isSuccess
  }

  // 设置xy坐标
  setXY(ev) {
    if (ev.type === 'touchstart') {
      this.startX =
        ev.touches[0].clientX - this.cvsEl.getBoundingClientRect().left
      this.startY =
        ev.touches[0].clientY - this.cvsEl.getBoundingClientRect().top
    }
    if (ev.type === 'touchmove') {
      this.moveX =
        ev.touches[0].clientX - this.cvsEl.getBoundingClientRect().left
      this.moveY =
        ev.touches[0].clientY - this.cvsEl.getBoundingClientRect().top
    }

    // ///pc事件 //
    if (ev.type === 'mousedown') {
      this.startX = ev.x - this.cvsEl.getBoundingClientRect().left
      this.startY = ev.y - this.cvsEl.getBoundingClientRect().top
    }
    if (ev.type === 'mousemove') {
      this.moveX = ev.x - this.cvsEl.getBoundingClientRect().left
      this.moveY = ev.y - this.cvsEl.getBoundingClientRect().top
    }

    // 防止滑块溢出指定范围
    if (ev.type === 'mousemove' || ev.type === 'touchmove') {
      this.offX = this.moveX - this.startX

      if (this.offX > this.maxX) this.offX = this.maxX
      if (this.offX < this.minX) this.offX = this.minX
      this.dropX = this.minX + this.offX // 滑块位置
    }
  }

  // 事件类型
  evType() {
    const isMobile =
      navigator.userAgent.match(
        /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
      ) !== null

    const events = isMobile
      ? ['touchstart', 'touchmove', 'touchend']
      : ['mousedown', 'mousemove', 'mouseup']

    return events
  }

  /**
   * 滑动轨迹信息 | 计算滑动轨迹每2数之间的差值 | 出现次数等
   * @return {Object(chaArr,repeatX,repeatY,repeatMaxXCount,repeatMaxYCount,allCount)} chaArr → 每2数之间的插值 | repeatX → x轴每2数之间的差值与重复数  | repeatY → y轴每2数之间的差值与重复数 |  repeatMaxXCount → x轴每重复数最多的次数 | repeatMaxYCount → y轴每重复数最多的次数
   */
  arrCmp() {
    // 重复的数量
    const repeatX = []
    const repeatY = []
    const timed = []

    const chaArr = this.guiji.reduce((prev, itm, i, arr) => {
      if (i === arr.length - 1) return prev
      const nv = arr[i + 1]
      const chaX = Number((nv.x - itm.x).toFixed(2))
      const chaY = Number((nv.y - itm.y).toFixed(2))
      const timeCha = nv.moveTime - itm.moveTime
      timed.push(timeCha) //时间差

      // 是否有重复的数组
      const repeatXIndex = repeatX.findIndex(item => item.num === chaX)
      const repeatYIndex = repeatY.findIndex(item => item.num === chaY)

      // xy轴每2数差数据
      if (repeatXIndex === -1) {
        const obj = {
          num: chaX,
          count: 1
        }
        repeatX.push(obj)
      } else {
        repeatX[repeatXIndex].count++
      }

      if (repeatYIndex === -1) {
        const obj = {
          num: chaY,
          count: 1
        }
        repeatY.push(obj)
      } else {
        repeatY[repeatYIndex].count++
      }

      prev.push({ x: chaX, y: chaY })
      return prev
    }, [])

    // 所有重复次数
    const findXCount = []
    const findYCount = []
    repeatX.forEach(it => findXCount.push(it.count))
    repeatY.forEach(it => findYCount.push(it.count))

    const repeatMaxXCount = Math.max(...findXCount) //x重复最多的次数
    const repeatMaxYCount = Math.max(...findYCount) //y重复最多的次数
    const repeatMaxTimed = Math.max(...timed) //滑动时间重复最多的次数

    return {
      chaArr,
      repeatX,
      repeatY,
      repeatMaxXCount,
      repeatMaxYCount,
      repeatMaxTimed
    }
  }

  // 前端验证
  //  x轴最大波动大于数等于所有波动长度则为人机 | y轴最大波动数等于所有波动长度则为人机 | 滑动时间低于50毫秒不通过  | 时间波动最大次数大于滑动轨迹长度的3/1为人机
  testVer() {
    // return 'tail'
    // 滑动所用时间低于50毫秒 是人机
    if (this.vfcres.timed < 50) return 'tail'

    const sliderInfo = this.arrCmp() //处理滑动轨迹信息

    // 时间波动最大次数等于sliderInfo.chaArr.length滑动轨迹长度为人机
    const timeTest = sliderInfo.repeatMaxTimed === sliderInfo.chaArr.length
    if (timeTest === true) return 'tail'

    // x轴最大波动大于数等于所有波动长度则为人机
    if (sliderInfo.repeatMaxXCount === sliderInfo.repeatX) return 'tail'

    //  y轴最大波动数等于所有波动长度则为人机
    if (sliderInfo.repeatMaxYCount === sliderInfo.chaArr.length) return 'tail'

    // 是真人
    return 'success'
  }
}
nextTick(() => {
  const colors = {
    activeBgColor: props.activeBgColor,
    testIngBgColor: props.testIngBgColor,
    successBgColor: props.successBgColor,
    tipSucColor: props.tipSucColor,
    tipTailColor: props.tipTailColor,
    tipTestIngColor: props.tipTestIngColor,
    tipNoneColor: props.tipNoneColor,
    dropColor: props.dropColor,
    slideColor: props.slideColor
  }

  const tipTxt = {
    testTip: props.testTip,
    tipTxt: props.tipTxt,
    successTip: props.successTip,
    failTip: props.failTip
  }

  vfcx = new Vfcs(
    cvs.value,
    cvsClass,
    vfcres,
    vfcStatu,
    props.strokeWidth,
    props.dropWidth,
    props.fontSize,
    props.servertest,
    colors,
    tipTxt,
    props.marginLeft
  )
})
</script>
<style scoped>
.cur {
  cursor: pointer;
}

.cur-none {
  cursor: default;
}
</style>
