let app = getApp();
const uuid = require('util.js');
Page({
  data: {
    
  },
  onLoad: function (options) {
    this.initBuyHistory()
  },
  initBuyHistory:function(){
    let that = this;
    app.wxRequest("coreapi/core/v1/queryUserBuyOrderList",
      {
        size:"100",
        skip:"0"
      },
      "POST",function (res) {
        if (res.data.code == 0) {
          // console.log(res)
          let BuyOrderList = res.data.data;
          that.setData({
            BuyOrderList:BuyOrderList
          })
        } else {
          app.showLoading(res.data.msg, "none");
        }
    })
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
    let pageCode = "3010";//页面CODE
    let beginTime = app.globalData.beginTime;//页面开始时间戳
    let endTime = Date.parse(new Date()) / 1000;//结束时间戳
    app.stopPageViewTime(uuids, pageCode, beginTime, endTime)
  },
  onUnload:function(){
    // 页面轨迹记录
    let uuids = uuid.create_UUID();//uid
    let pageCode = "3010";//页面CODE
    let beginTime = app.globalData.beginTime;//页面开始时间戳
    let endTime = Date.parse(new Date()) / 1000;//结束时间戳
    app.stopPageViewTime(uuids, pageCode, beginTime, endTime)
  },
})