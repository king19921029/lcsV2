const app = getApp();
const uuid = require('../../../utils/util.js');
Page({
  data: {
    queryColumnInfo:{},//课程信息
    userMsg:{},//用户信息
    skuId:"",
    skuType:0
  },
  onLoad: function (options) {
    var that = this;
    // SKU基础信息
    console.log(options)
    that.setData({
      skuId: options.skuId,
      skuType: options.skuType || 0,
      couponId: options.couponId || ""
    })
    
  },
  onShow: function () {
    var that = this;
    let skuId = that.data.skuId;
    let cwId = that.data.cwId;
    let skuType = that.data.skuType;

    let pages = getCurrentPages();//当前页面
    let currPage = pages[pages.length - 1];//上一页面
    let couponId = currPage.data.user_coupon_id || "";

    // pageViewTime
    let viewTime = app.globalData.viewTime;
    app.onPageViewTime(viewTime)

    app.wxRequest('coreapi/user/v1/getuserinfo',
      {}, 'POST', (res) => {
        if (res.data.code == 0) {
          that.setData({
            userMsg:res.data.data
          })
        }
      })
    // 专栏
    if (skuType) {
      app.wxRequest("coreapi/core/v1/queryColumnInfo",
        { skuId:skuId }, "POST", function (res) {
          if (res.data.code == 0) {
            that.setData({
              skuId: skuId,
              queryColumnInfo: res.data.data,
              skuType: Number(skuType)
            })
          } else {
            app.showLoading(res.data.msg, "none");
          }
      })
      app.wxRequest("coreapi/core/v1/queryBuySkuPriceByParams",
        { skuId: skuId, skuType:1, couponId: couponId }, "POST", function (res) {
          if (res.data.code == 0) {
            that.setData({
              buy_price_str: res.data.data.buy_price_str
            })
          } else {
            app.showLoading(res.data.msg, "none");
          }
      })
    } else {
      app.wxRequest("coreapi/core/v1/querySkuInfo",
        { skuId: skuId }, "POST", function (res) {
          if (res.data.code == 0) {
            that.setData({
              skuId: skuId,
              queryColumnInfo: res.data.data
            })
          } else {
            app.showLoading(res.data.msg, "none");
          }
      })
      app.wxRequest("coreapi/core/v1/queryBuySkuPriceByParams",
        { skuId: skuId, skuType: 0, couponId: couponId }, "POST", function (res) {
          if (res.data.code == 0) {
            that.setData({
              buy_price_str: res.data.data.buy_price_str
            })
          } else {
            app.showLoading(res.data.msg, "none");
          }
      })
    }
  },

  onUnload: function () {
    var that = this;
    let uuids = uuid.create_UUID();//uid
    let pageCode = "1016"
    let beginTime = app.globalData.beginTime;//页面开始时间戳
    let endTime = Date.parse(new Date()) / 1000;//结束时间戳
    app.stopPageViewTime(uuids, pageCode, beginTime, endTime)
  },
  // 优惠卷
  goCuopon:function(){
    let skuId = this.data.skuId;
    let skuType = this.data.skuType;
    wx.navigateTo({
      url: '/subPages/personalPackage/pages/usecoupon/usecoupon?skuId=' + skuId + "&skuType=" + skuType,
    })
  },
  // 充值
  goRecharge: function () {
    wx.navigateTo({
      url: '/subPages/personalPackage/pages/account/account',
    })
  },
  // 购买
  bugCurseTap:function(){
    let skuId = this.data.skuId;
    let skuType = this.data.skuType;
    // SKU基础信息

    app.wxRequest("coreapi/core/v1/buySkuObject",
      { skuId: skuId, skuType: skuType}, "POST", function (res) {
        if (res.data.code == 0) {
          console.log(res);
          if (res.data.data.actionResult == 1 ){
            app.showLoading("购买成功","success");
            let isFristBuy = wx.getStorageSync("isFristBuy") || false;
            if ( isFristBuy ){
              setTimeout(function () {
                wx.navigateBack();
              }, 1000) 
            }else{
              wx.navigateTo({
                url: '/pages/commonPage/purchaseSuccess/purchaseSuccess'
              })
            }
            
            
          }else{
            app.showLoading("购买失败", "none");
          }
        } else {
          app.showLoading(res.data.msg, "none");
        }
    })
  },
})