let app = getApp();
const uuid = require('util.js');
Page({
  data: {
    isLogin:false,
    userName:''
  },
  to_feedback: function() {
    wx.navigateTo({
      url: "../feedback/feedback"
    })
  },
  callPhone:function(){
    wx.makePhoneCall({
      phoneNumber: "400-0585-365",
    })
  },
  // 去设置
  to_setting:function(){
    wx.navigateTo({
      url:'../setting/setting'
    })
  },
  // 去个人信息
  to_user:function(){
    wx.navigateTo({
      url:'../user/user'
    })
  },
  // 去账户
  to_account:function(){
    wx.navigateTo({
      url:'../account/account'
    })
  },
  // 初始化个人信息
  initUserInfo:function(){
    let that = this;

    app.isToken().then((data) => {
      // console.log(data)
      let UserInfo = data;
      let workYear = UserInfo.workYear;
      if (workYear == "0") {
        that.setData({
          workYear:"一年以下"
        })
      }else if(workYear == "1") {
        that.setData({
          workYear:"1-3年"
        })
      }else if(workYear == "2") {
        that.setData({
          workYear:"3-5年"
        })
      }else if(workYear == "3") {
         that.setData({
          workYear:"5-10年"
        })
      }else if(workYear == "4") {
         that.setData({
          workYear:"10年以上"
        })
      }
      that.setData({
        UserInfo:UserInfo,
        userName:UserInfo.nickName
      })
    })
  },
  onLoad: function (options) {
    wx.hideShareMenu();
    // console.log("隐藏了当前页面的转发按钮");
  },
  onShow: function () {
    let token = app.globalData.token;
    if (token) {
      // 初始化个人信息
      this.initUserInfo()
      this.setData({
        isLogin:true
      })
    }else{
      this.setData({
        isLogin:false
      })
    }

    // 页面轨迹记录
    let viewTime = app.globalData.viewTime;
    app.onPageViewTime(viewTime)
  },
  onHide:function(){
    // 页面轨迹记录
    let uuids = uuid.create_UUID();//uid
    let pageCode = "3007";//页面CODE
    let beginTime = app.globalData.beginTime;//页面开始时间戳
    let endTime = Date.parse(new Date()) / 1000;//结束时间戳
    app.stopPageViewTime(uuids, pageCode, beginTime, endTime)
  },
  onUnload:function(){
    // 页面轨迹记录
    let uuids = uuid.create_UUID();//uid
    let pageCode = "3007";//页面CODE
    let beginTime = app.globalData.beginTime;//页面开始时间戳
    let endTime = Date.parse(new Date()) / 1000;//结束时间戳
    app.stopPageViewTime(uuids, pageCode, beginTime, endTime)
  },
  go_login:function(){
    wx.navigateTo({
      url:'../../../loginPackage/pages/login/login'
    })
  },
  onShareAppMessage: function (res) {
    let that = this;
    if (res.from === 'button') {
      // 来自页面内转发按钮
      // console.log(res.target)
      return {
        title: "我是"+that.data.userName+"正在I'M理财师学习，来跟我一起学习吧~",
        path: '/pages/school/school'
      }
    }
  },
})