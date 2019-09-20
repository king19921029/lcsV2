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
        this.setData({
          tel:tel
        })   
      }
    }
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
  // 获取语音验证码
  call_code:function(){
    let that = this;
    let tel = that.data.tel;
    let telReg = /^[1][3,4,5,7,8][0-9]{9}$/;
    // console.log(tel)
    if (tel.length == 11) {
      if (!telReg.test(tel)){
        app.showLoading("手机号输入有误", "none");
      }else{
        // 发送语音验证码
         app.wxRequest("coreapi/sms/v1/sendsms4voice",
          {
            phone:tel,
            type:1
          },
          "POST",function (res) {
            // console.log(res.data.data)
            if (res.data.data == true) {
              app.showLoading("请注意接收语音电话", "none");
            }else{
              app.showLoading("语音发送失败", "none");
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
    let telReg = /^[1][3,4,5,6,7,8][0-9]{9}$/;
    let isregistered = that.data.isregistered; //手机号是否已经注册

    if (!telReg.test(tel)){
        app.showLoading("手机号输入有误","none")
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
  // 点击绑定
  submit_login:function(){
    var that = this;
    let phone = that.data.tel;
    let userCode = that.data.vcode;
    let unionId = app.globalData.unionId;
    let name = app.globalData.nickName;
    let iconUrl = app.globalData.iconUrl;

    // console.log(phone,userCode,unionId,name,iconUrl)
    
    app.wxRequest('coreapi/user/v1/bindPhone', { 
      phone: phone, 
      code: userCode,
      unionId: unionId,
      // name: name,
      // iconUrl: iconUrl
      }, 'POST', function (res) {
        // console.log(res);
        if (res.data.code != 0) {
          app.showLoading(res.data.msg, "none");
        } else {
          app.showLoading("绑定成功", "success");
          wx.setStorageSync('token', res.data.data)
          app.globalData.token = res.data.data;
          app.globalData.header["x-authorization"] = res.data.data;
          // wx.navigateBack({ delta: 3});
          wx.redirectTo({
            url: '../../../personalPackage/pages/user/user?from=sign'
          })
        }
    })
  },
  onLoad: function () {
   
  },
})
