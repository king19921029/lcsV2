//logs.js
let iTimer = null;
let app = getApp();
const uuid = require('util.js');
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
  	wx.navigateTo({
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
              }else{
                // 未注册
                that.setData({
                  isregistered:false
                })
                wx.showModal({
                  title: '提示',
                  content: '该手机号还未注册，马上去注册',
                  success (res) {
                    if (res.confirm) {
                      // console.log('用户点击确定')
                      wx.redirectTo({
                        url: '../sign/sign?tel='+tel
                      })
                    } else if (res.cancel) {
                      // console.log('用户点击取消')
                    }
                  }
                })
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
    this.setData({
      password:password,
      isRight:true
    })
  },
  // 获取语音验证码
  call_code:function(){
    let that = this;
    let tel = that.data.tel;
    let telReg = /^[1][3,4,5,6,7,8][0-9]{9}$/;
    console.log(tel)
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

                app.wxRequest("coreapi/sms/v1/sendsms4voice",
                  {
                    phone:tel,
                    type:1
                  },
                  "POST",function (res) {
                    console.log(res.data.data)
                    if (res.data.data == true) {
                      app.showLoading("请注意接收语音电话", "none");
                    }else{
                      app.showLoading("语音发送失败", "none");
                    }
                  })








              }else{
                // 未注册
                that.setData({
                  isregistered:false
                })
                wx.showModal({
                  title: '提示',
                  content: '该手机号还未注册，马上去注册',
                  success (res) {
                    if (res.confirm) {
                      // console.log('用户点击确定')
                      wx.redirectTo({
                        url: '../sign/sign'
                      })
                    } else if (res.cancel) {
                      // console.log('用户点击取消')
                    }
                  }
                })
              }
            } else {
              // app.showLoading(res.data.msg, "none");
            }
        })
      }
    }else{
      app.showLoading("手机号输入有误", "none");
    }
    // wx.makePhoneCall({
    //   phoneNumber: '110',
    //   success:function(){
    //     console.log("拨打电话成功！")
    //   },
    //   fail:function(){
    //     console.log("拨打电话失败！")
    //   }
    // })
  },
  // 获取验证码
  getVcode:function(){
  	let that = this;
    let tel = that.data.tel;
    let telReg = /^[1][3,4,5,7,8][0-9]{9}$/;
    let isregistered = that.data.isregistered; //手机号是否已经注册

    if (!telReg.test(tel)){
        app.showLoading("手机号输入有误","none")
    }else if(isregistered == false){
        wx.showModal({
          title: '提示',
          content: '该手机号还未注册，马上去注册',
          success (res) {
            if (res.confirm) {
              // console.log('用户点击确定')
              wx.redirectTo({
                url: '../sign/sign'
              })
            } else if (res.cancel) {
              // console.log('用户点击取消')
            }
          }
        })
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
            console.log(res)
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
    
    console.log("输入正确"+tel+"---"+password)

    app.wxRequest("coreapi/user/v1/login",
      {
        phone:tel,
        password:password,
        code: code,
        type:type
      },
      "POST",function (res) {
        if (res.data.code == 0) {
          console.log(res)
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
  onLoad: function (options) {
    var that = this;
   app.getOpenId()
    if (options.tel) {
      console.log(options)
      this.setData({
        tel:options.tel
      })
    }
  },
  bindGetUserInfo:function(e){
    var that = this;
    console.log(e.detail.userInfo);
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
      console.log(res);

      if (res.data.code != 0){
        // app.showLoading(res.data.msg,"none");
        wx.redirectTo({
          url: '../bindPhone/bindPhone',
        })
      }else{
        app.showLoading("正在登陆", "loading");
        wx.setStorageSync('token', res.data.data)
        console.log(res.data.data)
        app.globalData.token = res.data.data;
        app.globalData.header["x-authorization"] = res.data.data;
        wx.navigateBack();
      }
    })
  },
  onShow: function () {
    // 页面轨迹记录
    let viewTime = app.globalData.viewTime;
    app.onPageViewTime(viewTime)


    wx.setNavigationBarColor({
        frontColor: '#ffffff', // 必写项
        backgroundColor: '#fd552e', // 必写项
        animation: { // 可选项
            duration: 400,
            timingFunc: 'easeIn'
        }
    })
  },
  onHide:function(){
    // 页面轨迹记录
    let uuids = uuid.create_UUID();//uid
    let pageCode = "4003";//页面CODE
    let beginTime = app.globalData.beginTime;//页面开始时间戳
    let endTime = Date.parse(new Date()) / 1000;//结束时间戳
    app.stopPageViewTime(uuids, pageCode, beginTime, endTime)
  },
  onUnload:function(){
    // 页面轨迹记录
    let uuids = uuid.create_UUID();//uid
    let pageCode = "4003";//页面CODE
    let beginTime = app.globalData.beginTime;//页面开始时间戳
    let endTime = Date.parse(new Date()) / 1000;//结束时间戳
    app.stopPageViewTime(uuids, pageCode, beginTime, endTime)
  },
})
