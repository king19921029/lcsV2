let iTimer = null;
Component({
  // options: {
  //   multipleSlots: true // 在组件定义时的选项中启用多slot支持
  // },
  /**
   * 组件的属性列表
   * 用于组件自定义设置
   */
  properties: {
    // confirm配置 有按钮
    // 标题
    title: {
      type: String,  
      value: "您还没有登录哦"
    },
    // 内容
    tip: {
      type: String,  
      value: "新用户注册免费领取大礼包"
    },
    // 图片
    icon: {
      type: String,  
      value: "../../images/sleep.png"
    },
    btn1: {
      type: String,
      value: "登陆"
    },
    btn2: {
      type: String,
      value: "注册"
    },
    btn1Link: {
      type: String,
      value: ""
    },
    btn2Link: {
      type: String,
      value: ""
    },




    // dialog配置
    // 类型 confirm || dialog
    type: {
      type: String,
      value : "toast"
    },



    // 如果是上面的形式，下面的参数可以不传
    // 图标
    dialogIcon: {
      type: String,
      value: "../../images/end.png"
    },
    // 内容
    text: {
      type: String,
      value: "各种成功"
    }
  },

  /**
   * 私有数据,组件的初始数据
   * 可用于模版渲染
   */
  data: {
    
  },

  /**
   * 组件的方法列表
   * 更新属性和数据的方法与更新页面数据的方法类似
   */
  methods: {
    to_btn1:function(){
      this.triggerEvent('myevent1')
      // wx.navigateTo({
      //   url:"../../subPages/loginPackage/pages/login/login"
      // })
    },
    to_btn2:function(){
      this.triggerEvent('myevent2')
      // wx.navigateTo({
      //   url:"../../subPages/loginPackage/pages/sign/sign"
      // })
    },
    tip_off:function(){
      this.triggerEvent('off')
    }
  }
})