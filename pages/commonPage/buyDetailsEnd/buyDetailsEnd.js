const app = getApp();
const backgroundAudioManager = wx.getBackgroundAudioManager();
const uuid = require('../../../utils/util.js');
Page({
  data: {
    queryColumnInfo: {},//基础数据
    teacherList: {},//老师数据
    skuDetailList: {},//sku内容信息
    skuCWList: {},//课程列表
    NoteList: {},//精选笔记
    sortStatus:0,
    skuId:null,
    isMicPlay: false,
    size: 10,//每页显示的数量
    skip: 10,//位置
    
  },
  onLoad: function (options) {
    var that = this;
    that.setData({
      skuId: options.skuId
      // skuId:"f4cbc019-be20-4198-b2dc-d83f6aac5fea"
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
        } else if( res.data.code == 429 ){
          app.showLoading("您的操作过于频繁","none")
          that.onLoad()
        }else{
          app.showLoading(res.data.msg, "none");
        }
    })

    
  },
  onShow: function () {
    var that = this;
    // 初始化数据
    this.initData(that.data.skuId);
    // 刷新列表（实施更新）
    // setTimeout(function () {
    //   // CW信息列表
    //   app.wxRequest("coreapi/core/v1/querySkuCWList",
    //     { skuId: that.data.skuId }, "POST", function (res) {
    //       if (res.data.code == 0) {
    //         let skuCWList = res.data.data;
    //         that.setData({
    //           skuCWList: skuCWList
    //         })

    //       } else {
    //         app.showLoading(res.data.msg, "none");
    //       }
    //     })
    // }, 3000)

    // pageViewTime
    let viewTime = app.globalData.viewTime;
    app.onPageViewTime(viewTime)

    backgroundAudioManager.onTimeUpdate(function () {
      //总时长
      let maxnum = Math.ceil(backgroundAudioManager.currentTime) || 0;
      that.data.micduration = maxnum
    })
  },
  onUnload: function () {
    var that = this;
    let uuids = uuid.create_UUID();//uid
    let pageCode = "1010";//页面CODE
    let beginTime = app.globalData.beginTime;//页面开始时间戳
    let endTime = Date.parse(new Date()) / 1000;//结束时间戳
    let skuid = that.data.skuId;
    app.stopPageViewTime(uuids, pageCode, beginTime, endTime, skuid, "0")
  },
  onHide: function () {
    var that = this;
    let uuids = uuid.create_UUID();//uid
    let pageCode = "1010";//页面CODE
    let beginTime = app.globalData.beginTime;//页面开始时间戳
    let endTime = Date.parse(new Date()) / 1000;//结束时间戳
    let skuid = that.data.skuId;
    app.stopPageViewTime(uuids, pageCode, beginTime, endTime, skuid,"0")
  },
  // 初始化数据
  initData(skuId) {
    var that = this;
    // SKU基础信息
    // let skuIf = wx.getStorageSync("skuInfo") || "";
    // if ( skuIf ){
    //   // that.setData({
    //   //   queryColumnInfo: skuIf,
    //   //   isMicPlay: app.globalData.isMicPlay,
    //   //   cwId: app.globalData.cwId,
    //   //   size: 10,
    //   //   skip: 10
    //   // })
    // }else{
      // app.wxRequest("coreapi/core/v1/querySkuInfo",
      //   { skuId: skuId }, "POST", function (res) {
      //     // console.log(res.data.data)
      //     if (res.data.code == 0) {
      //       that.setData({
      //         queryColumnInfo: res.data.data,
      //         isMicPlay: app.globalData.isMicPlay,
      //         cwId: app.globalData.cwId,
      //         size: 10,
      //         skip: 10
      //       })
      //     } else {
      //       app.showLoading(res.data.msg, "none");
      //     }
      // })
    // }
    
    
   
   
    // sku内容信息
    app.wxRequest("coreapi/core/v1/querySkuDetailList",
      { skuId: skuId }, "POST", function (res) {
        // console.log(res.data.data)
        if (res.data.code == 0) {
          that.setData({
            skuDetailList: res.data.data
          })
        } else {
          app.showLoading(res.data.msg, "none");
        }
    })
    // CW信息列表
    app.wxRequest("coreapi/core/v1/querySkuCWList",
      { skuId: skuId }, "POST", function (res) {
        if (res.data.code == 0) {
          let skuCWList = res.data.data;
          wx.setStorageSync("skuCWList", skuCWList)         
          that.setData({
            skuCWList: skuCWList
          })
          
        } else {
          app.showLoading(res.data.msg, "none");
        }
    })
  },
  // 去详情
  go_details:function(e){
    var that = this;
    let cwId = e.currentTarget.dataset.cwid;
    let cwType = e.currentTarget.dataset.cwtype;
    let appcwId = app.globalData.cwId;
    let progress = e.currentTarget.dataset.progress;
    let isMicPlay = app.globalData.isMicPlay;
    let history_play_time = e.currentTarget.dataset.historyplaytime;
    

    console.log(cwId);
    //考试
    if ( cwType == 1 ){
      if (progress == "未考试") {
        wx.navigateTo({
          url: '/subPages/checkoutPackage/pages/checkout_detail/checkout_detail?skuId=' + this.data.skuId + "&cwId=" + cwId,
        })
      } else {
        wx.navigateTo({
          url: '/subPages/checkoutPackage/pages/checkout_result/checkout_result?back=1' + "&cwId=" + cwId,
        })
      }
     
    } else if(cwType == 0){
      //再次进入播放的页面
      if ( cwId == appcwId && isMicPlay ){
        wx.navigateTo({
          url: '/pages/commonPage/courseDetails/courseDetails?skuId=' + this.data.skuId + "&cwId=" + cwId + "&video_show=1",
        })
      }else{
        let micduration = that.data.micduration; 
        if (micduration){
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
        console.log("在"+history_play_time+"s开始播放");
        wx.navigateTo({
          url: '/pages/commonPage/courseDetails/courseDetails?skuId=' + this.data.skuId + "&cwId=" + cwId + "&history_play_time=" + history_play_time
        })
        
      }
     
    }else{
      app.showLoading("直播敬请期待","none")
    }
    
  },
  _getPlayUrl(id) {
    var that = this;
    var promise = new Promise((resolve, reject) => {
      app.wxRequest('coreapi/media/v1/getplayallinfo',
        { videoId: id }, 'POST', function (res) {
          if (res.data.code == 0) {
            resolve(res.data.data);
          } else {
            reject(res.data.msg);
          }
        })
    });
    return promise;
  },
  // 排序
  sortTap(e){
    var that = this;
    let sortStatus = that.data.sortStatus;
    let skuId = that.data.skuId;
    
    if (sortStatus == 0 ){
      // CW信息列表
      app.wxRequest("coreapi/core/v1/querySkuCWList",
        { skuId: skuId, orderType: "1" }, "POST", function (res) {
          if (res.data.code == 0) {
            that.setData({
              skuCWList: res.data.data,
              sortStatus:1,
              size: 10,//每页显示的数量
              skip: 10,//位置
            })
          } else {
            app.showLoading(res.data.msg, "none");
          }
        })
    }else{
      // CW信息列表
      app.wxRequest("coreapi/core/v1/querySkuCWList",
        { skuId: skuId }, "POST", function (res) {
          if (res.data.code == 0) {
            that.setData({
              skuCWList: res.data.data,
              sortStatus: 0,
              size: 10,//每页显示的数量
              skip: 10,//位置
            })
          } else {
            app.showLoading(res.data.msg, "none");
          }
        })
    }
    
  },
  // 去未购
  go_noBuy(){
    let skuId = this.data.skuId;
    wx.navigateTo({
      url: "../noBuyDetails/noBuyDetails?skuId=" + skuId + "&is_buy=true"
    })
  },
  micGoDetails: function () {
    var that = this;
    let skuId = app.globalData.skuId;
    let cwId = app.globalData.cwId;
    wx.navigateTo({
      url: '/pages/commonPage/courseDetails/courseDetails?skuId=' + skuId + "&cwId=" + cwId + "&video_show=1"
    })
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
  // 在展开全部
  allTap: function () {
    wx.showLoading({
      title: '加载中',
    })
    var that = this;
    let skuId = that.data.skuId;
    let size = that.data.size;
    let skip = that.data.skip;
    let skuCWList = that.data.skuCWList
    let sortStatus = that.data.sortStatus

  
    if ( sortStatus == 1 ){
      app.wxRequest("coreapi/core/v1/querySkuCWList",
        { skuId: skuId, size: size, skip: skip, orderType: "1" }, "POST", function (res) {
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
    }else{
      app.wxRequest("coreapi/core/v1/querySkuCWList",
      { skuId: skuId, size: size, skip: skip}, "POST", function (res) {
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
    }
  },
})