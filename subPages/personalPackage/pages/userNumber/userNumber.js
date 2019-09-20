let app = getApp()
Page({
  data: {
    
  },
  to_revise:function(){
    wx.navigateTo({
      url:'../../../loginPackage/pages/forget/forget?revise=1'
    })
  },
  onLoad: function (options) {
    
  },
  onReady: function () {
    
  },
  onShow: function () {
    let that = this;
    // app.isToken().then(
      app.wxRequest("coreapi/user/v1/getuserinfo",
        { },
        "POST",function (res) {
          if (res.data.code == 0) {
            // console.log(res)
            let fullPhone = res.data.data.phone;

            let phone = fullPhone.substr(0,3)+'****'+fullPhone.substr(7,11)
            // console.log(phone)
            that.setData({
              phone:phone
            })
          } else {
            // console.log(res)
            app.showLoading(res.data.msg, "none");
          }
      })
    // )
  },
  onHide: function () {
    
  },
  changePhone:function(){
    wx.navigateTo({
      url:'../changePhone/changePhone'
    })
  }
})