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

    isregistered:false
  },
  // 电话号
  bindTel:function(e){
    let that = this;
  	let tel = e.detail.value;
     if (tel.length == 11) {
      app.wxRequest("coreapi/user/v1/isregistered",
        {
          phone:tel
        },
        "POST",function (res) {
          if (res.data.code == 0) {
            let isregistered = res.data.data;
            if (isregistered == true) {
              // 已注册
              console.log("已经注册")
              wx.showModal({
                title: '提示',
                content: '手机号已注册，马上去登录',
                success (res) {
                  if (res.confirm) {
                    // console.log('用户点击确定')
                    wx.redirectTo({
                      url: '../login/login?tel='+tel
                    })
                  } else if (res.cancel) {
                    // console.log('用户点击取消')
                  }
                }
              })
              that.setData({
                isregistered:true
              })
            }else{
              // 未注册
            }
          } else {
            // app.showLoading(res.data.msg, "none");
          }
      })
    }
  	that.setData({
  		tel:tel
  	})
  },
  // 验证码
  bindVcode:function(e){
  	let vcode = e.detail.value;
  	this.setData({
  		vcode:vcode
  	})
  },
  // 密码
  bindPassword:function(e){
  	this.setData({
  		password:e.detail.value.replace(/\s+/g, '')
  	})
    console.log(this.data.password)
  },
  // 获取验证码
  getVcode:function(){
  	let that = this;
    let tel = that.data.tel;
    let telReg = /^[1][3,4,5,6,7,8][0-9]{9}$/;
    let isregistered = that.data.isregistered; //手机号是否已经注册

    if (!telReg.test(tel)){
        app.showLoading("手机号输入有误","none")
    }else if(isregistered == true){
        wx.showModal({
          title: '提示',
          content: '手机号已注册，马上去登录',
          success (res) {
            if (res.confirm) {
              // console.log('用户点击确定')
              wx.redirectTo({
                url: '../login/login'
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
          type:"2"
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
  // 注册
  sign_btn:function(){
    let that = this;
    let telReg = /^[1][3,4,5,6,7,8][0-9]{9}$/;
    // let passwordReg = /^[0-9a-zA-Z]{6,16}$/;
    let passwordReg = /([a-zA-Z0-9!@#$%^&*()_?<>{}]){6,24}/;
    let tel = that.data.tel;
    let code = that.data.vcode;
    let password = that.data.password;

    if (!telReg.test(tel)){
      app.showLoading("手机号输入有误", "none");
    }else if(password.length<6){
      app.showLoading("密码不能少于6位", "none");
    }else if(!passwordReg.test(password)){
      app.showLoading("密码中不能包含特殊符号", "none");
    }else{
      console.log("输入正确")

      app.wxRequest("coreapi/user/v1/register",
        {
          phone:tel,
          password:password,
          code: code
        },
        "POST",function (res) {
          if (res.data.code == 0) {
            app.globalData.token = res.data.data;
            wx.setStorageSync("token",res.data.data)
            app.globalData.header["x-authorization"] = res.data.data;


            //成功之后自动登录
            //TODO


            // wx.navigateBack({delta:2});
            wx.redirectTo({
              url: '../../../personalPackage/pages/user/user?from=sign'
            })
          } else {
            app.showLoading(res.data.msg, "none");
          }
      })
    }
  },
  onLoad: function (options) {
    if (options.tel) {
      this.setData({
        tel:options.tel
      })
    }
  },
  onShow: function () {
    // 页面轨迹记录
    let viewTime = app.globalData.viewTime;
    app.onPageViewTime(viewTime)
  },
  onHide:function(){
    // 页面轨迹记录
    let uuids = uuid.create_UUID();//uid
    let pageCode = "3008";//页面CODE
    let beginTime = app.globalData.beginTime;//页面开始时间戳
    let endTime = Date.parse(new Date()) / 1000;//结束时间戳
    app.stopPageViewTime(uuids, pageCode, beginTime, endTime)
  },
  onUnload:function(){
    // 页面轨迹记录
    let uuids = uuid.create_UUID();//uid
    let pageCode = "3008";//页面CODE
    let beginTime = app.globalData.beginTime;//页面开始时间戳
    let endTime = Date.parse(new Date()) / 1000;//结束时间戳
    app.stopPageViewTime(uuids, pageCode, beginTime, endTime)
  },
})
