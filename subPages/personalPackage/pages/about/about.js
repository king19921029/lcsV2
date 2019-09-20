let app = getApp()
Page({
  data: {
    
  },
  to_protocol:function(){
    wx.navigateTo({
      url:"../protocol/protocol"
    })
  },
  onLoad: function (options) {
    // app.wxRequest("coreapi/sku/v1/getAppProtocol",
    //   {},
    //   "POST",function (res) {
    //     if (res.data.code == 0) {
    //       console.log(res)
    //     } else {
    //       app.showLoading(res.data.msg, "none");
    //     }
    // })
  },
  onReady: function () {
    
  },
  onShow: function () {
    
  },
  onHide: function () {
    
  },
  to_protocal:function(){
    wx.navigateTo({
      url:"../protocol/protocol"
    })
  }
})