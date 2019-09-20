var app = getApp();
Page({
  data: {
    arr: [],
    sysW: null,
    lastDay: null,
    firstDay: null,
    weekArr: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    year: null
  },

  //获取日历相关参数
  dataTime: function (year, month, months) {
    var that = this;
    //第一天星期几
    let firstDay = new Date(year, month, 1);
    console.log("星期:" + firstDay.getDay())

    app.wxRequest("coreapi/core/v1/queryUserForMonthSignList",
      { year: year, month: months}, "POST", function (res) {
      let data = res.data.data;
      if (res.data.code == 0) {
        for (var j = 0; j < firstDay.getDay();j++ ){
          let obj = {}
          obj.num = "idx";
          data.unshift(obj) 
        }
        that.setData({
          year: year,
          month: months,
          arr: data,
        });
        // console.log(res.data)
      } else {
        app.showLoading(res.data.msg, "none");
      }
    })

  },
  onLoad: function (options) {
    
  },
  onShow:function(){
    var that = this;
    //当前日期
    var date = new Date();
    //获取现今年份
    var year = date.getFullYear();
    //获取现今月份
    var month = date.getMonth();
    //获取现今月份
    var months = date.getMonth() + 1;
    // 获取日历
    that.dataTime(year, month, months);

    app.wxRequest("coreapi/core/v1/queryUserSignDetailInfo",
    {}, "POST", function (res) {
      let data = res.data.data;
      if (res.data.code == 0) {
        that.setData({
          detailInfo: data
        })
        console.log(res.data.data)
      } else {
        app.showLoading(res.data.msg, "none");
      }
    })

  },
  // 上月
  _next: function () {
    var that = this;
    let cuntMonth = that.data.month - 1;
    let year = that.data.year;
    // 当前日期
    var date = new Date();

    if (cuntMonth == 0) {
      let newYear = year - 1;
      //获取现今月份
      let month = 0;
      let months = 12;

      console.log("获取月份:" + month);
      console.log("正常月份:" + months)

      // 获取日历
      that.dataTime(newYear, month, months);

    } else {
      let year = that.data.year;
      let month = cuntMonth - 1; 
      let months = cuntMonth;

      // 获取日历
      that.dataTime(year, month, months);
      
    }
  },
  _last: function () {
    var that = this;
    let cuntMonth = that.data.month + 1;
    let year = that.data.year;
    // 当前日期
    var date = new Date();
    if (cuntMonth == 13) {
      let newYear = year + 1;
      //获取现今月份
      var month = 0;
      let months = 1;

      // 获取日历
      that.dataTime(newYear, month, months);

    } else {
      let year = that.data.year;
      let month = cuntMonth - 1;
      let months = cuntMonth;
      // 获取日历
      that.dataTime(year, month, months);
    }
  },
  // 去分享
  go_share:function(){
    wx.navigateTo({
      url: '/pages/studyPackage/sharePage/sharePage',
    })
  },
  go_time:function(){
    wx.navigateTo({
      url: '../target/target'
    })
  }
})