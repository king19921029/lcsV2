var app = getApp();
const backgroundAudioManager = wx.getBackgroundAudioManager();
const uuid = require('../../../utils/util.js');
Page({
  data: {
    isShow:false,
    allSkuList:{},//全部列表
    bannerData:{},//banner数据
    //轮播配置
    swiperData: {
      indicatorDots: true,
      autoplay: true,
      interval: 5000,
      duration: 200,
    },
  },
  onLoad: function (options) {
    var that = this;
    // 10推荐信息
    app.wxRequest("coreapi/core/v1/queryCollegeNewAllSkuList",
      { showType: options.showType, skip: 0, size:4},
      "POST", function (res) {
        let allSkuList = res.data.data.allSkuList;
        for (var i = 0; i < allSkuList.length;i++ ){
          allSkuList[i].isShow = false
          allSkuList[i].id = i
          console.log(allSkuList[i])
        }
        
        if (res.data.code == 0) {
          that.setData({
            allSkuList: allSkuList,
            bannerData: res.data.data.recommendSkuList
          })
        } else {
          app.showLoading(res.data.msg, "none");
        }
        console.log(that.data.allSkuList)
    })
  },
  onShow: function () {
    // pageViewTime
    let viewTime = app.globalData.viewTime;
    app.onPageViewTime(viewTime)
  },
  onUnload: function () {
    var that = this;
    let uuids = uuid.create_UUID();//uid
    let pageCode = "1012"
    let beginTime = app.globalData.beginTime;//页面开始时间戳
    let endTime = Date.parse(new Date()) / 1000;//结束时间戳
    app.stopPageViewTime(uuids, pageCode, beginTime, endTime)
  },
  onReady:function(){
    this.nav = this.selectComponent("#nav");
  },
  showMenuTap:function(e){
    var that = this;
    let id = e.currentTarget.dataset.id;
    let allSkuList = that.data.allSkuList;
    for (var i = 0; i < allSkuList.length;i++ ){
      if (allSkuList[i].id == id ){
        allSkuList[i].isShow = !allSkuList[i].isShow
      }
    }
    that.setData({
      allSkuList: allSkuList
    })
  },
  goDetails:function(e){
    let skuId = e.currentTarget.dataset.skuid;
    let cwId = e.currentTarget.dataset.cwid;
    let isbuy = e.currentTarget.dataset.isbuy;
    if( cwId ){
      if (isbuy == "1") {
        app.wxRequest("coreapi/core/v1/querySkuCwDetailInfo",
          { skuId: skuId, cwId: cwId }, "POST", function (res) {
            if (res.data.code == 0) {
              backgroundAudioManager.stop();
              wx.navigateTo({
                url: '/pages/commonPage/courseDetails/courseDetails?skuId=' + skuId + "&cwId=" + cwId + "&history_play_time=" + res.data.data.history_play_time
              })

            } else {
              app.showLoading(res.data.msg, "none");
            }
          })
      } else {
        wx.navigateTo({
          url: '/pages/commonPage/noBuyDetails/noBuyDetails?skuId=' + skuId
        })
      }
    }else{
      app.wxRequest("coreapi/core/v1/querySkuInfo",
      { skuId: skuId }, "POST", function (res) {
          if (res.data.code == 0) {
            wx.setStorageSync("shuInfo", res.data.data)
            if (res.data.data.is_buy == "0") {
              wx.navigateTo({
                url: '/pages/commonPage/noBuyDetails/noBuyDetails?skuId=' + skuId
              })
            } else {
              wx.navigateTo({
                url: '/pages/commonPage/buyDetailsEnd/buyDetailsEnd?skuId=' + skuId
              })
            }

          } else {
            app.showLoading(res.data.msg, "none");
          }
      })
    }
    
  },
})