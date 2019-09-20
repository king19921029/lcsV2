var app = getApp();
// 录音
const innerAudioContext = wx.createInnerAudioContext();
const uuid = require('../../../utils/util.js');
Page({
  data: {
    article_isall: false,//文章是否全部展示
    notersData:{},
    voiceAnimationStatus:-1,//录音播放
    isPlay: false,//是否正在播放
  },
  onLoad: function (options) {
    var that = this;
    that.setData({
      skuId: options.skuId
      // skuId:"4db26d42-dbca-4a69-89a8-895f7ab8a27a"
    })
  },
  onShow: function () {
    var that = this;
    let skuId = that.data.skuId;
    app.wxRequest("coreapi/core/v1/querySkuRecommendNoteList",
      { skuId: skuId, size: 5, skip: 0 }, "POST", function (res) {
      let data = res.data.data;
      if (res.data.code == 0) {
        that.setData({
          notersData: res.data.data
        })
      } else {
        app.showLoading(res.data.msg, "none");
      }
      console.log(res.data.data)
    })
  
  
   

    // 监听录音播放时
    innerAudioContext.onPlay(function () {
      console.log('语音播放')
    })
    // 监听录音播放完成时
    innerAudioContext.onEnded(() => {
      console.log('语音停止播放')
      that.setData({
        voiceAnimationStatus: -1,
        isPlay: false,
      })
    })

    // pageViewTime
    let viewTime = app.globalData.viewTime;
    app.onPageViewTime(viewTime)
  },
  onUnload: function () {
    var that = this;
    let uuids = uuid.create_UUID();//uid
    let pageCode = "1015"
    let beginTime = app.globalData.beginTime;//页面开始时间戳
    let endTime = Date.parse(new Date()) / 1000;//结束时间戳
    app.stopPageViewTime(uuids, pageCode, beginTime, endTime)
  },
  // 展开所有内容
  article_all: function () {
    var that = this;
    that.setData({
      article_isall: true
    })
  },
  //隐藏
  article_normal: function () {
    var that = this;
    that.setData({
      article_isall: false
    })
  },
  // 关注
  seeUser:function(e){
    const that = this;
    let fId = e.currentTarget.dataset.userid;
    let fType = e.currentTarget.dataset.usertype;
    let is_follow = e.currentTarget.dataset.isfollow;

    if (is_follow == "0") {
      app.wxRequest('coreapi/core/v1/sendUserFollow',
      { fId: fId, fType: fType }, 'POST', function (res) {
        if (res.data.code == 0) {
          console.log(res.data.data)
          that.onShow();
        } else {
          app.showLoading(res.data.msg, "none")
        }
      })
    }else{
      app.wxRequest('coreapi/core/v1/cancelUserFollow',
        { fId: fId, fType: fType }, 'POST', function (res) {
          if (res.data.code == 0) {
            console.log(res.data.data)
          } else {
            app.showLoading(res.data.msg, "none")
          }
        })
    }
  },
  // 播放语音
  paly_ly: function (e) {
    const that = this;
    let isPaly = that.data.isPaly;
    let audio_id = e.currentTarget.dataset.audioid
    let idx = e.currentTarget.dataset.idx

    if (isPaly && idx == that.data.voiceAnimationStatus) {
      innerAudioContext.stop()
      that.setData({
        voiceAnimationStatus: -1,
        isPaly: false
      })
    } else {

      that.setData({
        voiceAnimationStatus: idx,
        isPaly: true
      })
      app.getMicUrl(audio_id, innerAudioContext)
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

    if (url3) {
      arr.push(url);
      arr.push(url2)
      arr.push(url3)
    } else {
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
  // 去详情
  go_skuDetails: function (e) {
    let skuId = e.currentTarget.dataset.skuid;
    let cwId = e.currentTarget.dataset.cwid;
    app.wxRequest("coreapi/core/v1/querySkuInfo",
      { skuId: skuId }, "POST", function (res) {
        if (res.data.code == 0) {
          if (res.data.data.is_buy == "0") {
            // wx.navigateTo({
            //   url: '/pages/commonPage/noBuyDetails/noBuyDetails?skuId=' + skuId
            // })
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
})