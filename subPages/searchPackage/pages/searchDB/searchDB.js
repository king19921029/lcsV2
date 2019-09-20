//logs.js
let app = getApp();
const uuid = require('util.js');
Page({
  data: {
    initSize:10,
    initSkip:0
  },
  lookDetails:function(e){
  	// console.log(e)
    let type = e.currentTarget.dataset.type;  //链接类型,0为课程,1为专栏,2文章,3活动
    let text = e.currentTarget.dataset.text;  //链接的ID或者网页
    let read = e.currentTarget.dataset.read;  //是否已读
    // console.log(type,text,read)
    if (type == 0) {
      // console.log(text)
      app.wxRequest("coreapi/core/v1/querySkuInfo",
        {
          skuId:text,       //课程id
          // skuId:"ea71c1bd-d8e0-11e8-9fff-00163e101f18"
        },
        "POST",function (res) {
          // console.log(res)
          if (res.data.code == 0) {
            
            if (res.data.data.is_buy == "0") {
              wx.navigateTo({
                url:"../../../../pages/commonPage/noBuyDetails/noBuyDetails?skuId="+text
              })
            }else{
              wx.navigateTo({
                url:"../../../../pages/commonPage/buyDetailsEnd/buyDetailsEnd?skuId="+text
              })
            }
            
          } else {
            app.showLoading(res.data.msg, "none");
          }
      })
    }else if(type == 1){
      app.wxRequest("coreapi/core/v1/queryColumnInfo",
        {
          skuId:text,       //课程id
          // skuId:"ea71c1bd-d8e0-11e8-9fff-00163e101f18"
        },
        "POST",function (res) {
          // console.log(res)
          if (res.data.code == 0) {
            
            if (res.data.data.is_buy == "0") {
              wx.navigateTo({
                url:"../../../../pages/webView/webView?url="+res.data.data.web_url
              })
            }else{
              wx.navigateTo({
                url:"../../../../pages/schoolPackage/schoolColumn/schoolColumn?id="+text
              })
            }
            
          } else {
            app.showLoading(res.data.msg, "none");
          }
      })
    }else if(type == 2){
      wx.navigateTo({
        url:"../../../societyPackage/pages/writings_details/writings_details?id="+text
      })
    }else if(type == 3){
      app.wxRequest("coreapi/core/v1/queryActivityWebInfo",
        { activityId: text }, "POST", function (res) {
        if (res.data.code == 0) {
          let web_url = res.data.data.web_url;
          let activity_id = res.data.data.activity_id;
          wx.navigateTo({
            url: '../webview/webview?url=' + web_url + "&activity_id=" + activity_id
          })
          // console.log(res.data)
        } else {
          app.showLoading(res.data.msg, "none");
        }
      })
    }
  },
  onLoad: function () {
    // 加载消息列表
    this.initNoticeList()

    // 更新消息为已读 全部
    this.initUpdateUserAllNoticeToRead()
  },
  initUpdateUserAllNoticeToRead:function(){
    app.wxRequest("coreapi/core/v1/updateUserAllNoticeToRead",
        {},
        "POST",function (res) {
          if (res.data.code == 0) {
            // console.log(res)
          } else {
            app.showLoading(res.data.msg, "none");
          }
      })
  },
  initNoticeList:function(){
    let that = this;
    let initSize = that.data.initSize;
    let initSkip = that.data.initSkip;
    app.isToken().then(
      app.wxRequest("coreapi/core/v1/queryUserNoticeList",
        {
          size:initSize,
          skip:initSkip
        },
        "POST",function (res) {
          if (res.data.code == 0) {
            // console.log(res)
            let NoticeList = res.data.data;
            that.setData({
              NoticeList:NoticeList
            })
          } else {
            app.showLoading(res.data.msg, "none");
          }
      })
    )
  },
  onReachBottom: function() {
    // Do something when page reach bottom.
    // console.log("触底")
    wx.showLoading({
      title: '加载中',
    })
    // console.log("触底")
    let that = this;
    let size = that.data.initSize;
    let skip = that.data.initSkip + that.data.initSize;
    app.wxRequest("coreapi/core/v1/queryUserNoticeList",
      {
        size:size,
        skip:skip
      },
      "POST",function (res) {
        if (res.data.code == 0) {
          // console.log(res)
          let _NoticeList = res.data.data;
          let NoticeList2 = that.data.NoticeList;
          if (_NoticeList.length <= 0 ) {
            wx.hideLoading()
            app.showLoading("没有更多数据了", "none");
            return
          }else{
            for (var i = 0; i < _NoticeList.length; i++) {
              NoticeList2.push(_NoticeList[i])
            }
            wx.hideLoading()
            that.setData({
              NoticeList:NoticeList2,
              initSkip:skip
            })
          }
        } else {
          app.showLoading(res.data.msg, "none");
        }
    })
  },
  onShow: function () {
    // 页面轨迹记录
    let viewTime = app.globalData.viewTime;
    app.onPageViewTime(viewTime)
  },
  onHide:function(){
    // 页面轨迹记录
    let uuids = uuid.create_UUID();//uid
    let pageCode = "4002";//页面CODE
    let beginTime = app.globalData.beginTime;//页面开始时间戳
    let endTime = Date.parse(new Date()) / 1000;//结束时间戳
    app.stopPageViewTime(uuids, pageCode, beginTime, endTime)
  },
  onUnload:function(){
    // 页面轨迹记录
    let uuids = uuid.create_UUID();//uid
    let pageCode = "4002";//页面CODE
    let beginTime = app.globalData.beginTime;//页面开始时间戳
    let endTime = Date.parse(new Date()) / 1000;//结束时间戳
    app.stopPageViewTime(uuids, pageCode, beginTime, endTime)
  },
})
