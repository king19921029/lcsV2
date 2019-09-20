var app = getApp();
Page({

  data: {
    userData:null,
  },
  onLoad: function (options) {

  },
  onShow: function () {
    var that = this;
   
    app.wxRequest('coreapi/core/v1/queryUserSignShareInfo',
    {}, 'POST', (res) => {
      if (res.data.code == 0) {
        console.log(res.data.data)
        that.setData({
          userData: res.data.data
        })
      }
    })
  },
  onHide: function () {
  },
  onShareAppMessage: function (res) {
    let that = this;
    if (res.from === 'button') {
      console.log(res.target)
    }
    return {
      title: '我是理财师APP,让理财师更专业',
      path: '/pages/school/school',
    }
  },
})