var app = getApp();
var wxCharts = require('../../../utils/wxcharts-min.js');
Page({
  data: {
    studyTab:true,//今日学习切换
    studyContrast: {}, //今日学习对比
    skuList:{},//在线课程
    dayTime: {},//七日学习信息
    token:"",
    isIpx:false,
    isAll:true,
    initFont:"今日学习"
  },
  onLoad: function (options) {

  },
  onShow: function () { 
    var that = this;
    let token = app.globalData.token;
    if (token){
      that.setData({
        token: token
      })
      that.initData();
    }
    // console.log(app.globalData.isIpx)
    that.setData({
      isIpx:app.globalData.isIpx,
      windowSize: app.globalData.windowSize
    })
    
  },
  // 初始化数据
  initData(){
    var that = this;

    // 5.获取课桌今日学习对比列表信息接口
    app.wxRequest("coreapi/core/v1/queryUserTodayStudyContrast",
      {}, "POST", function (res) {
        let data = res.data.data;
        if (res.data.code == 0) {
          that.setData({
            studyContrast: res.data.data,
          })
        } else {
          app.showLoading(res.data.msg, "none");
        }
    })


    // 6.获取课桌在学课程列表信息接口
    app.wxRequest("coreapi/core/v1/queryUserLearningSkuList",
      {}, "POST", function (res) {
        let data = res.data.data;
        if (res.data.code == 0) {
          that.setData({
            skuList: res.data.data,
          })
        } else {
          app.showLoading(res.data.msg, "none");
        }
    })


    // 7.获取课桌七日学习信息接口
    app.wxRequest("coreapi/core/v1/queryUserNearly7DayStudyList",
      {}, "POST", function (res) {
        let data = res.data.data;
        if (res.data.code == 0) {
          that.setData({
            dayTime: res.data.data,
            total_time: res.data.data.total_time
          })
          // console.log(res.data.data)
        } else {
          app.showLoading(res.data.msg, "none");
        }
    })

  },
  // 初始化图表
  initCanvas(dayTime){
    var that = this;
    var echartTime = []
    var echartdate = [];
    let windowSize = that.data.windowSize;
    if (dayTime.length > 1){
      for (var i = 0; i < dayTime.length; i++) {
        echartTime.push(dayTime[i].dayTime)
        echartdate.push(dayTime[i].studyTime)
      }
      new wxCharts({
        canvasId: 'columnCanvas',
        type: 'column',
        categories: echartTime,
        series: [{
          data: echartdate,
          format: function (val) {
            return val + '分钟';
          },
          color: '#415160',
        }],
        yAxis: {
          gridColor: "#fff",
          disabled: true,
          splitLine: {
            show: false
          }
        },
        xAxis: {
          disableGrid: true,
          splitLine: {
            show: false
          }
        },
        width: windowSize.windowWidth - 50, 
        height: windowSize.windowWidth / 1.5,
        legend: false, // 是否显示图表下方各类别的标识
        dataLabel: true, // 是否在图表中显示数据内容值
        extra: {
          column: {
            width: 15 // 柱状图每项的图形宽度，单位为px
          }
        }
      });
    }
    
  },
  initfontTap:function(){
    var that = this;
    that.setData({
      isAll: !that.data.isAll
    })
  },
  // 今日学习切换
  todayTap: function () {
    var that = this;
    that.setData({
      isAll: !that.data.isAll,
      initFont: "今日学习"
    })
  },
  //七日学习切换
  sevendayTap:function(){
    var that = this;
    that.setData({
      isAll: !that.data.isAll,
      initFont: "七日学习"
    })
    
    // 7.获取课桌七日学习信息接口
    app.wxRequest("coreapi/core/v1/queryUserNearly7DayStudyList",
      {}, "POST", function (res) {
        let data = res.data.data;
        if (res.data.code == 0) {
          that.setData({
            dayTime: res.data.data.study_list,
          })
          that.initCanvas(res.data.data.study_list);
          console.log(res.data.data)
        } else {
          app.showLoading(res.data.msg, "none");
        }
    })
    
  },
  // 学习统计
  statisticsTap:function(){
    wx.navigateTo({
      url: '../statisticsTab/statisticsTab',
    })
  },
  // 课程详情
  curseDetails:function(e){
    let skuId = e.currentTarget.dataset.skuid;
    let skuType = e.currentTarget.dataset.skutype;
    if ( skuType == "0" ){
      wx.navigateTo({
        url: '/pages/commonPage/buyDetailsEnd/buyDetailsEnd?skuId=' + skuId,
      })
    }else{
      wx.navigateTo({
        url: '/pages/schoolPackage/schoolColumn/schoolColumn?id=' + skuId,
      })
    }
   
  },
  go_login: function () {
    wx.navigateTo({
      url: '/subPages/loginPackage/pages/login/login'
    })
  },
  go_home:function(){
    wx.redirectTo({
      url: '/pages/school/school',
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
  go_time:function(){
    wx.navigateTo({
      url: '/pages/studyPackage/dayCard/dayCard',
    })
  }
})