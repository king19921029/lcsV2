var app = getApp();
Page({
  data: {
    allList: {},//全部数据
  },
  onLoad: function (options) {
    var that = this;
    let id = options.id;
    // 4.学院频道课程合辑SKU全部列表数据接口
    app.wxRequest("coreapi/core/v1/queryTeacherAllSkuList",
      { 
        teacherId: id,
        size:50,
        skip:0
      },
      "POST", function (res) {
        that.setData({
          allList: res.data.data
        })
        console.log(res.data.data)
      })
  },
  onReady: function () {
  },
  onShow: function () {
  },
  // 去详情
  goDetails: function (e) {
    let skuId = e.currentTarget.dataset.skuid;
    var that = this;
    app.wxRequest("coreapi/core/v1/querySkuInfo",
      { skuId: skuId }, "POST", function (res) {
        
        if (res.data.code == 0) {
          wx.setStorageSync("skuInfo", res.data.data)
          console.log(res.data.data)
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
  },
  // 去专栏
  goSpecial: function (e) {
    var that = this;
    let skuId = e.currentTarget.dataset.skuid;
    app.wxRequest("coreapi/core/v1/queryColumnInfo",
      { skuId: skuId }, "POST", function (res) {

        if (res.data.code == 0) {
          if (res.data.data.is_buy == "1") {
            wx.navigateTo({
              url: '/pages/schoolPackage/schoolColumn/schoolColumn?id=' + skuId,
            })
          } else {
            wx.navigateTo({
              url: '/pages/webView/webView?url=' + res.data.data.web_url,
            })
          }

        } else {
          app.showLoading(res.data.msg, "none");
        }
      })

  },
})