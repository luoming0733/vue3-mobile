const locale: I18nType.Schema = {
  system: {
    title: '速派会务司机端'
  },

  page: {
    login: {
      common: {
        login: '登录',
        register: '注册',
        forgetPassword: '忘记密码',
        loginSuccess: '登录成功'
      },
      pwdLogin: {
        title: '密码登录',
        rememberMe: '记住我',
        forgetPassword: '忘记密码？',
        register: '注册账号',
        otherAccountLogin: '其他账号登录',
        otherLoginMode: '其他登录方式',
        superAdmin: '超级管理员',
        admin: '管理员',
        user: '普通用户'
      },
      codeLogin: {
        title: '验证码登录',
        getCode: '获取验证码',
        imageCodePlaceholder: '请输入图片验证码'
      },
      register: {
        title: '注册账号',
        agreement: '我已经仔细阅读并接受',
        protocol: '《用户协议》',
        service: '《服务协议》',
        policy: '《隐私协议》'
      },
      resetPwd: {
        title: '重置密码'
      },
      bindWeChat: {
        title: '绑定微信'
      }
    },
    home: {
      common: {
        title: '首页'
      },
      cardData: {
        todayGrabCount: '今日抢单',
        todayTaskCount: '今日任务',
        todayCompletedCount: '今日完成',
        onlineTime: '在线时长'
      },
      tabsList: {
        pendingOrders: '待服务',
        inProgressOrders: '执行中',
        noticeCount: '通知'
      }
    },
    rushOrder: {
      common: {
        title: '抢单'
      }
    },
    notify: {
      common: {
        title: '消息'
      }
    },
    me: {
      common: {
        title: '我的'
      },
      menu: {
        allOrder: '所有订单',
        driverCertification: '驾照认证',
        myCar: '我的车辆',
        myPerformance: '我的业绩',
        myWallet: '我的钱包',
        pwdChange: '密码修改',
        loginOut: '退出登录',
        logoutConvoys: '退出车队'
      }
    }
  }
}

export default locale
