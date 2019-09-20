const ctx = wx.createCanvasContext('firstCanvas')
const app = getApp();
const uuid = require('../../utils/util.js');
Page({
  data: {
    tpSrc:"/images/tp1.jpg",
    isFirstStatus: false,
    stateNow:"0",
    titleData:{},//顶部title
    titleActive:"",
    token: null,
    isMicPlay:false,
    isIpx:false
  },
  onLoad: function (options) {
    let isFirst = wx.getStorageSync("isFirst") ||{};
    this.setData({
      isFirstStatus: isFirst.studyStatus || false
    })
  },
  onShow: function () {
    var that = this;
    // 图谱类型
    let token = app.globalData.token;
    if (token) {
      app.wxRequest("coreapi/core/v1/queryKnowledgeGraphList",
        {}, "POST", function (res) {
          let data = res.data.data;
          if (res.data.code == 0) {
            that.setData({
              titleData: data,
              token: token,
              isIpx: app.globalData.isIpx,
            })
          } else {
            app.showLoading(res.data.msg, "none");
          }
        })
    }else{
      that.setData({
        isIpx: app.globalData.isIpx,
        token: null
      })
    }
    // pageViewTime
    let viewTime = app.globalData.viewTime;
    app.onPageViewTime(viewTime)
  },
  onHide: function () { 
  },
  title_tap:function(e){
    var that = this;
    let id = e.currentTarget.dataset.id;
    let width = e.currentTarget.dataset.width;
    let height = e.currentTarget.dataset.height;
    let title = e.currentTarget.dataset.title;
    wx.navigateTo({
      url: '../studyPackage/canvasTab/canvasTab?id=' + id + "&width=" + width + "&height=" + height + "&title=" + title,  
    })
   
  },
  go_login:function(){
   
    wx.navigateTo({
      url: '/subPages/loginPackage/pages/login/login'
    })
  },
  // 去音频播放页
  micGoDetails: function () {
    var that = this;
    let skuId = app.globalData.skuId;
    let cwId = app.globalData.cwId;
    wx.navigateTo({
      url: '/pages/commonPage/courseDetails/courseDetails?skuId=' + skuId + "&cwId=" + cwId + "&video_show=1"
    })
  },
  // 下一步
  nextTap:function(){
    let that = this;
    let tpSrc = that.data.tpSrc;
    if (tpSrc == "/images/tp2.jpg" ){
      let isFirst = wx.getStorageSync("isFirst");
      isFirst.studyStatus = true;
      wx.setStorageSync("isFirst", isFirst)
      that.setData({
        isFirstStatus:true
      })
    }else{
      that.setData({
        tpSrc: "/images/tp2.jpg"
      })
    }
    
  }
})