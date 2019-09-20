const app = getApp();
const backgroundAudioManager = wx.getBackgroundAudioManager();
const uuid = require('../../../utils/util.js');
Page({
  data: {
    queryColumnInfo:{},//基础数据
    teacherList:{},//老师数据
    skuDetailList:{},//sku内容信息
    skuCWList:{},//课程列表
    NoteList:{},//精选笔记
    skuId:"",
    isMicPlay: false,
    model:"",//机型
    size: 10,//每页显示的数量
    skip: 10,//位置
  },
  onLoad: function (options) {
    var that = this;
    that.setData({
      skuId: options.skuId,
      // skuId:"4db26d42-dbca-4a69-89a8-895f7ab8a27a",
      model: app.globalData.model
    })
    app.wxRequest("coreapi/core/v1/querySkuInfo",
    { skuId: options.skuId }, "POST", function (res) {

      if (res.data.code == 0) {
        that.setData({
          queryColumnInfo: res.data.data,
          isMicPlay: app.globalData.isMicPlay,
          cwId: app.globalData.cwId,
          size: 10,
          skip: 10
        })
      } else if (res.data.code == 429) {
        app.showLoading("您的操作过于频繁", "none")
        that.onLoad();
      } else {
        app.showLoading(res.data.msg, "none");
      }
    })

  },
  onShow: function () {
    var that = this;
    that.initData(that.data.skuId)
    backgroundAudioManager.onTimeUpdate(function () {
      //总时长
      let maxnum = Math.ceil(backgroundAudioManager.currentTime) || 0;
      that.data.micduration = maxnum
    })
  },
  // 初始化数据
  initData(skuId) {
    var that = this;
    // SKU基础信息
    let skuIf = wx.getStorageSync("skuInfo")
    if (skuIf ){
      that.setData({
        queryColumnInfo: skuIf,
        isMicPlay: app.globalData.isMicPlay, 
        size: 10,//每页显示的数量
        skip: 10,//位置
      })
    }else{
      app.wxRequest("coreapi/core/v1/querySkuInfo",
        { skuId: skuId }, "POST", function (res) {
          if (res.data.code == 0) {
            that.setData({
              queryColumnInfo: res.data.data,
              isMicPlay: app.globalData.isMicPlay,
              size: 10,//每页显示的数量
              skip: 10,//位置
            })
            wx.setStorageSync("skuInfo", res.data.data)
          } else {
            app.showLoading(res.data.msg, "none");
          }
      })
    }
    
    
    // SKU老师信息
    app.wxRequest("coreapi/core/v1/querySkuTeacherList",
      { skuId: skuId }, "POST", function (res) {
        // console.log(res.data.data)
        if (res.data.code == 0) {
          that.setData({
            teacherList: res.data.data
          })
        } else {
          app.showLoading(res.data.msg, "none");
        }
      })
    // sku内容信息
    app.wxRequest("coreapi/core/v1/querySkuDetailList",
      { skuId: skuId }, "POST", function (res) {
        // console.log(res.data.data)
        if (res.data.code == 0) {
          that.setData({
            skuDetailList: res.data.data,
            article: res.data.data
          })
      
        } else {
          app.showLoading(res.data.msg, "none");
        }
    })
    // CW信息列表
    app.wxRequest("coreapi/core/v1/querySkuCWList",
    { skuId: skuId }, "POST", function (res) {
      // console.log(res.data.data)
      if (res.data.code == 0) {
        that.setData({
          skuCWList: res.data.data
        })
      } else {
        app.showLoading(res.data.msg, "none");
      }
    })

   
    app.wxRequest("coreapi/core/v1/querySkuRecommendNoteList",
      { skuId: skuId, size: 5, skip:0 }, "POST", function (res) {
        console.log(res.data.data)
        if (res.data.code == 0) {
          that.setData({
            NoteList: res.data.data
          })
        } else {
          // app.showLoading(res.data.msg, "none");
        }
    })
  },
  onUnload: function () {
  },
  onHide: function () {
    wx.removeStorageSync("queryColumnInfo");
  },
  // 在展开全部
  allTap:function(){
    wx.showLoading({
      title: '加载中',
    })
    var that = this;
    let skuId = that.data.skuId;
    let size = that.data.size;
    let skip = that.data.skip;
    let skuCWList = that.data.skuCWList
   
    app.wxRequest("coreapi/core/v1/querySkuCWList",
      { skuId: skuId, size: size, skip: skip }, "POST", function (res) {
      // console.log(res.data.data)
      if (res.data.code == 0) {
        let data = res.data.data;

        if (data.length > 0) {
          for (var i = 0; i < data.length; i++) {
            skuCWList.push(data[i])
          }

          wx.hideLoading()
          that.setData({
            skuCWList: skuCWList,
            skip: skip + 10
          })
          
        } else {
          wx.hideLoading()
          app.showLoading("没有更多数据了", "none");
        }  
        
      } else {
        app.showLoading(res.data.msg, "none");
      }
    })
  },
  // 课程详情
  goDetails:function(e){
    let that = this;
    let cwId = e.currentTarget.dataset.cwid;
    let free = e.currentTarget.dataset.free;
    let cw_type = e.currentTarget.dataset.cwtype;
    let skuId = this.data.skuId;
    let is_buy = this.data.queryColumnInfo.is_buy;
    let progress = e.currentTarget.dataset.progress;
    let history_play_time = e.currentTarget.dataset.historyplaytime;
    let appcwId = app.globalData.cwId;
    let isMicPlay = app.globalData.isMicPlay;

    if ( is_buy == "1" ){
      if (cw_type == 2){
        app.showLoading("直播敬请期待","none")
      }else if (cw_type == 1 ){
        backgroundAudioManager.stop();
        if (progress == "未考试") {
          wx.navigateTo({
            url: '/subPages/checkoutPackage/pages/checkout_detail/checkout_detail?skuId=' + skuId + "&cwId=" + cwId,
          })
        } else {
          wx.navigateTo({
            url: '/subPages/checkoutPackage/pages/checkout_result/checkout_result?back=1' + "&cwId=" + cwId,
          })
        }
      }else{
        //再次进入播放的页面
        if (cwId == appcwId && isMicPlay) {
          wx.navigateTo({
            url: '/pages/commonPage/courseDetails/courseDetails?skuId=' + skuId + "&cwId=" + cwId + "&video_show=1",
          })
        } else {
          let micduration = that.data.micduration;
          if (micduration) {
            let com_beginTime = app.globalData.micBeginTime;
            // 结束时长
            let com_overTime = Date.parse(new Date()) / 1000;
            let com_seeTime = com_overTime - com_beginTime;

            if (com_beginTime > 0 && com_seeTime > 0 && com_seeTime < 99999) {
              // 总共看了多少秒

              console.log("音频停止了,总共播放了:" + com_seeTime + "s")
              if (com_seeTime > 0) {
                // playTime所需参数
                let uuids = uuid.create_UUID();//uid

                let skuId = app.globalData.micBeginSkuId;
                let cwId = app.globalData.micBeginCwId;
                let fileId = app.globalData.micBeginMicId; //videoId

                let fileType = 0; //文件类型
                var playTimePoint = micduration || 0; //播放到什么位置
                app.stopPlayer(uuids, skuId, cwId, fileId, fileType, com_seeTime, playTimePoint)
                app.globalData.micBeginTime = 0;
              }
            }
          }
          backgroundAudioManager.stop();
          wx.navigateTo({
            url: '/pages/commonPage/courseDetails/courseDetails?cwId=' + cwId + "&skuId=" + skuId + "&history_play_time=" + history_play_time
          })

        }
        
      }
    }else{
      if (free == "1") {
        wx.navigateTo({
          url: '/pages/commonPage/listenTest/listenTest?cwId=' + cwId + "&skuId=" + skuId,
        })
      }else{
        app.showLoading("请先购买","none")
      }
    }

  },
  //免费试听
  testGoDetails:function(){
    var that = this;
    let data = that.data.skuCWList;
    for( var i = 0;i < data.length;i++ ){
      if ( data[i].is_free == 1 ){
        wx.navigateTo({
          url: '/pages/commonPage/listenTest/listenTest?cwId=' + data[i].cw_id + "&skuId=" + that.data.skuId,
        })
        return false;
      }else{
        app.showLoading("暂无试听","none")
      }
    }
   
  },
  // 去老师主页
  goTeacher: function (e) {
    let id = e.currentTarget.dataset.id;
    console.log(id);
    wx.navigateTo({
      url: '/subPages/societyPackage/pages/recommend_details/recommend_details?teacherId=' + id,
    })
  },
  // 去老师主页
  goGoodNotes: function (e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/schoolPackage/goodNotes/goodNotes'
    })
  },
  // 所有笔记
  goAllNotes: function (e) {
    let that = this;
    wx.navigateTo({
      url: '/pages/schoolPackage/goodNotes/goodNotes?skuId=' + that.data.skuId,
    })
  },
  // 立即购买
  goBuy:function(){
    var that = this;
    let skuId = that.data.skuId;
    let model = that.data.model;
    let price = that.data.queryColumnInfo.price;
    wx.removeStorageSync("skuInfo");
    if (app.globalData.token == "" || app.globalData.token == null ){
      app.showLoading("请先登录",'none')
      wx.navigateTo({
        url: '/subPages/loginPackage/pages/login/login',
      })
    }else{
      if (price > 1){
        wx.navigateTo({
          url: '../buyCurse/buyCurse?skuId=' + skuId,
        }) 
       
        // 购买
      }else{
        // SKU基础信息
        app.wxRequest("coreapi/core/v1/buySkuObject",
          { skuId: skuId, skuType: 0 }, "POST", function (res) {
            if (res.data.code == 0) {
              console.log(res);
              if (res.data.data.actionResult == 1) {
                app.showLoading("购买成功", "success");
                that.initData(skuId)
              } else {
                app.showLoading("购买失败", "none");
              }
            } else {
              app.showLoading(res.data.msg, "none");
            }
        })
      }
      
    }
  },
  bugCurseTap: function () {
    let skuId = this.data.skuId;
    // SKU基础信息
    app.wxRequest("coreapi/core/v1/buySkuObject",
      { skuId: skuId, skuType: 0 }, "POST", function (res) {
        if (res.data.code == 0) {
          console.log(res);
          if (res.data.data.actionResult == 1) {
            app.showLoading("购买成功", "success");
            that.onShow();
          } else {
            app.showLoading("购买失败", "none");
          }
        } else {
          app.showLoading(res.data.msg, "none");
        }
    })
  },
  iosGoBuy:function(){
    var that = this;
    let price = that.data.queryColumnInfo.price;
    let skuId = that.data.skuId;
    if (price > 1){
      app.showLoading("由于政策原因，请您到'我是理财师'APP内购买", "none");
    }else{
      // SKU基础信息
      app.wxRequest("coreapi/core/v1/buySkuObject",
        { skuId: skuId, skuType: 0 }, "POST", function (res) {
          if (res.data.code == 0) {
            console.log(res);
            if (res.data.data.actionResult == 1) {
              app.showLoading("购买成功", "success");
              that.onShow();
            } else {
              app.showLoading("购买失败", "none");
            }
          } else {
            app.showLoading(res.data.msg, "none");
          }
      })
    }
    
  },
  // 分享
  onShareAppMessage: function (res) {
    let that = this;
    if (res.from === 'button') {
      console.log(res.target)
    }
    return {
      title: that.data.queryColumnInfo.sku_title,
      path: '/pages/school/school?skuId=' + that.data.skuId,
    }
  },
})