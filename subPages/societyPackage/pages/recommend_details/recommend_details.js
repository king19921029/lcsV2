let app = getApp();
const backgroundAudioManager = wx.getBackgroundAudioManager();
const innerAudioContext = wx.createInnerAudioContext();
const uuid = require('util.js');
Page({
  data: {
    isFollow:false,
    voiceAnimationStatus: -1,
    size:10,   //当前页显示条数
    skip:0,    //起始页码
    reportBox:false   //举报弹框
  },
  // 音频播放
  paly_ly: function (e) {
    const that = this;
    let isPaly = that.data.isPaly;
    let audio_id = e.currentTarget.dataset.audioid
    let idx = e.currentTarget.dataset.idx

    if (isPaly && idx == that.data.voiceAnimationStatus  ){
      innerAudioContext.stop()
      that.setData({
        voiceAnimationStatus: -1,
        isPaly:false
      })
    }else{

      that.setData({
        voiceAnimationStatus: idx,
        isPaly: true
      })
      app.getMicUrl(audio_id, innerAudioContext)
      backgroundAudioManager.pause();
    }
  },
  // 点击查看图片单图
  // 点击查看图片多图
  previewImage:function(e){
    let url = e.currentTarget.dataset.url;
    wx.previewImage({
        urls: [url] // 需要预览的图片http链接列表
    })
  },
  previewImage2:function(e){
    var that = this;
    let arr = [];
    let url = e.currentTarget.dataset.url;
    let url2 = e.currentTarget.dataset.url2;
    let url3 = e.currentTarget.dataset.url3;
    let idx = e.currentTarget.dataset.idx

    if (url3){
      arr.push(url);
      arr.push(url2)
      arr.push(url3)
    }else{
      arr.push(url);
      arr.push(url2)
    }

    innerAudioContext.stop()
    that.setData({
      voiceAnimationStatus: -1,
      isPaly: false
    })
    wx.previewImage({
      current: arr[idx], // 当前显示图片的http链接
      urls: arr // 需要预览的图片http链接列表
    })
  },
  look_more_sku:function(){
    let teacherId = this.data.teacherId;
    wx.navigateTo({
      url:'../moreList/moreList?id='+teacherId
    })
  },
  to_kecheng_detail:function(e){
    // 先判断是否购买过该课程
    let that = this;
    let sku_id = e.currentTarget.dataset.skuid;
    // console.log(sku_id)
    app.wxRequest("coreapi/core/v1/querySkuInfo",
      {
        skuId:sku_id,       //课程id
      },
      "POST",function (res) {
        if (res.data.code == 0) {
          wx.setStorageSync("skuInfo", res.data.data)
          // console.log(res.data.data.is_buy)
          if (res.data.data.is_buy == "0") {
            wx.navigateTo({
              url:"../../../../pages/commonPage/noBuyDetails/noBuyDetails?skuId="+sku_id
            })
          }else{
            wx.navigateTo({
              url:"../../../../pages/commonPage/buyDetailsEnd/buyDetailsEnd?skuId="+sku_id
            })
          }
          
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
  onLoad: function (options) {
    // wx.hideShareMenu();
    // console.log("隐藏了当前页面的转发按钮");
    let teacherId = options.teacherId;
    // console.log(teacherId)
    let size = this.data.size;
    let skip = this.data.skip;
    this.setData({
      teacherId:teacherId
    })
    // 初始化大师主页基本信息
    this.initTeacherIndexInfo(teacherId)

    // 初始化大师推荐列表信息
    this.initTeacherRecommendSkuList(teacherId)

    // 初始化大咖文章列表信息
    this.initTeacherNewsList(teacherId)

    // 初始化大咖动态列表信息
    this.initTeacherRecordList(teacherId,size,skip)
  },
  onReady: function () {
    
  },
  onShow: function () {
    let that = this;
    // 监听录音播放时
    innerAudioContext.onPlay(function(){
      // console.log('语音播放')
      // that.setData({
      //   voiceAnimation: true
      // })
    })

    innerAudioContext.onStop(function(){
      // console.log("手动停止")
      that.setData({
        voiceAnimationStatus: -1,
        isPaly:false
      })
      backgroundAudioManager.play();
    })

    // 监听录音播放完成时
    innerAudioContext.onEnded(() => {
      // console.log('语音停止播放')
      that.setData({
        voiceAnimationStatus: -1,
        isPaly:false
      })

      backgroundAudioManager.play();
    })

    // 页面轨迹记录
    let viewTime = app.globalData.viewTime;
    app.onPageViewTime(viewTime)
  },
  onHide:function(){
    // 页面轨迹记录
    let uuids = uuid.create_UUID();//uid
    let pageCode = "3015";//页面CODE
    let beginTime = app.globalData.beginTime;//页面开始时间戳
    let endTime = Date.parse(new Date()) / 1000;//结束时间戳
    let objId = this.data.teacherId;
    let objType = 6;
    app.stopPageViewTime(uuids, pageCode, beginTime, endTime, objId, objType)
  },
  onUnload:function(){
    // 页面轨迹记录
    let uuids = uuid.create_UUID();//uid
    let pageCode = "3015";//页面CODE
    let beginTime = app.globalData.beginTime;//页面开始时间戳
    let endTime = Date.parse(new Date()) / 1000;//结束时间戳
    let objId = this.data.teacherId;
    let objType = 6;
    app.stopPageViewTime(uuids, pageCode, beginTime, endTime, objId, objType)
  },
  downText:function(e){
    let that = this;
    let index = e.currentTarget.dataset.index;
    let TeacherRecordList = that.data.TeacherRecordList;
    if (TeacherRecordList[index].isShow == true) {
      TeacherRecordList[index].isShow = false
    }else{
      TeacherRecordList[index].isShow = true
    }
  

    that.setData({
      TeacherRecordList:TeacherRecordList
    })
  },
  // 初始化大咖主页基本信息
  initTeacherIndexInfo:function(teacherId){
    let that = this;
    // app.isToken().then(
      app.wxRequest("coreapi/core/v1/queryTeacherIndexInfo",
        {
          teacherId:teacherId
        },
        "POST",function (res) {
          if (res.data.code == 0) {
            // console.log(res)
            let _TeacherIndexInfo = res.data.data;
            that.setData({
              TeacherIndexInfo:_TeacherIndexInfo
            })

            if (_TeacherIndexInfo.is_follow == "0") {
              that.setData({
                isFollow:true
              })
            }else{
              that.setData({
                isFollow:false
              })
            }
          } else {
            app.showLoading(res.data.msg, "none");
          }
      })
    // )
  },
  // 初始化大咖推荐列表信息
  initTeacherRecommendSkuList:function(teacherId){
    let that = this;
    app.wxRequest("coreapi/core/v1/queryTeacherRecommendSkuList",
      {
        teacherId:teacherId
      },
      "POST",function (res) {
        if (res.data.code == 0) {
          // console.log(res)
          let TeacherRecommendSkuList = res.data.data;
          that.setData({
            TeacherRecommendSkuList:TeacherRecommendSkuList
          })
        } else {
          app.showLoading(res.data.msg, "none");
        }
    })
  },
  // 初始化大咖文章列表信息
  initTeacherNewsList:function(teacherId){
    let that = this;
    app.wxRequest("coreapi/core/v1/queryTeacherNewsList",
      {
        teacherId:teacherId,
        size:"10",
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
  // 初始化大咖动态列表信息
  initTeacherRecordList:function(teacherId,size,skip){
    let that = this;
    app.wxRequest("coreapi/core/v1/queryTeacherRecordList",
      {
        teacherId:teacherId,
        size:size,
        skip:skip
      },
      "POST",function (res) {
        if (res.data.code == 0) {
          // console.log(res)
          let TeacherRecordList = res.data.data;
          for (var i = 0; i < TeacherRecordList.length; i++) {
            TeacherRecordList[i].isShow = false;
          }
          that.setData({
            TeacherRecordList:TeacherRecordList
          })
        } else {
          app.showLoading(res.data.msg, "none");
        }
    })
  },
  // 关注
  follow:function(){
    let that = this;
    let id = that.data.teacherId;
    let token = app.globalData.token;
    if (token) {
      app.wxRequest("coreapi/core/v1/sendUserFollow",
        {
          fId:id,           //老师或者用户的id
          fType:"1",       //用户类型，0用户，1老师
        },
        "POST",function (res) {
          if (res.data.code == 0) {
            // console.log(res)
            let _Follow = res.data.data;
            if (_Follow.actionResult == "1") {
              // 关注成功
              that.setData({
                isFollow:false
              })
              app.showLoading("关注成功", "none");
              // 初始化大师主页基本信息
              that.initTeacherIndexInfo(that.data.teacherId)
            }else{
              // 关注失败
            }
          } else {
            app.showLoading(res.data.msg, "none");
          }
      })
    }else{
      wx.navigateTo({
        url:"../../../loginPackage/pages/login/login"
      })
    }
  },
  // 取消关注
  cancelFollow:function(){
    let that = this;
    let id = that.data.teacherId;
    // console.log(id)
    app.isToken().then(
      app.wxRequest("coreapi/core/v1/cancelUserFollow",
        {
          fId:id,           //老师或者用户的id
          fType:"1",       //用户类型，0用户，1老师
        },
        "POST",function (res) {
          if (res.data.code == 0) {
            // console.log(res)
            let _Follow = res.data.data;
            if (_Follow.actionResult == "1") {
              // 取消关注成功
              that.setData({
                isFollow:true
              })
              app.showLoading("已取消关注", "none");
              // 初始化大师主页基本信息
              that.initTeacherIndexInfo(that.data.teacherId)
            }else{
              // 取消关注失败
            }
          } else {
            app.showLoading(res.data.msg, "none");
          }
      })
    )
  },
  // 转载
  addNotes:function(e){
    var that = this;
    let linkId = e.currentTarget.dataset.linkid;
    let linkType = e.currentTarget.dataset.type;
    let token = app.globalData.token;
    if (token) {
      app.wxRequest('coreapi/core/v1/addUserNote',
      { linkId: linkId, linkType:linkType }, 'POST', function (res) {
        if (res.data.code == 0) {
          if (res.data.data.actionResult == "1") {
            // console.log(res.data.data)
            app.showLoading("转载成功", "none")
          }else{
            app.showLoading("转载失败", "none")
          }
        } else {
          app.showLoading(res.data.msg, "none")
        }
      })
    }else{
      wx.navigateTo({
        url:"../../../loginPackage/pages/login/login"
      })
    }
  },
  onReachBottom: function() {
    // Do something when page reach bottom.
    // console.log("触底")
    wx.showLoading({
      title: '加载中',
    })
    let that = this;
    let teacherId = that.data.teacherId;
    let size = that.data.size;
    let skip = that.data.skip + that.data.size;

    app.wxRequest("coreapi/core/v1/queryTeacherRecordList",
      {
        teacherId:teacherId,
        size:size,
        skip:skip
      },
      "POST",function (res) {
        if (res.data.code == 0) {
          let recordList = res.data.data;
          let TeacherRecordList = that.data.TeacherRecordList;

          if (recordList.length <= 0 ) {
            app.showLoading("没有更多数据了", "none");
            return
          }else{
            for (var i = 0; i < recordList.length; i++) {
              recordList[i].isShow = false;
              TeacherRecordList.push(recordList[i])
            }
            wx.hideLoading()
            // console.log(TeacherRecordList)
            that.setData({
              TeacherRecordList:TeacherRecordList,
              skip:skip
            })
          }
        } else {
          app.showLoading(res.data.msg, "none");
        }
    })
  },
  // 举报弹框
  report:function(e){
    // let id = e;
    // console.log(e)
    // console.log(e.currentTarget.dataset.id)
    this.setData({
      reportBox:true,
      clickNoteId:e.currentTarget.dataset.id
    })
  },
  // 举报按钮
  sendReport:function(){
    let that = this;
    app.wxRequest("coreapi/core/v1/sendReport",
      {
        userNoteId:that.data.clickNoteId
      },
      "POST",function (res) {
        if (res.data.code == 0) {
          if (res.data.data.actionResult == 1) {
            app.showLoading("举报成功", "none");
            that.setData({
              reportBox:false
            })
          }
        } else {
          app.showLoading(res.data.msg, "none");
        }
    })
  },
  // 取消举报
  backReport:function(){
    this.setData({
      reportBox:false
    })
  },
  onShareAppMessage: function (res) {
    console.log(res)
    let that = this;

    if (res.from === 'button') {
      // 来自页面内转发按钮
      // console.log(res.target)
      if (res.target.dataset.kc) {
        return {
          title: "《"+res.target.dataset.kc+"》让我深有感悟,分享给你我的笔记，我们一起学习进步~",
          path: '/pages/school/school'
        }
      }else{
        return {
          // title: "普通分享",
          path: '/pages/school/school'
        }
      }
    }else if(res.from === 'menu'){
      return {
        // title: "普通分享",
        path: '/pages/school/school'
      }
    }
  },
  to_allNews:function(){
    let teacherId = this.data.teacherId;
    wx.navigateTo({
      url:"../allNews/allNews?teacherId="+teacherId
    })
  }
})