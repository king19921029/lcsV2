const app = getApp();
const uuid = require('util.js');
Page({
  data: {
    chooseNum:"",
    rmbData:{},//充值项
    user:{},//用户信息
  },
  choose_money:function(e){
    let num = e.currentTarget.dataset.id;
    this.setData({
      chooseNum:num
    })
    
  },
  to_history:function(){
    wx.navigateTo({
      url:'../buyhistory/buyhistory'
    })
  },
  to_coupon:function(){
    wx.navigateTo({
      url:'../coupon/coupon'
    })
    // wx.navigateTo({
    //   url:'../usecoupon/usecoupon'
    // })
  },
  onLoad: function (options) {
    const that = this;
    app.wxRequest('coreapi/user/v1/getuserinfo',
      {}, 'POST', function (res) {
      that.setData({
        user: res.data.data
      })
      // console.log(res.data.data)
    })
    app.wxRequest('coreapi/meta/v1/getchargeitems', {}, 
      'POST', function (res) {
      that.setData({
        rmbData: res.data.data
      })
    })
    
  },
  wxBuy: function () {
    var that = this;
  
      
    if (that.data.chooseNum) {
      let chargeId = String(that.data.chooseNum);
      let openId = app.globalData.openId;
      app.wxRequest('coreapi/pay/v1/charge4wechatjsapiofxcx',
        { chargeId: chargeId, openid: openId },
        'POST', function (res) {
          // console.log(res.data);
          let weChatPayINfo = res.data.data.weChatPayINfo
          wx.requestPayment({
            'timeStamp': weChatPayINfo.timestamp,
            'nonceStr': weChatPayINfo.noncestr,
            'package': weChatPayINfo.perpayid,
            'signType': 'MD5',
            'paySign': weChatPayINfo.sign,
            'success': function (res) {
              app.wxRequest('coreapi/user/v1/getuserinfo',
                {}, 'POST', function (res) {

                  that.setData({
                    user: res.data.data
                  })
              })

              app.showLoading("充值成功", "none")
            },
            'fail': function (res) {
              // console.log(res);
            }
          })
        })
    } else {
      app.showLoading("请选择充值项", "none")
    }
     


  },
  onReady: function () {
    
  },
  onShow: function () {
    // 页面轨迹记录
    let viewTime = app.globalData.viewTime;
    app.onPageViewTime(viewTime)

    let model = wx.getStorageSync("model")
    console.log(model)
    this.setData({
      model:model
    })



    // let pages = getCurrentPages();//当前页面
    // let currPage = pages[pages.length - 1];//上一页面
    // if (currPage.data.user_coupon_id) {
    //   console.log(currPage.data.user_coupon_id)
    // }
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