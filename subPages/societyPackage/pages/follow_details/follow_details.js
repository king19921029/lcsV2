let app = getApp();
const backgroundAudioManager = wx.getBackgroundAudioManager();
const innerAudioContext = wx.createInnerAudioContext();
const uuid = require('util.js');
Page({
  data: {
    audioIsPlay:false,
    type:1,
    src: 'http://ws.stream.qqmusic.qq.com/M500001VfvsJ21xFqb.mp3?guid=ffffffff82def4af4b12b3cd9337d5e7&uin=346897220&vkey=6292F51E1E384E06DCBDC9AB7C49FD713D632D313AC4858BACB8DDD29067D3C601481D36E62053BF8DFEAF74C0A5CCFADD6471160CAF3E6A&fromtag=46',
    isFollow:false,
    voiceAnimationStatus: -1,
    size:10,   //当前页显示条数
    skip:0,    //起始页码
    isPaly:false,
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
  previewImage:function(e){
    let url = e.currentTarget.dataset.url;
    wx.previewImage({
        urls: [url] // 需要预览的图片http链接列表
    })
  },
  // 点击查看图片多图
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
  to_follow_detail:function(e){
    let id = e.currentTarget.dataset.id;
    // console.log(id)
    wx.navigateTo({
      url:'../recommend_details/recommend_details?teacherId='+id
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
  to_writing:function(){
    wx.navigateTo({
      url:'../kecheng_details/kecheng_details'
    })
  },
  onLoad: function (options) {
    // wx.hideShareMenu();
    // console.log("隐藏了当前页面的转发按钮");
    let size = this.data.size;
    let skip = this.data.skip;
    let viewUserId = options.viewUserId;
    this.setData({
      viewUserId:viewUserId
    })

    // 初始化用户基本信息
    this.initUserIndexInfo(viewUserId)

    // 初始化关注导师
    this.initUserFollowTeacherList(viewUserId)

    // 初始化用户最近在学
    this.initUserNearlyStudySkuList(viewUserId)

    // 初始化用户笔记
    this.initUserIndexNoteList(viewUserId,size,skip)
  },
  onReady: function (e) {
    // 使用 wx.createAudioContext 获取 audio 上下文 context
    this.audioCtx = wx.createAudioContext('myAudio')
  },
  audioPlay: function () {
    let that = this;
    let audioIsPlay = that.data.audioIsPlay;
    if (audioIsPlay == false) {
      that.audioCtx.play()
      that.setData({
        audioIsPlay:!audioIsPlay
      })
    }else{
      that.audioCtx.seek(0)
      that.audioCtx.pause()
      that.setData({
        audioIsPlay:!audioIsPlay
      })
    }
  },
  audioPause: function () {
    this.audioCtx.pause()
  },
  onShow: function () {
    let that = this;
    that.setData({
      userId: app.globalData.userId
    })
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
    let pageCode = "3016";//页面CODE
    let beginTime = app.globalData.beginTime;//页面开始时间戳
    let endTime = Date.parse(new Date()) / 1000;//结束时间戳
    let objId = this.data.viewUserId;
    let objType = 5;
    app.stopPageViewTime(uuids, pageCode, beginTime, endTime, objId, objType)
  },
  onUnload:function(){
    // 页面轨迹记录
    let uuids = uuid.create_UUID();//uid
    let pageCode = "3016";//页面CODE
    let beginTime = app.globalData.beginTime;//页面开始时间戳
    let endTime = Date.parse(new Date()) / 1000;//结束时间戳
    let objId = this.data.viewUserId;
    let objType = 5;
    app.stopPageViewTime(uuids, pageCode, beginTime, endTime, objId, objType)
    innerAudioContext.stop()
  },
  // 初始化基本信息
  initUserIndexInfo:function(viewUserId){
    let that = this;
    app.wxRequest("coreapi/core/v1/queryUserIndexInfo",
      {
        viewUserId:viewUserId
      },
      "POST",function (res) {
        if (res.data.code == 0) {
          // console.log(res)
          let UserIndexInfo = res.data.data;
          that.setData({
            UserIndexInfo:UserIndexInfo
          })


          if (UserIndexInfo.is_follow == "0") {
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
  },
  // 初始化关注导师
  initUserFollowTeacherList:function(viewUserId){
    let that = this;
    app.wxRequest("coreapi/core/v1/queryUserFollowTeacherList",
      {
        size:"10",
        skip:"0",
        viewUserId:viewUserId
      },
      "POST",function (res) {
        if (res.data.code == 0) {
          // console.log(res)
          let UserFollowTeacherList = res.data.data;
          that.setData({
            UserFollowTeacherList:UserFollowTeacherList
          })
        } else {
          app.showLoading(res.data.msg, "none");
        }
    })
  },
  // 初始化最近在学
  initUserNearlyStudySkuList:function(viewUserId){
    let that = this;
    app.wxRequest("coreapi/core/v1/queryUserNearlyStudySkuList",
      { viewUserId:viewUserId },
      "POST",function (res) {
        if (res.data.code == 0) {
          // console.log(res)
          let UserNearlyStudySkuList = res.data.data;
          that.setData({
            UserNearlyStudySkuList:UserNearlyStudySkuList
          })
        } else {
          app.showLoading(res.data.msg, "none");
        }
    })
  },
  // 初始化用户笔记
  initUserIndexNoteList:function(viewUserId,size,skip){
    let that = this;
    app.wxRequest("coreapi/core/v1/queryUserIndexNoteList",
      { viewUserId:viewUserId,size:size,skip:skip },
      "POST",function (res) {
        if (res.data.code == 0) {
          // console.log(res)
          let UserIndexNoteList = res.data.data;
          for (var i = 0; i < UserIndexNoteList.length; i++) {
            UserIndexNoteList[i].isShow = false
          }
          that.setData({
            UserIndexNoteList:UserIndexNoteList
          })
        } else {
          app.showLoading(res.data.msg, "none");
        }
    })
  },
  downText:function(e){
    let that = this;
    let index = e.currentTarget.dataset.index;
    let UserIndexNoteList = that.data.UserIndexNoteList;
    if (UserIndexNoteList[index].isShow == true) {
      UserIndexNoteList[index].isShow = false
    }else{
      UserIndexNoteList[index].isShow = true
    }
  

    that.setData({
      UserIndexNoteList:UserIndexNoteList
    })
  },
  // 关注
  follow:function(){
    let that = this;
    let id = that.data.viewUserId;
    let token = app.globalData.token;
    if (token) {
      app.wxRequest("coreapi/core/v1/sendUserFollow",
        {
          fId:id,           //老师或者用户的id
          fType:"0",       //用户类型，0用户，1老师
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

              that.initUserIndexInfo(that.data.viewUserId)
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
    let id = that.data.viewUserId;
    // console.log(id)
    app.isToken().then(
      app.wxRequest("coreapi/core/v1/cancelUserFollow",
        {
          fId:id,           //老师或者用户的id
          fType:"0",       //用户类型，0用户，1老师
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
              that.initUserIndexInfo(that.data.viewUserId)
            }else{
              // 取消关注失败
            }
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
    let that = this;
    let viewUserId = that.data.viewUserId;
    let size = that.data.size;
    let skip = that.data.skip + that.data.size;
    // console.log(size,skip)

    app.wxRequest("coreapi/core/v1/queryUserIndexNoteList",
      {
        viewUserId:viewUserId,
        size:size,
        skip:skip
      },
      "POST",function (res) {
        if (res.data.code == 0) {
          let recordList = res.data.data;
          let UserIndexNoteList = that.data.UserIndexNoteList;
          // console.log(recordList.length)
          if (recordList.length <= 0 ) {
            app.showLoading("没有更多数据了", "none");
            return
          }else{
            for (var i = 0; i < recordList.length; i++) {
              recordList[i].isShow = false;
              UserIndexNoteList.push(recordList[i])
            }
            wx.hideLoading()
            // console.log(TeacherRecordList)
            that.setData({
              UserIndexNoteList:UserIndexNoteList,
              skip:skip
            })
          }
        } else {
          app.showLoading(res.data.msg, "none");
        }
    })
  },
  // 转载
  addNotes:function(e){
    var that = this;
    let linkId = e.currentTarget.dataset.linkid;
    let linkType = e.currentTarget.dataset.type;
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
  },
  // 举报弹框
  report:function(e){
    // let id = e;
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
            app.showLoading("我们会在审核后做出处理", "none");
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
    let that = this;
    if (res.from === 'button') {
      // 来自页面内转发按钮
      // console.log(res.target)
      if (res.target.dataset.kc) {
        return {
          title: "《"+res.target.dataset.kc+"》让我深有感悟,分享给你我的笔记，我们一起学习进步~",
          path: '/pages/society/society'
        }
      }else{
        return {
          path: '/pages/society/society'
        }
      }
    }else if(res.from === 'menu'){
      return {
        path: '/pages/society/society'
      }
    }
  },
})