let app = getApp()
const uuid = require('util.js');
Page({
  data: {
    // wrapShow:false
    initSize:10,
    initSkip:0
  },
  choose:function(e){
    let that = this;
    let pages = getCurrentPages();//当前页面
    let prevPage = pages[pages.length - 2];//上一页面
    let user_coupon_id = e.currentTarget.dataset.id;
    prevPage.setData({
      user_coupon_id:user_coupon_id
    })
    // console.log(e.currentTarget.dataset.index)
    console.log(that.data.CouponList[e.currentTarget.dataset.index])
    let CouponList = that.data.CouponList;
    for (var i = 0; i < CouponList.length; i++) {
      CouponList[i].checked = false
    }
    CouponList[e.currentTarget.dataset.index].checked = true;
    
    that.setData({
      CouponList:CouponList
    })

    setTimeout(function(){
      wx.navigateBack({
        delta:1
      })
    },500)
  },
  onLoad: function (options) {
    let skuId = options.skuId;
    let skuType = options.skuType;
    this.initCouponList(skuId,skuType)
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
  initCouponList:function(skuid,skuType){
    let that = this;
    let initSize = that.data.initSize;
    let initSkip = that.data.initSkip;
    app.isToken().then(
      app.wxRequest("coreapi/core/v1/querySkuUseCouponList",
        {
          skuid:skuid,
          skuType:skuType,
          token:app.globalData.token
        },
        "POST",function (res) {
          if (res.data.code == 0) {
            // console.log(res.data.data)
            let CouponList = res.data.data
            for (var i = 0; i < CouponList.length; i++) {
              CouponList[i].checked = false
            }

            that.setData({
              CouponList:CouponList
            })
          } else {
            app.showLoading(res.data.msg, "none");
          }
      })
    )
  }
})