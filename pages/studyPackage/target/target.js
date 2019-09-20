var app = getApp();
Page({

  data: {
    sliderValue:0,//滑动value
  },
  onLoad: function (options) {
    var that = this;
    // 获取用户已经设置的目标信息接口
    app.wxRequest("coreapi/core/v1/queryUserPlanStudyTimeInfo",
    {}, "POST", function (res) {
      let data = res.data.data;
      if (res.data.code == 0) {
        that.setData({
          sliderValue: data.plan_time || 0,
          planTime: data
        })
        console.log(res.data)
      } else {
        app.showLoading(res.data.msg, "none");
      }
    })
    // 5.获取其他用户定制的打卡目标列表接口
    app.wxRequest("coreapi/core/v1/queryOtherUserPlanTimeList",
    {}, "POST", function (res) {
      let data = res.data.data;
      if (res.data.code == 0) {
        that.setData({
          otherUserPlan: data
        })
        // console.log(res.data)
      } else {
        app.showLoading(res.data.msg, "none");
      }
    })
   
  },
  onShow: function () {

  },
  bindchange:function(e){
    console.log(e.detail.value)
    this.setData({
      sliderValue: e.detail.value
    })
  },
  //保存
  save_time:function(){
    var that = this;
    let planTime = that.data.sliderValue;
    if (planTime!= 0){
      app.wxRequest("coreapi/core/v1/sendUserPlanSign",
      { planTime: planTime }, "POST", function (res) {
        let data = res.data.data;
        if (res.data.code == 0) {
          console.log(res.data)
          wx.navigateBack();
        } else {
          app.showLoading(res.data.msg, "none");
        }
      })
    }else{
      app.showLoading("请设置目标","none")
    }
    
  },
})