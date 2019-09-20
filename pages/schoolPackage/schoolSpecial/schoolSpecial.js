var app = getApp();
Page({
  data: {
    allList:{},//全部数据
  },
  onLoad: function (options) {
    var that = this;
    let id = options.id;
    // 4.学院频道课程合辑SKU全部列表数据接口
    app.wxRequest("coreapi/core/v1/querySubjectSkuList",
      { subjectId: id },
      "POST", function (res) {
        that.setData({
          allList: res.data.data
        })
        // console.log(res.data.data)
    })
  },
  onReady: function () {

  },
  onShow: function () {

  },
})