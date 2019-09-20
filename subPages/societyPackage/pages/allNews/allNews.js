//logs.js
let app = getApp()
Page({
  data: {
    // isSearch: false
  },
  onLoad: function (options) {
  	let teacherId = options.teacherId;
    this.initTeacherNewsList(teacherId)
  },
  initTeacherNewsList:function(teacherId){
    let that = this;
    app.wxRequest("coreapi/core/v1/queryTeacherNewsList",
      {
        teacherId:teacherId,
        size:"30",
        skip:"0"
      },
      "POST",function (res) {
        if (res.data.code == 0) {
          // console.log("大咖文章列表信息"+res)
          let TeacherNewsList = res.data.data;
          that.setData({
            TeacherNewsList:TeacherNewsList
          })
        } else {
          app.showLoading(res.data.msg, "none");
        }
    })
  },
  to_writing:function(e){
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url:'../writings_details/writings_details?id='+id
    })
  },
})
