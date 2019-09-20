const app = getApp();
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
    }
    return t;
  },
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
  userSeeImgFun: function (that, time) {
    userSeeImg = setTimeout(function () {
      time++;

      micObj.userSeeImgFun(that, time);
      that.setData({
        userSeeImg: time
      });
      console.log("我是浏览图文时间:" + time);
    }, 1000)
  },
  userSeeVideoFun: function (that, time) {
    userrSeeVideoFun = setTimeout(function () {
      time++;
      micObj.userrSeeVideoFun(that, time);
      that.setData({
        userSeeVideoFun: time
      });
      console.log("我是浏览视频时间:" + time);
    }, 1000)
  },
}

Page({
  data: {
    voiceAnimationStatus: -1,//语音动画状态码
    voiceAnimation: false,//语音动画
    isAll: false,//笔记是否展开
    studyTab: 1,//header切换
    video_show: true,//视频播放
    micStatus: 0,//音频播放状态
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
    comtTime: "",//音视频公用时长
    cwId: "",
    skuId: "",
    size: 10,//每页显示的数量
    skip: 10,//位置
  },
  onLoad: function (options) {
    var that = this;

    that.setData({
      skuId: options.skuId,
      cwId: options.cwId
    })

    // CW信息列表接口
    app.wxRequest('coreapi/core/v1/querySkuCWList',
      { skuId: options.skuId }, 'POST', function (res) {
        let list = res.data.data;
        let arr = [];
        // 遍历删除考题，取出所有cwid留着上下曲用
        for (var i = 0; i < list.length; i++) {
          if (list[i].cw_type == "0") {
            arr.push(list[i].cw_id);
          }
        }
        console.log(arr);
        that.setData({
          SkuCWList: list,
          cwIdArr: arr
        })
    })
    that._init_data(options.skuId, options.cwId);
  },
  onShow: function () {
    var that = this;
    // 监听更新
    backgroundAudioManager.onTimeUpdate(function () {

      let maxnum = Math.ceil(backgroundAudioManager.duration); //总时长
      let backgroundAudioManagerTime = Math.ceil(backgroundAudioManager.currentTime) || null;//播放时长
      let playTime = micObj.sec_to_time(backgroundAudioManagerTime);
      let allPlayTime = micObj.sec_to_time(maxnum);

      if (!backgroundAudioManagerTime) {
        // app.showLoading("正在加载", 'loading');
      } else {
        that.setData({
          playTime: playTime,
          sliderValue: backgroundAudioManagerTime,
          backgroundAudioManagerTime: backgroundAudioManagerTime,
          sliderMax: maxnum,
          allPlayTime: allPlayTime,
        })
      }

    })
    // 监听音乐播放
    backgroundAudioManager.onPlay(function () {
      // 动画
      that.setData({
        isPlay: true,
        animationIsShow: true,
      })
    })
    // 监听音乐暂停
    backgroundAudioManager.onPause(function () {
      that.setData({
        isPlay: false,
        animationIsShow: false
      })
    })
    // 音频自然播放完成
    backgroundAudioManager.onEnded(function () {
      app.showLoading("试听完毕", "none");
      that._init_data(that.data.skuId, that.data.cwId);
      that.setData({
        isPlay: false,
        animationIsShow: false,
        sliderValue: 0,
        backgroundAudioManagerTime: 0,
        playTime: "00:00:00",
      })
    
    })
  
  },
  onReady: function (res) {
    this.videoCl = wx.createVideoContext('myVideo');
  },
  onHide:function(){
   
  },
  onUnload:function(){
    backgroundAudioManager.stop();
  },
  // 音视频列表切换
  paly_video_tap: function (e) {
    var that = this;
    let cwId = e.currentTarget.dataset.cwid;
    let is_free = e.currentTarget.dataset.isfree;
    if (cwId == that.data.cwId) {
      app.showLoading("正在播放", "none");
    } else {
      if (is_free == "0" ){
        app.showLoading("购买后才能查看全集", "none")
      }else{
        that._init_data(that.data.skuId, cwId);
      }
      
    }
  },
  // 2.0
  _init_data(skuId, cwId) {
    var that = this;
    //小节CW基础信息接口
    app.wxRequest('coreapi/core/v1/querySkuCwDetailInfo',
      { skuId: skuId, cwId: cwId }, 'POST', function (res) {
        let SkuCwDetailInfo = res.data.data;

        that.setData({
          SkuCwDetailInfo: SkuCwDetailInfo,
          cwId: cwId
        })

        // 视频
        if (SkuCwDetailInfo.video_id && that.data.video_show) {
          that._getPlayUrl(SkuCwDetailInfo.video_id).then((res) => {
            that.setData({
              videoData: res,
              SkuCwDetailInfo: SkuCwDetailInfo
            })

          })
          // 音频
        } else {
          console.log("我是请求音乐的");
          that._getPlayUrl(SkuCwDetailInfo.audio_id).then((res) => {
            console.log(res);
            backgroundAudioManager.src = res.playInfoList[1].playURL;
            backgroundAudioManager.title = SkuCwDetailInfo.cw_title;
            that.setData({
              video_show: false,
              audioData: res,
              SkuCwDetailInfo: SkuCwDetailInfo,
              isPlay: true,//是否正在播放
              animationIsShow: true,//转圈动画化
              backgroundAudioManagerTime: null,//背景音乐播放时间
            })

          })
        }

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
  // 音乐播放
  playTap: util.repeatFun(function (e) {
    var that = this;
    backgroundAudioManager.play();
  }, 1000),
  //音频暂停
  pauseTap: util.repeatFun(function (e) {
    var that = this;
    backgroundAudioManager.pause();
    
  }, 1000),
  // 停止
  stop: function () {
    var that = this;
    backgroundAudioManager.stop();
    that.setData({
      isPlay: false,
      animationIsShow: false,
      backgroundAudioManagerTime: null,
      sliderValue: 0,
      playTime: "00:00:00",
    });
  },
  // 进度条滑动
  bindchange: function (e) {
    wx.seekBackgroundAudio({
      position: e.detail.value
    })
    backgroundAudioManager.seek(e.detail.value)
    this.setData({
      sliderValue: e.detail.value
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
    app.globalData.isMicPlay = true;

  },

  // ——————————————————————视频类——————————————————————————————
  // 视频播放
  videoPlay: function () {
    var that = this;
    if (that.data.video_isPlay == false) {
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

    if (that.data.video_show) {
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
        com_beginTime: 0
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
      if (fileTimeArr == "") {
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

          if (fileTimeArr != "") {
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
  
  _studyEnd: function (skuId, cwId) {
    app.wxRequest("coreapi/core/v1/userStudyEndCW",
      { skuId: skuId, cwId: cwId, }, "POST", function (res) {

        if (res.data.code == 0) {

        } else {
          app.showLoading(res.data.msg, "none");
        }
      })
  },
  // 刷新播放列表
  _upDateCwList: function (skuId) {
    let that = this;
    setTimeout(function () {
      console.log("刷新")
      // CW信息列表
      app.wxRequest("coreapi/core/v1/querySkuCWList",
        { skuId: skuId }, "POST", function (res) {
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

  // 音频下一曲
  nextTap: function (e) {
   
    var that = this;
    let types = e.currentTarget.dataset.type;
    let SkuCWList = that.data.SkuCWList;
    for (var i = 0; i < SkuCWList.length;i++ ){
      if (SkuCWList[i].is_free == "1" ){
        if (that.data.cwId != SkuCWList[i].cw_id ){
          backgroundAudioManager.stop();
          that._init_data(that.data.skuId, SkuCWList[i].cw_id);
          return false;
        }else{
          app.showLoading("购买后查看全集","none")
        }
      }
    }
  },
  // 去听音频
  goMic: function () {
    var that = this;
    let backgroundAudioManagerTime = that.data.backgroundAudioManagerTime;

    let SkuCwDetailInfo = that.data.SkuCwDetailInfo;
    that.videoCl.pause();

    that._getPlayUrl(SkuCwDetailInfo.video_id).then((res) => {

      that.setData({
        videoData: res,
        isPlay: true,
        animationIsShow: true,
        backgroundAudioManagerTime: null,
        video_show: !that.data.video_show
      })

      if (backgroundAudioManagerTime == null) {
        backgroundAudioManager.src = res.playInfoList[1].playURL;
        backgroundAudioManager.title = SkuCwDetailInfo.cw_title;
        backgroundAudioManager.startTime = 0;
      }


    })
  },
  //  去看视频
  goVideo: function () {
    var that = this;

    let SkuCwDetailInfo = that.data.SkuCwDetailInfo;
    if (!SkuCwDetailInfo.video_id) {
      app.showLoading("本小节暂无视频", 'none')
    } else {
      backgroundAudioManager.stop();
      that._getPlayUrl(SkuCwDetailInfo.video_id).then((res) => {
        that.setData({
          videoData: res,
          video_show: !that.data.video_show
        })
      })
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
})