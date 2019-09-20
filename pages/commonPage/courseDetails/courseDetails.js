const app = getApp();
// 音频
const backgroundAudioManager = wx.getBackgroundAudioManager();
// 录音
const innerAudioContext = wx.createInnerAudioContext();
const util = require('../../../utils/repetitionTap.js');
var uuid = require('../../../utils/util.js');
const micObj = {
  // 秒换时分
  sec_to_time: function (s) {
    var t;
    if (s > -1) {
      if (s > 3600) {
        var hour = Math.floor(s / 3600);
        var min = Math.floor(s / 60) % 60;
        var sec = s % 60;
        if (hour < 10) {
          t = '0' + hour + ":";
        } else {
          t = hour + ":";
        }

        if (min < 10) { t += "0"; }
        t += min + ":";
        if (sec < 10) { t += "0"; }
        t += sec.toFixed(0);
      } else {
        var min = Math.floor(s / 60) % 60;
        var sec = s % 60;
        if (min < 10) { t += "0"; }
        t = min + ":";
        if (sec < 10) { t += "0"; }
        t += sec.toFixed(0);
      }
    }

    return t;
  },
  // sec_to_time: function (s) {
  //   //计算分钟
  //   //算法：将秒数除以60，然后下舍入，既得到分钟数
  //   var h;
  //   h = Math.floor(s / 60);
  //   //计算秒
  //   //算法：取得秒%60的余数，既得到秒数
  //   s = s % 60;
  //   //将变量转换为字符串
  //   h += '';
  //   s += '';
  //   //如果只有一位数，前面增加一个0
  //   h = (h.length == 1) ? '0' + h : h;
  //   s = (s.length == 1) ? '0' + s : s;
  //   return h + ':' + s;
  // },
  // 时分转秒
  time_to_sec: function (s) {

    var hour = s.split(':')[0];
    var min = s.split(':')[1];
    var sec = s.split(':')[2];
    s = parseInt(hour * 3600) + parseInt(min * 60) + parseInt(sec);
    return s;

  },
  // ++计时
  countAdd: function (initTime, that, allTime) {

    // 播放时长 + 1
    addTimer = setTimeout(function () {
      if (initTime == allTime) {
        clearTimeout(addTimer);
        clearTimeout(dowmTimer);
        return false;
      }
      // 播放时长
      initTime++;
      // 1s一次计时
      micObj.countAdd(initTime, that, allTime);
      // 秒转换字符串
      let time = micObj.sec_to_time(initTime);

      that.setData({
        playTime: time,
        sliderValue: initTime
      });


    }, 1000)


  },
  // --计时
  countDown: function (allTime, that, cwId, skuId, skuType) {

    // 总时长时间戳 - 1
    dowmTimer = setTimeout(function () {
      allTime--;

      if (allTime == 15) {
        app.wxRequest('api/apiservice/sku/v1/userStudyEndCW',
          { cwId: cwId, skuId: skuId, skuType: skuType }, 'POST', function (res) {
            console.log(res.data)
          })
      }
      // 1s一次计时
      micObj.countDown(allTime, that, cwId, skuId, skuType);
      // 秒转换字符串
      let num = micObj.sec_to_time(allTime);
      // 赋值给也页面总时间
      that.setData({
        allTime: num
      })



    }, 1000)
  },
}

Page({
  data: {
    pageCode:"",//页码
    isFirstStatus: false,//第一次进入浮层
    userId:null,//用户id
    isFile:false,//视频最后
    isEnd:false,//最后15秒
    com_beginTime:0,//开始播放时长
    com_overTime: 0,//结束时长
    history_play_time:null,//上次播放位置
    voiceAnimationStatus: -1,//语音动画状态码
    voiceAnimation: false,//语音动画
    studyTab: 0,//header切换
    video_show: true,//视频页面显示
    video_isPlay:false,//视频是否播放
    backgroundAudioManagerTime: null,//背景音乐播放时间
    sliderMax: "",//进度条总长度
    sliderValue: "",//进度条播放滑动时长
    playTime: "",//音频播放时长
    allPlayTime: "",//音频总时长
    isPlay: false,//是否正在播放
    animationIsShow: false,//转圈动画化
    skuStudyPlanCWList: {},//课程列表
    cwIdArr: {},//课程id数组
    video_paly_time: "",//视频播放时长
    SkuCwDetailInfo: {},//CW基础信息接口
    SkuCwNoteList: {},//CW笔记信息列表
    SkuCWList: {},//小节CW信息列表接口
    videoData: {},//视频数据
    audioData: {},//音频数据
    cwId: "",
    skuId: "",
    isLyPaly: false,//录音播放
    cwListSize: 10,//每页显示的数量
    cwListSkip: 10,//位置
  },
  onLoad: function (options) {
    var that = this;
    let skuId = options.skuId;
    let cwId = options.cwId;

    // 新手指导
    let isFirst = wx.getStorageSync("isFirst");
    if (isFirst.detailStatus) {
      that.setData({
        isFirstStatus: false
      })
    } else {
      that.setData({
        isFirstStatus: true
      })
    }

    //正在音频播放
    if (options.video_show == "1" ){
      //小节CW基础信息接口
      app.wxRequest('coreapi/core/v1/querySkuCwDetailInfo',
        { skuId: skuId, cwId: cwId }, 'POST',function (res) {
        if (res.data.code == 0) {
          //页面基本信息数据
          let SkuCwDetailInfo = res.data.data;
          that.setData({
            SkuCwDetailInfo: SkuCwDetailInfo,
          })
        } else {
          app.showLoading(res.data.msg, "none");
        }
      })
      // CW笔记信息接口
      app.wxRequest('coreapi/core/v1/querySkuCwNoteList',
        { skuId: skuId, cwId: cwId, size: 5, skip: 0 }, 'POST', function (res) {
        if (res.data.code == 0) {

          that.setData({
            SkuCwNoteList: res.data.data //笔记信息
          })
        } else {
          app.showLoading(res.data.msg, "none");
        }

      })
      // CW信息列表接口
      app.wxRequest('coreapi/core/v1/querySkuCWList',
        { skuId: skuId }, 'POST', function (res) {
        let list = res.data.data;
        let arr = [];
        // 遍历删除考题，取出所有cwid留着上下曲用
        for (var i = 0; i < list.length; i++) {
          if (list[i].cw_type == "0") {
            arr.push(list[i].cw_id);
          }
        }
        // console.log(arr);
        that.setData({
          SkuCWList: list,
          cwIdArr: arr,
          cwId: cwId,
          isEnd: false
        })
      })
      that.setData({
        skuId: options.skuId,
        cwId: options.cwId,

        video_show: false,
        isPlay: true,
        animationIsShow: true,
      })
      
    }else{

      that.setData({
        skuId: options.skuId,
        cwId: options.cwId,
        backgroundAudioManagerTime:null,
        history_play_time: options.history_play_time,
      })
      that._init_data(options.skuId, options.cwId, options.history_play_time);
    }

    app.globalData.skuId = options.skuId;
    app.globalData.cwId = options.cwId;

  },
  onShow: function () {
    var that = this;

    // 判断userid
    if( that.data.video_show ){
      that.setData({
        pageCode:"2008",
        userId: app.globalData.userId || null
      })
    }else{
      that.setData({
        pageCode: "2011",
        userId: app.globalData.userId || null
      })
      
    }
    
    // pageViewTime
    let viewTime = app.globalData.viewTime;
    app.onPageViewTime(viewTime)

    // CW笔记信息接口
    app.wxRequest('coreapi/core/v1/querySkuCwNoteList',
      { skuId: that.data.skuId, cwId: that.data.cwId, size: 10, skip: 0 }, 
      'POST', function (res) {
        if (res.data.code == 0) {

          that.setData({
            SkuCwNoteList: res.data.data //笔记信息
          })
        } else {
          app.showLoading(res.data.msg, "none");
        }

    })
    that._upDateCwList(that.data.skuId)
    // 监听音乐播放
    backgroundAudioManager.onPlay(function () {
      innerAudioContext.stop();
      // 动画
      that.setData({
        isPlay: true,
        animationIsShow: true,
      })
      // 记录全局音频正在播放
      app.globalData.isMicPlay = true;

      // 开始播放的时间戳
      var com_beginTime = Date.parse(new Date()) / 1000;
      //记录到app.js
      app.globalData.micBeginTime = com_beginTime;
      app.globalData.micBeginSkuId = that.data.skuId;
      app.globalData.micBeginCwId = that.data.cwId;
      console.log(that.data.audioData )
      if (that.data.audioData.videoBase){
        console.log(1);
        app.globalData.micBeginMicId = that.data.audioData.videoBase.videoId
      }
      

    })
    // 音频更新
    backgroundAudioManager.onTimeUpdate(function () {
        //总时长
        let maxnum = Math.ceil(backgroundAudioManager.duration); 
        // 播放时长
        let backgroundAudioManagerTime = Math.ceil(backgroundAudioManager.currentTime) || 0;
        // 00:00:00
        let playTime = micObj.sec_to_time(backgroundAudioManagerTime);
        // 00:08:54
        let allPlayTime = micObj.sec_to_time(maxnum);

        that.setData({
          playTime: playTime,
          sliderValue: backgroundAudioManagerTime,
          backgroundAudioManagerTime: backgroundAudioManagerTime,
          sliderMax: maxnum,
          allPlayTime: allPlayTime,
        })

      let num = parseInt(backgroundAudioManager.duration - backgroundAudioManager.currentTime)
      
      if ( num > 0) {
        if ( num == 15 || num < 15) {
          if (that.data.isEnd) {
            return
          } else {
            console.log(num)
            let studyEndObj = {
              skuId: app.globalData.skuId,
              cwId: app.globalData.cwId
            }
            let studyEnd = wx.getStorageSync("studyEnd") || [];
            studyEnd.push(studyEndObj);
            wx.setStorageSync("studyEnd", studyEnd)
            console.log(studyEnd)

            that.setData({
              isEnd: true
            })
          }
        }
      }
    })
    // 监听音乐暂停
    backgroundAudioManager.onPause(function () {
      // 全局记录停止
      app.globalData.isMicPlay = false;
      // wx.setStorageSync("stor_audiotime", 0)

      let com_beginTime = app.globalData.micBeginTime;
      // 结束时长
      let com_overTime = Date.parse(new Date()) / 1000;
      let com_seeTime = com_overTime - com_beginTime;
     
      if (com_beginTime > 0 && com_seeTime > 0 && com_seeTime < 99999 ){
        // 总共看了多少秒
        
        console.log("音频暂停了,总共播放了:" + com_seeTime + "s")
        if (com_seeTime > 0) {
          // playTime所需参数
          let uuids = uuid.create_UUID();//uid

          let skuId = app.globalData.micBeginSkuId;
          let cwId = app.globalData.micBeginCwId;
          let fileId = app.globalData.micBeginMicId; //videoId

          let fileType = 0; //文件类型
          var playTimePoint = parseInt(that.data.backgroundAudioManagerTime) || 0; //播放到什么位置
          app.stopPlayer(uuids, skuId, cwId, fileId, fileType, com_seeTime, playTimePoint)
          app.globalData.micBeginTime = 0;
        }
      }
      
      // 停止动画
      that.setData({
        isPlay: false,
        animationIsShow: false,
        
      })
    })
    // 音频自然播放完成
    backgroundAudioManager.onEnded(function () {
      
      let skuId = that.data.skuId;
      let cwId = that.data.cwId;
      let cwIdArr = that.data.cwIdArr;
      let cwidIndex = cwIdArr[cwIdArr.indexOf(cwId) + 1];
      let list = that.data.SkuCWList;

      let com_beginTime = app.globalData.micBeginTime;
      // 结束时长
      let com_overTime = Date.parse(new Date()) / 1000;
      // 总共看了多少秒
      let com_seeTime = com_overTime - com_beginTime;
      if (com_beginTime > 0 && com_seeTime > 0 && com_seeTime < 99999) {
        
          console.log("音频自然结束了,总共播放了:" + com_seeTime + "s")
          // playTime所需参数
          let uuids = uuid.create_UUID();//uid
          let skuId = app.globalData.micBeginSkuId;
          let cwId = app.globalData.micBeginCwId;
          let fileId = app.globalData.micBeginMicId; //videoId
          let fileType = 0; //文件类型
        var playTimePoint = parseInt(that.data.sliderMax) || 0; 
          app.stopPlayer(uuids, skuId, cwId, fileId, fileType, com_seeTime, playTimePoint)
          that._upDateCwList(skuId)
          app.globalData.micBeginTime = 0;
      }

      let studyEndObj = {
        skuId: app.globalData.skuId,
        cwId: app.globalData.cwId
      }
      let studyEnd = wx.getStorageSync("studyEnd") || [];
      studyEnd.push(studyEndObj);
      wx.setStorageSync("studyEnd", studyEnd)

      if (cwidIndex == undefined) {
        app.showLoading("已经是最后一节了", "none");
        let SkuCwDetailInfo = that.data.SkuCwDetailInfo;
        //重新播放
        that._getPlayUrl(SkuCwDetailInfo.audio_id).then((res) => {

          that.setData({
            video_show: false,
            audioData: res,
            SkuCwDetailInfo: SkuCwDetailInfo,
            cwId: cwId
          })
          backgroundAudioManager.src = res.playInfoList[1].playURL;
          backgroundAudioManager.title = SkuCwDetailInfo.cw_title;
          backgroundAudioManager.startTime = 0;
          backgroundAudioManager.pause();
          app.globalData.skuId = skuId;
          app.globalData.cwId = cwId;
        })
      } else {
        console.log("自然播放完成");
        backgroundAudioManager.stop();
        for (var i = 0; i < list.length; i++) {
          if (list[i].cw_id == cwidIndex) {
            let history_play_time = list[i].history_play_time;
            that._init_data(skuId, cwidIndex, history_play_time)
          }
        }
      }

    })
    // 音频停止
    backgroundAudioManager.onStop(function () {

      // 全局记录停止
      app.globalData.isMicPlay = false;
      wx.setStorageSync("stor_audiotime", 0)

      // 开始时长
      let com_beginTime = app.globalData.micBeginTime;
      // 结束时长
      let com_overTime = Date.parse(new Date()) / 1000;
      // 总共看了多少秒
      let com_seeTime = com_overTime - com_beginTime;

      if (com_beginTime > 0 && com_seeTime > 0 && com_seeTime < 99999 ){
        console.log("音频停止了,总共播放了:" + com_seeTime + "s")
        console.log(that.data.backgroundAudioManagerTime)
        if (com_seeTime > 0) {
          // playTime所需参数
          let uuids = uuid.create_UUID();//uid
          let skuId = app.globalData.micBeginSkuId;
          let cwId = app.globalData.micBeginCwId;
          let fileId = app.globalData.micBeginMicId; //videoId
          let fileType = 0; //文件类型
          var playTimePoint = parseInt(that.data.backgroundAudioManagerTime) || 0; //播放到什么位置
          app.stopPlayer(uuids, skuId, cwId, fileId, fileType, com_seeTime, playTimePoint)
          app.globalData.micBeginTime = 0;
        }
      }
     
     
      
      // 停止动画
      that.setData({
        isPlay: false,
        animationIsShow: false,
      })

    })
    // 跳转操作事件
    backgroundAudioManager.onSeeked(function () {
      console.log(backgroundAudioManager.currentTime);
      console.log(" 跳转");
    })
    // 监听录音播放时
    innerAudioContext.onPlay(function () {
      console.log('语音播放')
      that.videoCl.pause();
      backgroundAudioManager.pause();
    })
    // 监听录音播放完成时
    innerAudioContext.onEnded(() => {
      console.log('语音停止播放')
      that.setData({
        voiceAnimationStatus: -1,
        isLyPaly: false,
      })
      if( that.data.video_show ){
        that.videoCl.play();
      }else{
        backgroundAudioManager.play();
      }
    })
  },
  onReady: function (res) {
    this.videoCl = wx.createVideoContext('myVideo');
  },
  onHide: function () {
    console.log("hide")
    var that = this;
    //停止录音
    innerAudioContext.stop()
    //存储id
    app.globalData.skuId = that.data.skuId
    app.globalData.cwId = that.data.cwId

    if (that.data.video_show) {

      var playTimePoint = parseInt(that.data.video_paly_time) || 0;
      console.log("load视频停止了");
      wx.setStorageSync("playTimePoint", playTimePoint)
      that.setData({
        history_play_time:null
      })
    } else {
      console.log(that.data.backgroundAudioManagerTime)
      wx.setStorageSync("stor_audiotime", that.data.backgroundAudioManagerTime)
    }
  },
  onUnload: function () {
    console.log("unload")
    var that = this;
    //uid
    let uuids = uuid.create_UUID();
    // 页码
    let pageCode = that.data.pageCode;
    //页面开始时间戳
    let beginTime = app.globalData.beginTime;
    //结束时间戳
    let endTime = Date.parse(new Date()) / 1000;
    // skuId
    let skuId = that.data.skuId;
    // type
    let types = "0";
    // cwId
    let cwId = that.data.cwId;
    // 停止录音
    innerAudioContext.stop();
    // 是否在视频页面退出
    if (that.data.video_show) {
      // 视频是否正在播放
      if (that.data.video_isPlay ){
        // 结束时长
        let com_overTime = Date.parse(new Date()) / 1000;
        if (that.data.com_beginTime > 0) {
          // 总共看了多少秒
          let com_seeTime = com_overTime - that.data.com_beginTime;
          // 观看时长大约0才传
          if (com_seeTime > 0 && com_overTime > 0 && com_seeTime < 99999) {
            console.log("视频暂停了,总共播放了:" + com_seeTime + "s")
            // failplaytime所需参数
            let uuids = uuid.create_UUID();
            let skuId = that.data.skuId || "";
            let cwId = that.data.cwId;
            let fileId = that.data.videoData.videoBase.videoId; //videoId
            let fileType = 1; //视频:1 音频：0 文件类型

            var playTimePoint = parseInt(that.data.video_paly_time) || 0; //播放到什么位置

            app.stopPlayer(uuids, skuId, cwId, fileId, fileType, com_seeTime, playTimePoint)
          }
        }
      }

    } else {
      console.log(that.data.backgroundAudioManagerTime)
      wx.setStorageSync("stor_audiotime", that.data.backgroundAudioManagerTime)
      if (!that.data.isPlay){
        backgroundAudioManager.stop();
      }else{
        app.globalData.micAudioManagerTime = that.data.backgroundAudioManagerTime
      }
    }
    app.stopPageViewTime(uuids, pageCode, beginTime, endTime, skuId, types, cwId);
    app.globalData.skuId = that.data.skuId
    app.globalData.cwId = that.data.cwId
    
  },
  // 音视频列表切换
  paly_video_tap: util.repeatFun(function (e) {
    var that = this;
    let SkuCwDetailInfo = that.data.SkuCwDetailInfo;
    let skuId = that.data.skuId;
    let cwId = e.currentTarget.dataset.cwid;
    let cwType = e.currentTarget.dataset.cwtype;
    let progress = e.currentTarget.dataset.progress;//分数
    var history_play_time = e.currentTarget.dataset.historyplaytime;//断点播放时长

    if (cwId == that.data.cwId) {
      app.showLoading("正在播放", "none");
    } else {
      // 考题
      if (cwType == "1") {
        that.stop_mic();
        if ( progress == "未考试" ){
          wx.navigateTo({
            url: '/subPages/checkoutPackage/pages/checkout_detail/checkout_detail?skuId=' + this.data.skuId + "&cwId=" + cwId,
          })
        }else{
          wx.navigateTo({
            url: '/subPages/checkoutPackage/pages/checkout_result/checkout_result?back=1' + "&cwId=" + cwId,
          })
        }
      
      } else {
        // 视频
        if (that.data.video_show == true) {
          that.videoCl.pause();
          that._init_data(skuId, cwId, history_play_time);
          // that._upDateCwList(skuId)   
        } else {
          
          that._init_data(skuId, cwId, history_play_time);
          // that._upDateCwList(skuId)
        }
      }
    }
  },1500),
  // 2.0
  _init_data(skuId, cwId,lastTime) {
    var that = this;
    app.globalData.skuId = skuId;
    app.globalData.cwId = cwId;
    //小节CW基础信息接口
    wx.showLoading({
      title: '加载中',
    })
    app.wxRequest('coreapi/core/v1/querySkuCwDetailInfo',
      { skuId: skuId, cwId: cwId }, 'POST', 
      function (res) {
        if (res.data.code == 0) {
          //页面基本信息数据
          let SkuCwDetailInfo = res.data.data;
          that.setData({
            SkuCwDetailInfo: SkuCwDetailInfo, 
          })
          //如果有video_id的话播放视频
          if (SkuCwDetailInfo.video_id && that.data.video_show) {
          
            app.wxRequest('coreapi/media/v1/getplayallinfo',
              { videoId: SkuCwDetailInfo.video_id }, 'POST', function (res) {
                if (res.data.code == 0) {
                  that.setData({
                    videoData: res.data.data,//video数据
                    SkuCwDetailInfo: SkuCwDetailInfo, //页面基本信息数据
                    video_paly_time: lastTime, //最后播放时长
                  })
                   wx.hideLoading()
                }
            })
            // 音频
          } else {
            console.log("音频")
            backgroundAudioManager.stop();
            app.wxRequest('coreapi/media/v1/getplayallinfo',
              { videoId: SkuCwDetailInfo.audio_id }, 'POST', function (res) {
                if (res.data.code == 0) {
                  that.setData({
                    video_show: false,
                    audioData: res.data.data
                  })
                  
                  backgroundAudioManager.src = res.data.data.playInfoList[1].playURL;
                  backgroundAudioManager.title = SkuCwDetailInfo.cw_title;
                  backgroundAudioManager.startTime = lastTime;
                  wx.hideLoading()
                }
            })
          }

        } else {
          app.showLoading(res.data.msg, "none");
        }
    })
    // CW笔记信息接口
    app.wxRequest('coreapi/core/v1/querySkuCwNoteList',
      { skuId: skuId, cwId: cwId, size: 5, skip:0 }, 'POST', function (res) {
        if (res.data.code == 0) {
          
          that.setData({
              SkuCwNoteList: res.data.data //笔记信息
          })
        } else {
          app.showLoading(res.data.msg, "none");
        }

    })
    // CW信息列表接口
    app.wxRequest('coreapi/core/v1/querySkuCWList',
      { skuId: skuId }, 'POST', function (res) {
        let list = res.data.data;
        let arr = [];
        // 遍历删除考题，取出所有cwid留着上下曲用
        for (var i = 0; i < list.length; i++) {
          if (list[i].cw_type == "0") {
            arr.push(list[i].cw_id);
          }
        }
        // console.log(arr);
        that.setData({
          SkuCWList: list,
          cwIdArr: arr,
          cwId: cwId,
          isEnd: false
        })
    })
  },
  // 获取音视频url
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

  // ——————————————————————音频类——————————————————————————————
  // 音乐播放
  playTap:function () {
    backgroundAudioManager.play();
  }, 
  //音频暂停
  pauseTap: function () {
    backgroundAudioManager.pause();
  },
  // 进度条滑动
  bindchange: function (e) {
   
    wx.seekBackgroundAudio({
      position: e.detail.value
    })

    backgroundAudioManager.seek(e.detail.value)

    this.setData({
      sliderValue: e.detail.value,
    });
  },
  //音频播放
  backgroundAudioManager_play: function (src, title) {
    var that = this;
    let backgroundAudioManagerTime = that.data.backgroundAudioManagerTime;

    if (backgroundAudioManagerTime == null) {
      backgroundAudioManager.src = src
      backgroundAudioManager.title = title;
      backgroundAudioManager.startTime = 0;
    } else {
      console.log("有播放时长")
      backgroundAudioManager.src = src
      backgroundAudioManager.title = title;
      backgroundAudioManager.startTime = backgroundAudioManagerTime;
    }


  },
  //去看视频
  goVideo: function () {
    var that = this;
    //uid
    let uuids = uuid.create_UUID();
    // 页码
    let pageCode = that.data.pageCode;
    //页面开始时间戳
    let beginTime = app.globalData.beginTime;
    //结束时间戳
    let endTime = Date.parse(new Date()) / 1000;
    // skuId
    let skuId = that.data.skuId;
    // type
    let types = "0";
    // cwId
    let cwId = that.data.cwId;
    //  音频code
    let newCode = parseInt(pageCode) - 3;
  
    let SkuCwDetailInfo = that.data.SkuCwDetailInfo;
    if (!SkuCwDetailInfo.video_id) {
      app.showLoading("本小节暂无视频", 'none')
    } else {
      backgroundAudioManager.stop();

      that._getPlayUrl(SkuCwDetailInfo.video_id).then((res) => {
        app.stopPageViewTime(uuids, pageCode, beginTime, endTime, skuId, types, cwId);
        that.setData({
          videoData: res,
          video_show: true,
          video_paly_time: that.data.backgroundAudioManagerTime,
          pageCode: String(newCode)
        })
      })
    }

  }, 
  // 音频上下一曲 playTime没加
  nextTap:util.repeatFun(function (e) {
    const that = this;
    let types = e.currentTarget.dataset.type;
    let cwId = that.data.cwId;
    let cwIdArr = that.data.cwIdArr;
    let skuId = that.data.skuId;
    let list = that.data.SkuCWList;

    let com_beginTime = app.globalData.micBeginTime;
    let com_overTime = Date.parse(new Date()) / 1000;
    let com_seeTime = com_overTime - com_beginTime;

    if (com_beginTime > 0 && com_seeTime > 0 && com_seeTime < 99999) {
      // 总共看了多少秒
      console.log("音频切换了,总共播放了:" + com_seeTime + "s")
      if (com_seeTime > 0) {
        // playTime所需参数
        let uuids = uuid.create_UUID();//uid

        let skuId = app.globalData.micBeginSkuId;
        let cwId = app.globalData.micBeginCwId;
        let fileId = app.globalData.micBeginMicId; //videoId

        let fileType = 0; //文件类型
        var playTimePoint = parseInt(that.data.backgroundAudioManagerTime) || 0; //播放到什么位置
        app.stopPlayer(uuids, skuId, cwId, fileId, fileType, com_seeTime, playTimePoint)
        app.globalData.micBeginTime = 0;
      }
    }

    // 上一曲
    if (types == "-1") {
      let cwidIndex = cwIdArr[cwIdArr.indexOf(cwId) - 1];
      if (cwidIndex == undefined) {
        app.showLoading("已经是第一小结了", "none")
      } else {

        for (var i = 0; i < list.length; i++) {
          if (list[i].cw_id == cwidIndex) {
            let history_play_time = list[i].history_play_time;
            that._init_data(skuId, cwidIndex, history_play_time)
          }
        }
        that._upDateCwList(skuId) 
      }
    } else {
      let cwidIndex = cwIdArr[cwIdArr.indexOf(cwId) + 1];
      console.log(cwidIndex)
      if (cwidIndex == undefined) {
        app.showLoading("已经是最后一节了", "none")
      } else {
        // 下一曲
        for (var i = 0; i < list.length; i++) {
          if (list[i].cw_id == cwidIndex) {
            let history_play_time = list[i].history_play_time;
            that._init_data(skuId, cwidIndex, history_play_time)
          }
        }
        that._upDateCwList(skuId) 
      }
    }
  },1500), 

  // ——————————————————————视频类——————————————————————————————

  // 视频播放
  videoPlay: function () {
    var that = this;
    if( that.data.video_isPlay == false ){
      // 录音停止
      innerAudioContext.stop();
      console.log("走一次视频播放")
      //音频停止
      backgroundAudioManager.stop();
      app.globalData.isMicPlay = false;

      // 开始播放的时间戳
      var com_beginTime = Date.parse(new Date()) / 1000;

      // 获取播放时长
      let video_paly_time = that.data.video_paly_time;

      this.setData({
        com_beginTime: com_beginTime,
        video_isPlay: true
      })
    }
    
  },
  // 视频暂停
  videoPause: function (e) {
    console.log("视频暂停了")
    var that = this;
    // 结束时长
    let com_overTime = Date.parse(new Date()) / 1000;
   
    if( that.data.video_show ){
      if (that.data.com_beginTime > 0) {
        // 总共看了多少秒
        let com_seeTime = com_overTime - that.data.com_beginTime;
        // 观看时长大约0才传
        if (com_seeTime > 0 && com_overTime > 0 && com_seeTime < 99999) {
          console.log("视频暂停了,总共播放了:" + com_seeTime + "s")
          // failplaytime所需参数
          let uuids = uuid.create_UUID();
          let skuId = that.data.skuId || "";
          let cwId = that.data.cwId;
          let fileId = that.data.videoData.videoBase.videoId; //videoId
          let fileType = 1; //视频:1 音频：0 文件类型

          var playTimePoint = parseInt(that.data.video_paly_time) || 0; //播放到什么位置
          app.stopPlayer(uuids, skuId, cwId, fileId, fileType, com_seeTime, playTimePoint)
          
        }
      }

      that.setData({
        backgroundAudioManagerTime: that.data.video_paly_time,
        video_isPlay: false,
        com_beginTime:0
      })
    }
    
  },
  // 监听视频播放进度
  videoChange: function (e) {
    var that = this;
    let cwIdArr = that.data.cwIdArr;//cw数据用于上下曲切换
    let list = that.data.SkuCWList;//cw课程列表
    let cwId = that.data.cwId
    let skuId = that.data.skuId;
   
    that.setData({
      video_paly_time: e.detail.currentTime //更新播放时长
    })
    // 判断播放完毕的时候
    let num = parseInt(e.detail.duration - e.detail.currentTime);
    
    if (num == 1) {
      // 下一节cwid
      that.videoCl.pause();
      let fileTimeArr = wx.getStorageSync("fileTimeArr")
      if (fileTimeArr == "" ){
        // 结束时长
        let com_overTime = Date.parse(new Date()) / 1000;
        // 总共看了多少秒
        let com_seeTime = com_overTime - that.data.com_beginTime;
        if (com_seeTime > 0 && com_seeTime < 9999) {
          // failplaytime所需参数
          let uuids = uuid.create_UUID();
          let skuId = that.data.skuId || "";
          let cwId = that.data.cwId;
          let fileId = that.data.videoData.videoBase.videoId; //videoId
          let fileType = 1; //视频:1 音频：0 文件类型
          let playTimePoint = parseInt(that.data.video_paly_time) || 0; //播放到什么位置
          
          if (fileTimeArr != "" ){
            if (fileTimeArr[0].cwId != cwId) {
              app.stopPlayer(uuids, skuId, cwId, fileId, fileType, com_seeTime, playTimePoint)
            }
          }

        }

        let cwidIndex = cwIdArr[cwIdArr.indexOf(cwId) + 1];
        if (cwidIndex != undefined) {
         
          for (var i = 0; i < list.length; i++) {
            if (list[i].cw_id == cwidIndex) {
              let skuId = that.data.skuId;
              let cwId = list[i].cw_id
              let history_play_time = list[i].history_play_time
              // 请求一遍数据
              that._init_data(skuId, cwId, history_play_time);
              that._upDateCwList(skuId)
              return false;
            }
          }

        } else {
          app.showLoading("最后一节", "none");
        }
      }
     
    }

    if (num == 15 || num < 15) {
     
      if (that.data.isEnd) {
       return false;
      } else {
        // 最后15秒
        let studyEndObj = {
          skuId: skuId,
          cwId: cwId
        }
        let studyEnd = wx.getStorageSync("studyEnd") || [];
        studyEnd.push(studyEndObj);
        wx.setStorageSync("studyEnd", studyEnd)

        that.setData({
          isEnd: true
        })
      }
      
    }
  },
  // 去听音频
  goMic: function () {
    var that = this;
    //uid
    let uuids = uuid.create_UUID();
    // 页码
    let pageCode = that.data.pageCode;
    //页面开始时间戳
    let beginTime = app.globalData.beginTime;
    //结束时间戳
    let endTime = Date.parse(new Date()) / 1000;
    // skuId
    let skuId = that.data.skuId;
    // type
    let types = "0";
    // cwId
    let cwId = that.data.cwId;
    //  音频code
    let newCode = parseInt(pageCode) + 3;
    // 页面基本内容数据
    let SkuCwDetailInfo = that.data.SkuCwDetailInfo;
    // 获取音频
    if (SkuCwDetailInfo.audio_id ){
      //让视频停止
      if ( that.data.video_isPlay ){
        that.videoCl.pause();
      }
      app.wxRequest('coreapi/media/v1/getplayallinfo',
      { videoId: SkuCwDetailInfo.audio_id }, 'POST', function (res) {
        if (res.data.code == 0) {
          app.stopPageViewTime(
            uuids, pageCode, beginTime, endTime, skuId, types, cwId
          );
          that.setData({
            video_show: false,
            audioData: res.data.data,
            video_isPlay: false,
            pageCode: String(newCode)
          })
         
          backgroundAudioManager.src = res.data.data.playInfoList[1].playURL;
          backgroundAudioManager.title = SkuCwDetailInfo.cw_title;
          backgroundAudioManager.startTime = that.data.video_paly_time;
        }
      })
      
    }else{
      app.showLoading("本小节暂无音频","none")
    }

    
  
  },
  _studyEnd: function (skuId,cwId){
    app.wxRequest("coreapi/core/v1/userStudyEndCW",
      { skuId: skuId, cwId: cwId,  }, "POST", function (res) {

        if (res.data.code == 0) {

        } else {
          app.showLoading(res.data.msg, "none");
        }
      })
  },
  // 刷新播放列表
  _upDateCwList: function (skuId){
    let that = this;
    setTimeout(function () {
      console.log("刷新")
      // CW信息列表
      app.wxRequest("coreapi/core/v1/querySkuCWList",
        { skuId:skuId }, "POST", function (res) {
          if (res.data.code == 0) {
            let SkuCWList = res.data.data;
            that.setData({
              SkuCWList: SkuCWList
            })

          } else {
            app.showLoading(res.data.msg, "none");
          }
      })
    }, 3000)
  },


  


  // 停止
  stop: function () {
    var that = this;
    backgroundAudioManager.stop();
    that.setData({
      isPlay: false,
      animationIsShow: false,
      backgroundAudioManagerTime: null,
      sliderValue: 0,
      playTime: "00:00",
    });
  },
  // 暂停音视频播放
  stop_mic() {
    var that = this;
    backgroundAudioManager.pause();
    that.setData({
      isPlay: false,
      animationIsShow: false
    });
  },
  // 去笔记
  go_notes: function () {
    var that = this;
    let skuId = that.data.skuId;
    let cwId = that.data.cwId;

    if( that.data.video_show ){
      // that.videoCl.pause();
      that.setData({
        history_play_time: that.data.video_paly_time,
      })
    
    }else{
      backgroundAudioManager.pause();
      app.globalData.isMicPlay = false;
      that.setData({
        history_play_time: that.data.backgroundAudioManagerTime
      })
    } 

    wx.navigateTo({
      url: '../../studyPackage/writeNotes/writeNotes?skuId=' + skuId + "&cwId=" + cwId + "&history_play_time="+that.data.video_paly_time
    })


  },
  // 播放语音
  paly_ly: function (e) {
    const that = this;
    let isLyPaly = that.data.isLyPaly;
    let audio_id = e.currentTarget.dataset.audioid
    let idx = e.currentTarget.dataset.idx

    if (isLyPaly && idx == that.data.voiceAnimationStatus) {
      innerAudioContext.stop()
      that.setData({
        voiceAnimationStatus: -1,
        isLyPaly: false
      })
    } else {
      backgroundAudioManager.pause();
      that.videoCl.pause();
      app.globalData.isMicPlay = false;
      that.setData({
        voiceAnimationStatus: idx,
        isLyPaly: true,
      })
      app.getMicUrl(audio_id, innerAudioContext)
    }

  },
  // 转载
  addNotes: function (e) {
    var that = this;
    let linkId = e.currentTarget.dataset.linkid;
    let linkType = e.currentTarget.dataset.authortype;
    app.wxRequest('coreapi/core/v1/addUserNote',
      { linkId: linkId, linkType: linkType }, 'POST', function (res) {
        if (res.data.code == 0) {
          if (res.data.data.actionResult == "1") {
            app.showLoading("转载成功", "none")
          }else{
            app.showLoading("转载失败", "none")
          }
        } else {
          app.showLoading(res.data.msg, "none")
        }
      })
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
  // 去主页
  go_mine:function(e){
    let authortype = e.currentTarget.dataset.authortype;
    let authorid = e.currentTarget.dataset.authorid;
    console.log(authortype)
    if (authortype == "0"){
      wx.navigateTo({
        url: '/subPages/societyPackage/pages/follow_details/follow_details?viewUserId=' + authorid
      })
    }else{
      wx.navigateTo({
        url: '/subPages/societyPackage/pages/recommend_details/recommend_details?teacherId=' + authorid
      })
    }
  },
  // 资料
  dataTap: function () {
    var that = this;
    // 视频还是音频
    let video_show = that.data.video_show;
    //uid
    let uuids = uuid.create_UUID();
    // 页码
    let pageCode = that.data.pageCode;
    //页面开始时间戳
    let beginTime = app.globalData.beginTime;
    //结束时间戳
    let endTime = Date.parse(new Date()) / 1000;
    // skuId
    let skuId = that.data.skuId;
    // type
    let types = "0";
    // cwId
    let cwId = that.data.cwId;

    if (video_show) {
      if (pageCode != "2008") {
        app.stopPageViewTime(uuids, pageCode, beginTime, endTime, skuId, types, cwId);
        that.setData({
          studyTab: 0,
          pageCode: "2008"
        })
      }

    } else {
      if (pageCode != "2011") {
        app.stopPageViewTime(uuids, pageCode, beginTime, endTime, skuId, types, cwId);
        that.setData({
          studyTab: 0,
          pageCode: "2011"
        })
      }
    }
    //重新计时
    let viewTime = app.globalData.viewTime;
    app.onPageViewTime(viewTime)
  },
  // 笔记table
  notesTap: function () {
    var that = this;
    // 视频还是音频
    let video_show = that.data.video_show;
    //uid
    let uuids = uuid.create_UUID();
    // 页码
    let pageCode = that.data.pageCode;
    //页面开始时间戳
    let beginTime = app.globalData.beginTime;
    //结束时间戳
    let endTime = Date.parse(new Date()) / 1000;
    // skuId
    let skuId = that.data.skuId;
    // type
    let types = "0";
    // cwId
    let cwId = that.data.cwId;

    if ( video_show ) {
      if (pageCode != "2009" ){
        app.stopPageViewTime(uuids, pageCode, beginTime, endTime, skuId, types, cwId);
        that.setData({
          studyTab: 1,
          pageCode: "2009"
        })
      }
      
    } else {
      if (pageCode != "2012") {
        app.stopPageViewTime(uuids, pageCode, beginTime, endTime, skuId, types, cwId);
        that.setData({
          studyTab: 1,
          pageCode: "2012"
        })
      }
    }
    //重新计时
    let viewTime = app.globalData.viewTime;
    app.onPageViewTime(viewTime)
  },
  // 课程列表
  listTap: function () {
    var that = this;
    // 视频还是音频
    let video_show = that.data.video_show;
    //uid
    let uuids = uuid.create_UUID();
    // 页码
    let pageCode = that.data.pageCode;
    //页面开始时间戳
    let beginTime = app.globalData.beginTime;
    //结束时间戳
    let endTime = Date.parse(new Date()) / 1000;
    // skuId
    let skuId = that.data.skuId;
    // type
    let types = "0";
    // cwId
    let cwId = that.data.cwId;

    if (video_show) {
      if (pageCode != "2010" ){
        app.stopPageViewTime(uuids, pageCode, beginTime, endTime, skuId, types, cwId);
        that.setData({
          studyTab: 2,
          pageCode: "2010"
        })
      }
      
    } else {
      if (pageCode != "2013") {
        app.stopPageViewTime(uuids, pageCode, beginTime, endTime, skuId, types, cwId);
        that.setData({
          studyTab: 2,
          pageCode: "2013"
        })
      }
    }
    //重新计时
    let viewTime = app.globalData.viewTime;
    app.onPageViewTime(viewTime)
  },
  onShareAppMessage: function (res) {
    let that = this;
    let skuId = that.data.skuId;
    let cwId = that.data.cwId;
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    let str = "《" + that.data.SkuCwDetailInfo.sku_title + "》"
    return {
      title: str + '让我深有感悟分享给你我的笔记，我们一起学习进步~',
      path: '/pages/school/school?skuId=' + skuId + "&cwId=" + cwId,
    }
  },
  // 新手指导浮层点击
  isFirstTap() {
    let isFirst = wx.getStorageSync("isFirst") || {};
    isFirst.detailStatus = true;
    wx.setStorageSync("isFirst", isFirst)
    this.setData({
      isFirstStatus: false
    })
  },
  // 在展开全部
  allTap: function () {
    wx.showLoading({
      title: '加载中',
    })
    var that = this;
    let skuId = that.data.skuId;
    let size = that.data.cwListSize;
    let skip = that.data.cwListSkip;
    let skuCWList = that.data.SkuCWList

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
              SkuCWList: skuCWList,
              cwListSkip: skip + 10
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
  // 播放错误时
  errorVideo:function(){
    app.showLoading("视频播放错误","none")
    this.setData({
      video_isPlay:false
    })
  },
  waitingVideo:function(){
    app.showLoading("正在努力加载", "none");
  },
})