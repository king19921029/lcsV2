const innerAudioContext = wx.createInnerAudioContext();
const backgroundAudioManager = wx.getBackgroundAudioManager();
var app = getApp();
Page({
  data: {
    studyTab:0,//header切换
    article_isall:false,//文章是否全部展示
    boxHeight:true,//浮层
    user_notes_id:"",//笔记id
    notersData:[],//笔记列表
    voiceAnimationStatus:-1,//播放状态
    isPlay:false,//是否正在播放
    audio_id:"",//播放录音id
    size:10,//每页10条
    skip:0,//从0开始
    is_reprint:null,
    is_share:null,
  },
  onLoad: function (options) {
    var that = this;
    let skuId = options.skuId;
    that.setData({
      skuId: options.skuId
      // skuId:"f41e0651-e1de-4b87-a672-d5b8d002401f"
    })
    app.wxRequest("coreapi/core/v1/queryUserNoteList",
      { skuId: skuId, type: 0, size: 10, skip: 0 }, "POST", function (res) {
        let data = res.data.data;

        if (res.data.code == 0) {
          that.setData({
            notersData: data,
            boxHeight: true,
            skip: 0,
          })
        } else {
          app.showLoading(res.data.msg, "none");
        }
    })
   
  },
  onReady: function () {
  },
  onShow: function () {
    var that = this;
    let skuId = that.data.skuId;
    this.setData({
      boxHeight:true
    })
    // 监听录音播放时
    innerAudioContext.onPlay(function () {
      console.log('语音播放')
    })
    innerAudioContext.onStop(function () {
      backgroundAudioManager.play();
    })
    // 监听录音播放完成时
    innerAudioContext.onEnded(() => {
      console.log('语音停止播放')
      that.setData({
        voiceAnimationStatus: -1,
        isPlay:false,
      })
    })
   
    app.wxRequest("coreapi/core/v1/queryUserNoteList",
      { skuId: skuId, type: that.data.studyTab, size: 10, skip: 0 },
      "POST", function (res) {
        let data = res.data.data;

        if (res.data.code == 0) {
          that.setData({
            notersData: data,
            boxHeight: true,
            skip: 0,
          })
        } else {
          app.showLoading(res.data.msg, "none");
        }
    })
   
  },
  onHide:function(){
    innerAudioContext.stop()
  },
  onUnload:function(){
    innerAudioContext.stop()
  },
  onReachBottom: function () {
    console.log("触底")
    let that = this;
    let size = that.data.size;
    let skip = that.data.skip + size;
    let studyTab = that.data.studyTab;
      wx.showLoading({
        title: '加载中',
      })
    that._initData(that.data.skuId, studyTab, size, skip)
  },
  // 下拉
  _initData(skuId, types, size, skip){
    var that = this;
    app.wxRequest("coreapi/core/v1/queryUserNoteList",
      { skuId: skuId,type: types, size: size, skip: skip}, "POST", function (res) {
        let data = res.data.data;
        let notersData = that.data.notersData;

        if (res.data.code == 0) {
          if( data.length > 0 ){
            for (var i = 0; i < data.length; i++) {
              notersData.push(data[i])
            }
            wx.hideLoading()
            that.setData({
              notersData: notersData,
              boxHeight: true,
              skip: skip,
              studyTab: types,
            })
          }else{
            wx.hideLoading()
            app.showLoading("没有更多数据了", "none");
          }   
          
        } else {
          app.showLoading(res.data.msg, "none");
        }
    })
  },
  _com_tab(skuId, types, size, skip){
    var that = this;
    app.wxRequest("coreapi/core/v1/queryUserNoteList",
      { skuId: skuId, type: types, size: size, skip: skip }, "POST", function (res) {
        let data = res.data.data;
        if (res.data.code == 0) {
          that.setData({
            notersData: data,
            boxHeight: true,
            skip: skip,
            studyTab: types,
          })
        } else {
          app.showLoading(res.data.msg, "none");
        }
      })
  },
  // 去详情
  go_skuDetails:function(e){
    let skuId = e.currentTarget.dataset.skuid;
    let cwId = e.currentTarget.dataset.cwid;
    app.wxRequest("coreapi/core/v1/querySkuInfo",
      { skuId: skuId }, "POST", function (res) {
        if (res.data.code == 0) {
          if (res.data.data.is_buy == "0") {
            wx.navigateTo({
              url: '/pages/commonPage/noBuyDetails/noBuyDetails?skuId=' + skuId
            })
          } else {
            app.wxRequest("coreapi/core/v1/querySkuCwDetailInfo",
              { skuId: skuId, cwId: cwId }, "POST", function (res) {
                if (res.data.code == 0) {
                  wx.navigateTo({
                    url: '/pages/commonPage/courseDetails/courseDetails?skuId=' + skuId + "&cwId=" + cwId + "&history_play_time=" + res.data.data.history_play_time
                  })
                } else {
                  app.showLoading(res.data.msg, "none");
                }
            })
          }

        } else {
          app.showLoading(res.data.msg, "none");
        }
      })
  },
  // 关闭
  off:function(){
    var that = this;
    that.setData({
      boxHeight: true
    })
  },
  // 全部笔记
  allTap:function(){
    var that = this;
    let skuId = that.data.skuId;
    let size = that.data.size;
    let skip = that.data.skip;
    that._com_tab(skuId, 0, size, 0)
  },
  // 原创
  originalTap: function () {
    var that = this;
    let skuId = that.data.skuId;
    let size = that.data.size;
    let skip = that.data.skip;
    that._com_tab(skuId, 1, size, 0)
  },
  // 转载
  reprintTap: function () {
    var that = this;
    let skuId = that.data.skuId;
    let size = that.data.size;
    let skip = that.data.skip;
    that._com_tab(skuId, 2, size, 0)
  },
  // 展开所有内容
  article_all:function(){
    var that = this;
    that.setData({
      article_isall:true
    })
  },
  //隐藏
  article_normal:function(){
    var that = this;
    that.setData({
      article_isall: false
    })
  },
  // 呼出浮层
  open: function (e) {
    var that = this;
    let noteid =  e.currentTarget.dataset.noteid;
    let isreprint = e.currentTarget.dataset.isreprint;

    that.setData({
      boxHeight: false,
      user_notes_id: e.currentTarget.dataset.noteid,
      is_reprint: isreprint
    })
  },
  // 去编辑笔记
  goWriteNotes:function(e){
    var that = this;
    console.log(that.data.user_notes_id);
    let notesId = that.data.user_notes_id;
    let data = that.data.notersData;
    
    for( var i = 0;i < data.length;i++ ){
      if (data[i].note_id == notesId  ){
        console.log(data[i]);
        wx.setStorageSync('WriteNotes', data[i]);
        wx.navigateTo({
          url: '/pages/studyPackage/reviseNotes/reviseNotes',
        })
      }
    }
  },
  // 删除笔记
  removeNotes: function (e) {
    var that = this;
    console.log(that.data.user_notes_id);
    let skuId = that.data.skuId;
    let userNoteId = that.data.user_notes_id;

    app.wxRequest("coreapi/core/v1/delUserNote",
      { userNoteId: userNoteId }, "POST", function (res) {
        if (res.data.code == 0) {
          if (res.data.data.actionResult == "1" ){
            app.showLoading("删除成功！", "none");
            that.onShow();
          }
        } else {
          app.showLoading(res.data.msg, "none");
        }
    })
  },
  // 播放语音
  paly_ly: function (e) {
    const that = this;
    let isPaly = that.data.isPaly;
    let audio_id = e.currentTarget.dataset.audioid
    let idx = e.currentTarget.dataset.idx

    if (isPaly && idx == that.data.voiceAnimationStatus ){
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
  // 去主页
  go_mine: function (e) {
    let authortype = e.currentTarget.dataset.authortype;
    let authorid = e.currentTarget.dataset.authorid;
    console.log(authortype)
    if (authortype == "0") {
      wx.navigateTo({
        url: '/subPages/societyPackage/pages/follow_details/follow_details?viewUserId=' + authorid
      })
    } else {
      wx.navigateTo({
        url: '/subPages/societyPackage/pages/recommend_details/recommend_details?teacherId=' + authorid
      })
    }
  },
  // 笔记图片点击查看大图
  previewImage: function (e) {
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
  onePreviewImage: function (e) {
    let url = e.currentTarget.dataset.url;
    var that = this;
    innerAudioContext.stop()
    that.setData({
      voiceAnimationStatus: -1,
      isPaly: false
    })

    wx.previewImage({
      urls: [url]
    })
  },
  // 分享
  onShareAppMessage: function (res) {
    let that = this;
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
  
    return {
      path: '/pages/school/school',
    }
  },
})