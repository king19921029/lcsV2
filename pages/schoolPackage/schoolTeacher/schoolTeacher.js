var app = getApp();
const uuid = require('../../../utils/util.js');
Page({
  data: {
    //轮播配置
    swiperData: {
      indicatorDots: true,
      autoplay: true,
      interval: 5000,
      duration: 200,
    },
    topList:{},//顶部大咖
    horizontalList:{},//水平大咖
    horizontalListCount:0,//水平大咖数量
    teacherList:{},//教师列表
  },
  onLoad: function (options) {
    var that = this;
    // 1.banner
    app.wxRequest("coreapi/core/v1/queryCollegeTeacherAllList",
      {showType: options.showType }, "POST", function (res) {
        if (res.data.code == 0) {
          that.setData({
            topList: res.data.data.topList,
            horizontalList: res.data.data.horizontalList,
            horizontalListCount: res.data.data.horizontalListCount,
            teacherList: res.data.data.teacherList,
            teacherListCount: res.data.data.teacherListCount,
          })
          console.log(res.data.data);
        } else {
          app.showLoading(res.data.msg, "none");
        }
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
    let pageCode = "1011"
    let beginTime = app.globalData.beginTime;//页面开始时间戳
    let endTime = Date.parse(new Date()) / 1000;//结束时间戳
    app.stopPageViewTime(uuids, pageCode, beginTime, endTime)
  },
  // 去老师主页
  goTeacher: function (e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/subPages/societyPackage/pages/recommend_details/recommend_details?teacherId=' + id,
    })
  },

})