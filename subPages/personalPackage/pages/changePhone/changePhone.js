//logs.js
let iTimer = null;
let app = getApp();
Page({
  data: {
    getVcode:false,
    time:59,
    tel:'',
    vcode:'',
    password:'',
    passwordLogin:true,
    type:0,         //类型 0：手机号+密码登录； 1：手机号+验证码登录；




    isRight:false   //按钮是否高亮显示
  },
  // 去注册
  to_sign:function(){
  	wx.redirectTo({
  		url:'../sign/sign'
  	})
  },
  // 去找回密码
  to_forget:function(){
  	wx.redirectTo({
  		url:'../forget/forget?revise=0'
  	})
  },
  // 验证码/密码 登录切换
  checkout_tip:function(){
    let passwordLoginStatus = this.data.passwordLogin;
    this.setData({
      passwordLogin:!passwordLoginStatus
    })
    if (!passwordLoginStatus == true) {
      this.setData({
        type:0,         //类型 0：手机号+密码登录； 1：手机号+验证码登录；
        isRight:false
      })
    }else {
      this.setData({
        type:1,         //类型 0：手机号+密码登录； 1：手机号+验证码登录；
        isRight:false
      })
    }
  },
  // 电话号
  bindTel:function(e){
    let that = this;
  	let tel = e.detail.value;
    let telReg = /^[1][3,4,5,7,8][0-9]{9}$/;

    if (tel.length == 11) {
      if (!telReg.test(tel)){
        app.showLoading("手机号输入有误", "none");
      }else{
        // 判断手机号是否注册
         app.wxRequest("coreapi/user/v1/isregistered",
          {
            phone:tel
          },
          "POST",function (res) {
            if (res.data.code == 0) {
              let isregistered = res.data.data;
              if (isregistered == true) {
                // 已注册
                that.setData({
                  isregistered:true
                })
                app.showLoading("用户已存在，请更换其他号码", "none");
              }else{
                // 未注册
              }
            } else {
              // app.showLoading(res.data.msg, "none");
            }
        })
      }
    }
  	this.setData({
  		tel:tel
  	})
  },
  // 验证码
  bindVcode:function(e){
  	let vcode = e.detail.value;
    let tel = this.data.tel;
    if (tel.length == 11 && vcode.length == 6) {
      this.setData({
        vcode:vcode,
        isRight:true
      })
    }else{
      this.setData({
        isRight:false
      })
    }
  },
  // 密码
  bindPassword:function(e){
    let tel = this.data.tel;
  	let password = e.detail.value;
    let passwordReg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,16}$/;
    if(tel.length == 11 && password.length>6){
      this.setData({
        password:password,
        isRight:true
      })
    }else{
      this.setData({
        isRight:false
      })
    }
  },
  // 获取语音验证码
  call_code:function(){
    wx.makePhoneCall({
      phoneNumber: '110',
      success:function(){
        // console.log("拨打电话成功！")
      },
      fail:function(){
        // console.log("拨打电话失败！")
      }
    })
  },
  // 获取验证码
  getVcode:function(){
  	let that = this;
    let tel = that.data.tel;
    let telReg = /^[1][3,4,5,7,8][0-9]{9}$/;
    let isregistered = that.data.isregistered; //手机号是否已经注册

    if (!telReg.test(tel)){
        app.showLoading("手机号输入有误","none")
    }else if(isregistered == true){
        app.showLoading("用户已存在，请更换其他号码", "none");
    }else{
      // 手机号正确，倒计时开启
      that.setData({
        getVcode:true
      })
      let num = that.data.time;
      iTimer = setInterval(function(){
        num --
        that.setData({
          time:num
        })
        if (num<=0) {
          clearInterval(iTimer)
          that.setData({
            getVcode:false,
            time:59
          })
        }
      },1000)

      // 获取手机验证码
      app.wxRequest("coreapi/sms/v1/sendsms",
        {
          phone:tel,
          type:"1"
        },
        "POST",function (res) {
          if (res.data.code == 0) {
            // console.log(res)
          } else {
            app.showLoading(res.data.msg, "none");
          }
      })
    }
  },
  // 点击登录
  submit_login:function(){
    let that = this;
    let tel = that.data.tel;
    let password = that.data.password;
    let code = that.data.vcode;
    let type = that.data.type;
    
    // console.log("输入正确"+tel+"---"+password)

    app.wxRequest("coreapi/user/v1/login",
      {
        phone:tel,
        password:password,
        code: code,
        type:type
      },
      "POST",function (res) {
        if (res.data.code == 0) {
          // console.log(res)
          app.globalData.token = res.data.data;
          app.globalData.header["x-authorization"] = res.data.data;
          wx.setStorageSync("token",res.data.data)
          wx.navigateBack();
          // wx.redirectTo({
          //   url:"../../../societyPackage/pages/connection/connection"
          // })
        } else {
          app.showLoading(res.data.msg, "none");
        }
    })
  },
  onLoad: function () {
   // app.getOpenId()
  },
  bindGetUserInfo:function(e){
    var that = this;
    // console.log(e.detail.userInfo);
    app.showLoading("正在登录", "loading");
    let unionId = app.globalData.unionId;
    // console.log(unionId)
    app.globalData.nickName = e.detail.userInfo.nickName;
    app.globalData.iconUrl = e.detail.userInfo.avatarUrl;

    app.wxRequest('coreapi/user/v1/wxLogin', { 
      unionId: unionId,
      name: e.detail.userInfo.nickName,
      iconUrl: e.detail.userInfo.avatarUrl
    }, 'post', function (res) {
      // console.log(res);

      if (res.data.code != 0){
        app.showLoading(res.data.msg,"none");
        wx.navigateTo({
          url: '../bindPhone/bindPhone',
        })
      }else{
        app.showLoading("正在登陆", "loading");
        wx.setStorageSync('token', res.data.data)
        // console.log(res.data.data)
        app.globalData.token = res.data.data;
        app.globalData.header["x-authorization"] = res.data.data;
        wx.navigateBack();
      }
    })
  },
})
