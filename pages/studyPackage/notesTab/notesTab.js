var app = getApp();
Page({
  data: {
    noteSkuList:{},
    token:"",
    isIpx:false
  },
  onLoad: function (options) {
    
  },
  onShow: function () {
    var that = this;
    let token = app.globalData.token;
    if( token ){
      app.wxRequest("coreapi/core/v1/queryUserHaveNoteSkuList",
        {}, "POST", function (res) {
          let data = res.data.data;
          if (res.data.code == 0) {
            that.setData({
              noteSkuList: res.data.data,
              token: token
            })
            console.log(res.data)
          } else {
            app.showLoading(res.data.msg, "none");
          }
        })
    }


    // console.log(app.globalData.isIpx)
    that.setData({
      isIpx:app.globalData.isIpx
    })
  
  },
  onHide: function () {

  },
  goNotesDetails:function(e){
    let skuId = e.currentTarget.dataset.id;
    // console.log(skuId);
    wx.navigateTo({
      url: '../notesDetails/notesDetails?skuId=' + skuId,
    })
  },
  go_login: function () {

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
})