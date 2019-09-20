//logs.js
let iTimer = null;
let app = getApp();
Page({
  data: {
    title:"忘记密码",   //默认title名称  忘记密码  如果是修改密码跳转过来 则单独设置
    getVcode:false,
    time:59,
    tel:'',
    vcode:'',
    password:'',
    password2:'',


    sendsmsType:"0",    //类型 0：身份验证（忘记密码时使用）； 1：登录；2：注册；3：修改密码
    updatepwdType: "2"  //类型：1.主动修改密码；2：忘记密码修改密码
  },
  bindTel:function(e){
    let that = this;
  	let tel = e.detail.value;
    let telReg = /^[1][3,4,5,7,8][0-9]{9}$/;
    if (tel.length==11) {
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
        this.setData({
          tel:tel
        })
      }
    }
  },
  bindVcode:function(e){
    this.setData({
      vcode:e.detail.value
    })
  },
  bindPassword:function(e){
  	this.setData({
  		password:e.detail.value.replace(/\s+/g, '')
  	})
  },
  bindPassword2:function(e){
    this.setData({
      password2:e.detail.value.replace(/\s+/g, '')
    })
  },
  getVcode:function(){
    let that = this;
    let tel = that.data.tel;
    let telReg = /^[1][3,4,5,6,7,8][0-9]{9}$/;
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
          type:that.data.sendsmsType
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
  onRight:function(){
    let that = this;
    let tel = that.data.tel;
    let vcode = that.data.vcode;
    let password = that.data.password;
    let password2 = that.data.password2;
    // let passwordReg = /^[0-9a-zA-Z]{6,16}$/;
    let passwordReg = /([a-zA-Z0-9!@#$%^&*()_?<>{}]){6,24}/;

    if(vcode.length != 6){
      app.showLoading("验证码位数不正确", "none");
    }else if (!passwordReg.test(password)) {
      app.showLoading("密码中不能包含特殊符号", "none");
    }else if(password2 != password){
      app.showLoading("两次密码输入不一样", "none");
    }else{
      app.wxRequest("coreapi/user/v1/updatepwd",
        {
          phone:tel,
          type:that.data.updatepwdType,
          password:password,
          code:vcode
        },
        "POST",function (res) {
          if (res.data.code == 0) {
            console.log(res)
            app.showLoading("修改成功", "none");
            wx.navigateBack()
          } else {
            app.showLoading(res.data.msg, "none");
          }
      })
    }
  },
  onLoad: function (options) {
    let that = this;
    console.log(options)
    if (options.revise == "1") {    //1为用户主动修改密码 0为忘记密码
      that.setData({
        sendsmsType:"3",
        updatepwdType:"1",
        title:"修改密码"
      })
      wx.setNavigationBarTitle({
        title: '修改密码'
      })
      console.log(that.data.sendsmsType,that.data.updatepwdType,that.data.title)
    }else{
      wx.setNavigationBarTitle({
        title: '忘记密码'
      })
      console.log("未修改"+that.data.sendsmsType,that.data.updatepwdType,that.data.title)
    }
  },
  onShow:function(){
    wx.setNavigationBarColor({
        frontColor: '#ffffff', // 必写项
        backgroundColor: '#fd552e', // 必写项
        animation: { // 可选项
            duration: 400,
            timingFunc: 'easeIn'
        }
    })
  }
})
