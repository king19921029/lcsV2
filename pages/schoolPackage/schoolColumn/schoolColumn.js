var app = getApp();
const uuid = require('../../../utils/util.js');
Page({
  data: {
    isBuy:"0",
    allList: {},//全部数据
    columnId:null,//专栏id
  },
  onLoad: function (options) {
    var that = this;
    let id = options.id;
    that.setData({
      columnId: id
    })
   
  },
  onShow: function () {
    var that = this;
    app.wxRequest("coreapi/core/v1/queryColumnInfo",
      { skuId: that.data.columnId }, "POST", function (res) {
        if (res.data.code == 0) {
          that.setData({
            allList: res.data.data,
          })
          wx.setNavigationBarTitle({
            title: res.data.data.title
          })
        } else {
          app.showLoading(res.data.msg, "none");
        }
    })
    // pageViewTime
    let viewTime = app.globalData.viewTime;
    app.onPageViewTime(viewTime)
  },
  onUnload: function () {
    var that = this;
    let uuids = uuid.create_UUID();//uid
    let pageCode = "1009";//页面CODE
    let beginTime = app.globalData.beginTime;//页面开始时间戳
    let endTime = Date.parse(new Date()) / 1000;//结束时间戳
    let columnId = that.data.columnId;
    app.stopPageViewTime(uuids, pageCode, beginTime, endTime, columnId, "2")
  },
  onHide: function () {
    var that = this;
    let uuids = uuid.create_UUID();//uid
    let pageCode = "1009";//页面CODE
    let beginTime = app.globalData.beginTime;//页面开始时间戳
    let endTime = Date.parse(new Date()) / 1000;//结束时间戳
    let columnId = that.data.columnId;
    app.stopPageViewTime(uuids, pageCode, beginTime, endTime, columnId, "2")
  },
  // 去详情
  goDetails:function(e){
    let skuId = e.currentTarget.dataset.skuid;
    var that = this;
    app.wxRequest("coreapi/core/v1/querySkuInfo",
      { skuId: skuId }, "POST", function (res) {
      
        if (res.data.code == 0 ) {
          wx.setStorageSync("skuInfo", res.data.data)
          if (res.data.data.is_buy == "0" ){
            wx.navigateTo({
              url: '/pages/commonPage/noBuyDetails/noBuyDetails?skuId=' + skuId
            })
          }else{
            wx.navigateTo({
              url: '/pages/commonPage/buyDetailsEnd/buyDetailsEnd?skuId=' + skuId
            })
          }
         
        } else {
          app.showLoading(res.data.msg, "none");
        }
    })
  },
  // 去购买
  goBug:function(e){
    var that = this;
    let skuId = that.data.allList.id;
    wx.navigateTo({
      url: '/pages/commonPage/buyCurse/buyCurse?skuId=' + skuId + "&skuType=1",
    })
  },
  // 去webview
  go_webview:function(){
    wx.navigateTo({
      url: '/pages/webView/webView?url=' + this.data.allList.xxc_web_url
    })
  },
})