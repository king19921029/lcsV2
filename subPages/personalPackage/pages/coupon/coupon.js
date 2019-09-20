let app = getApp()
const uuid = require('util.js');
Page({
  data: {
    initSize:10,
    initSkip:0
  },
  duihuan:function(){
    let that = this;
    let couponNum = that.data.couponNum;
    if (!couponNum) {
      app.showLoading("请输入兑换码","none")
    }else{
      app.isToken().then(
        app.wxRequest("coreapi/core/v1/exchangeCoupons",
          {
            couponNo:couponNum,           //优惠券码
          },
          "POST",function (res) {
            if (res.data.data.actionResult == 1) {
              app.showLoading("兑换成功", "none");
            }else{
              app.showLoading(res.data.msg, "none");
            }
            // if (res.data.code == 0) {
            //   console.log(res)
              
            // } else {
            //   app.showLoading(res.data.msg, "none");
            // }
        })
      )
    }
  },
  bindInputcoupon:function(e){
    this.setData({
      couponNum:e.detail.value
    })
    if (e.detail.value.length > 0) {
      this.setData({
        in_true:true
      })
    }else{
      this.setData({
        in_true:false
      })
    }
  },
  to_buyCuse:function(){
    wx.navigateTo({
      url:'../../../../pages/commonPage/buyCurse/buyCurse'
    })
  },
  onLoad: function (options) {
    this.initCouponList()
  },
  onReady: function () {
    
  },
  onShow: function () {
    // 页面轨迹记录
    let viewTime = app.globalData.viewTime;
    app.onPageViewTime(viewTime)
  },
  onHide:function(){
    // 页面轨迹记录
    let uuids = uuid.create_UUID();//uid
    let pageCode = "3011";//页面CODE
    let beginTime = app.globalData.beginTime;//页面开始时间戳
    let endTime = Date.parse(new Date()) / 1000;//结束时间戳
    app.stopPageViewTime(uuids, pageCode, beginTime, endTime)
  },
  onUnload:function(){
    // 页面轨迹记录
    let uuids = uuid.create_UUID();//uid
    let pageCode = "3011";//页面CODE
    let beginTime = app.globalData.beginTime;//页面开始时间戳
    let endTime = Date.parse(new Date()) / 1000;//结束时间戳
    app.stopPageViewTime(uuids, pageCode, beginTime, endTime)
  },
  initCouponList:function(){
    wx.showLoading()
    let that = this;
    let initSize = that.data.initSize;
    let initSkip = that.data.initSkip;
    app.isToken().then(
      app.wxRequest("coreapi/core/v1/queryUserCouponList",
        {
          size:initSize,
          skip:initSkip
        },
        "POST",function (res) {
          if (res.data.code == 0) {
            // console.log(res.data.data)
            let CouponList = res.data.data
            that.setData({
              CouponList:CouponList
            })
            wx.hideLoading()
          } else {
            app.showLoading(res.data.msg, "none");
          }
      })
    )
  }
})