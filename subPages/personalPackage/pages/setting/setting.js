let app = getApp();
const uuid = require('util.js');
const backgroundAudioManager = wx.getBackgroundAudioManager();
Page({
  data: {
    
  },
  to_userNumber:function(){
    wx.navigateTo({
      url:"../userNumber/userNumber"
    })
  },
  to_about:function(){
    wx.navigateTo({
      url:"../about/about"
    })
  },
  onLoad: function (options) {
    
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
    let pageCode = "3012";//页面CODE
    let beginTime = app.globalData.beginTime;//页面开始时间戳
    let endTime = Date.parse(new Date()) / 1000;//结束时间戳
    app.stopPageViewTime(uuids, pageCode, beginTime, endTime)
  },
  onUnload:function(){
    // 页面轨迹记录
    let uuids = uuid.create_UUID();//uid
    let pageCode = "3012";//页面CODE
    let beginTime = app.globalData.beginTime;//页面开始时间戳
    let endTime = Date.parse(new Date()) / 1000;//结束时间戳
    app.stopPageViewTime(uuids, pageCode, beginTime, endTime)
  },
  login_out:function(){
    app.globalData.token = null;
    app.globalData.openid = null;
    app.globalData.unionid = null;
    app.globalData.header["x-authorization"] = "";
    wx.removeStorageSync('token');
    app.globalData.isMicPlay = false;

    // 音频
    backgroundAudioManager.stop();

    // console.log(app.globalData.token)
    wx.reLaunch({
      url:'../../../../pages/school/school'
    })
  }
})