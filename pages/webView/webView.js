const uuid = require('../../utils/util.js');
var app = getApp();
Page({
  data: {
  
  },
  onLoad: function (options) {
    let url = options.url + "?isBuy=" + options.isBuy
    this.setData({
      url: url,
      skuId: options.skuId || null,
      activity_id: options.activity_id || null,
      isBuy: options.isBuy || null,
    })
  },
  onShow:function(){
    // pageViewTime
    let viewTime = app.globalData.viewTime;
    app.onPageViewTime(viewTime)
  },
  onUnload: function () {
    var that = this;
    wx.removeStorageSync("allList");
    // 活动id
    let activity_id = that.data.activity_id; 
    if (activity_id ){
      let uuids = uuid.create_UUID();//uid
      let pageCode = "1005";//页面CODE
      let beginTime = app.globalData.beginTime;//页面开始时间戳
      //结束时间戳
      let endTime = Date.parse(new Date()) / 1000;
      app.stopPageViewTime(uuids, pageCode, beginTime, endTime, activity_id, "8")
    }else{
      let skuId = that.data.skuId; 
      let uuids = uuid.create_UUID();//uid
      let pageCode = "1008";//页面CODE
      let beginTime = app.globalData.beginTime;//页面开始时间戳
      //结束时间戳
      let endTime = Date.parse(new Date()) / 1000; 
      app.stopPageViewTime(uuids, pageCode, beginTime, endTime, skuId, "2")
    }
    
  },
  onHide: function () {
    wx.removeStorageSync("allList");
  },
  Test: function (e) {
    var that = this;
    //接受h5页面传过来的参数
    var data = e.detail.data;
    console.log(data);
  },
})