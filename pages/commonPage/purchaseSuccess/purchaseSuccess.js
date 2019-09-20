let app = getApp()
Page({
  data: {
    fontData:"加入计划"
  },
  onLoad: function (options) {
    
  },
  onReady: function () {
    
  },
  onShow: function () {
    
    let isFristBuy = wx.getStorageSync("isFristBuy") || false;
    if ( isFristBuy ){
      this.setData({
        fontData:"立即查看"
      })
    }

  },  
  onHide: function () {
    
  },
  go_dayCard:function(){
    if (this.data.fontData == "加入计划" ){
      wx.setStorageSync("isFristBuy", 1);
     
      app.wxRequest("coreapi/core/v1/sendUserPlanSign",
        { planTime: 10 }, "POST", function (res) {
          let data = res.data.data;
          if (res.data.code == 0) {

          } else {
            app.showLoading(res.data.msg, "none");
          }
      })
      this.onShow();
    }else{
      wx.navigateTo({
        url: '/pages/studyPackage/dayCard/dayCard'
      })
    }
    
  },
  ts_dayCard:function(){
    wx.navigateTo({
      url: '/pages/studyPackage/dayCard/dayCard'
    })
  },
  go_home:function(){
    wx.navigateBack({
      delta: 2
    });
  },
})