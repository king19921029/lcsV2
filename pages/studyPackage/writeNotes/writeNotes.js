const recorderManager = wx.getRecorderManager();
const innerAudioContext = wx.createInnerAudioContext();
// 音频
const backgroundAudioManager = wx.getBackgroundAudioManager();
const util = require('../../../utils/repetitionTap.js');
const app = getApp();
var setIntervalTime = "";
Page({
  data: {
    isDisabled:false,
    isPlay:false,
    tempFilePath: null,//录音完成的url
    time:0,//定时器
    audioId:"",
    recorderManagerStatus: 0,//录音状态
    recorderManagerDuration:null,
    interval:false,//录音计数器
    voiceAnimation:false,//语音动画
    photoArr:[],//照片数组
    photoBox: false,//照片盒子
    voiceBox:false,//语音盒子
    voiceX:true,//语音X号
    user_notes:{
      font:"",
    },//用户笔记
    dialog:false,//弹窗
    isShare:true,//是否公开
    skuId:"",
    cwId:"",
    isEnd:true,
    isSet:true,//是否第一次保存笔记
  },
  onLoad: function (option) {
    console.log(option)
    this.setData({
      skuId: option.skuId,
      cwId: option.cwId
    })
  },
  onShow: function () {
    var that = this;
    app.clearTimeoutFun();
    // 监听录音播放完成时
    innerAudioContext.onEnded(() => {
      console.log('停止播放')
      this.setData({
        voiceAnimation: false
      })
    })
    // 监听录音录制完成时
    recorderManager.onStop((res) => {
      that.stop();
      const header = app.globalData.header;
      const url = app.globalData.url;
      wx.showLoading({
        title: '上传中'
      })
      wx.uploadFile({
        url: url + '/coreapi/core/v1/uploadAudioFile',
        filePath: res.tempFilePath,
        header: header,
        name: 'fileField',
        success(data) {
          let urlData = JSON.parse(data.data);
          if (urlData.code == 0) {
            wx.hideLoading();
            that.setData({
              tempFilePath: res.tempFilePath,
              audioId: urlData.data,
              recorderManagerStatus: 3,
              recorderManagerDuration: parseInt(res.duration / 1000),
              time: parseInt(res.duration / 1000)
            })
          } else {
            app.showLoading(urlData.msg, "none")
          }

        }
      })
      console.log('停止录音', res.tempFilePath)
    })

    let user_notes = wx.getStorageSync("user_notes")    
    if (that.data.cwId == user_notes.cwId ){
      that.setData({
        user_notes: user_notes.font,
        dialog:true
      })
    }else{
      that.setData({
        user_notes:""
      })
      wx.removeStorageSync("user_notes")
    }
   
    
    
  },
  onHide:function(){
    recorderManager.stop();
    clearInterval(setIntervalTime);
  },
  onUnload:function(){
    var that = this;
    let font = that.data.user_notes
    recorderManager.stop();
    clearInterval(setIntervalTime);

    if (that.data.user_notes != "" && that.data.isEnd ){
      let user_notes_font = {
        font: font,
        cwId: that.data.cwId
      }
      wx.setStorageSync("user_notes", user_notes_font)
    }
   
  },
  bindfocusTap:function(res){
    this.setData({
      keyboardIsShow: true,
      voiceBox:false
    })
  },
  bindblurTap:function(){
    this.setData({
      keyboardIsShow: false
    })
  },
  // 保存笔记
  saveNotes: function () {
    var that = this;
    that.setData({
      isDisabled: true
    })
    // 笔记内容 必传
    let content = that.data.user_notes;
    // 语音ID
    let audioId = that.data.audioId || "";
    // 语音时长
    let audioTime = that.data.recorderManagerDuration || "";
    // 是否公开 必传
    var isShare = "";
    if (that.data.isShare == true) {
      isShare = 1
    } else {
      isShare = 0
    }
    let skuId = that.data.skuId;
    let cwId = that.data.cwId;
    // 照片
    let photoArr = that.data.photoArr;
    console.log(photoArr)
    let picUrl1 = photoArr[0] || ""
    let picUrl2 = photoArr[1] || ""
    let picUrl3 = photoArr[2] || ""

    if (content == "" && picUrl1 == "" && audioId == "" ){
      app.showLoading("请填写笔记内容","none");
      that.setData({
        isDisabled: false
      })
      return false;
    }
    if ( that.data.isSet ){
      // SKU基础信息
      app.wxRequest("coreapi/core/v1/addUserNote",
        {
          content: content,
          isShare: isShare,
          skuId: skuId,
          cwId: cwId,
          audioId: audioId,
          audioTime: audioTime,
          picUrl1: picUrl1,
          picUrl2: picUrl2,
          picUrl3: picUrl3,

        }, "POST", function (res) {
          console.log(res.data.data)
          if (res.data.code == 0) {
            if (res.data.data.actionResult == 1) {
              that.setData({
                isEnd: false,
                isSet:false,
                // isDisabled: false
              })
              app.showLoading("保存成功", "success");
              wx.navigateBack();
            }
          } else {
            app.showLoading(res.data.msg, "none");
          }
      })
    }
   

  },
  // 编写笔记
  userSay:function(e){
    var that = this;
    let user_notes = e.detail.value;
    that.data.user_notes = e.detail.value;
  },
  // 确认
  onGetBind1:function(){
    wx.removeStorageSync('user_notes')
    this.setData({
      dialog: false,
      user_notes:""
    })
  },
  // 取消
  onGetBind2: function () {
    this.setData({
      dialog:false
    })
    wx.removeStorageSync('user_notes')
  },
  //开始录音的时候
  start: util.repeatFun(function (e) {
    var that = this;
    const options = {
      duration: 120000,//指定录音的时长，单位 ms
      sampleRate: 16000,//采样率
      numberOfChannels: 1,//录音通道数
      encodeBitRate: 96000,//编码码率
      format: 'mp3',//音频格式，有效值 aac/mp3
      frameSize: 50,//指定帧大小，单位 KB
      audioSource: "auto"
    }
    //开始录音
    recorderManager.start(options);
    recorderManager.onStart(() => {

    });

    //错误回调
    recorderManager.onError((res) => {
      console.log(res);
    })

    if (!that.data.interval) {
      that.data.interval = true;
      setIntervalTime = setInterval(function () {
        that.startTime();
      }, 1000)
    } else {
      return false;
    }
  }, 300),
  //停止录音
  stop: function () {
    console.log(this.data.time)
    if (this.data.time < 2 ){
      app.showLoading("多录一会吧",'none')
    }else{
      recorderManager.stop();
      clearInterval(setIntervalTime);
    }
    
  },
  //播放声音
  paly_ly: function (e) {
    var that = this;
    let url = e.currentTarget.dataset.tempfilepath;
    innerAudioContext.src = url;
    innerAudioContext.play()
    this.setData({
      voiceAnimation: true
    })

  },

  // 录音时长
  startTime() {
    let time = this.data.time;
    this.setData({
      time: time + 1,
      recorderManagerStatus: 1
    })
  },
  //删除录音
  deleteMic: function () {
    innerAudioContext.stop();
    this.setData({
      recorderManagerDuration: null,
      interval: false,
      time: 0,
      recorderManagerStatus: 0,
    })
  },
  // 保存录音
  saveMicTap:function(){
    var that = this;
    that.setData({
      voiceBox: false,
      keyboardIsShow: false,
    })
  },
  //插入图片
  phontTap: function () {
    var that = this;
    let photoArr = that.data.photoArr;
    if (photoArr.length == 3) {
      app.showLoading("最多能上传三张", "none")
    } else {
      let user_notes = that.data.user_notes;
      const header = app.globalData.header;
      const url = app.globalData.url;
      wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success(res) {
          wx.showLoading({
            title: '上传中'
          })
          const tempFilePaths = res.tempFilePaths
          wx.uploadFile({
            url: url + '/coreapi/core/v1/uploadImageFile',
            // url: url + '/core/v1/uploadImageFile',
            filePath: tempFilePaths[0],
            header: header,
            name: 'fileField',
            success(res) {
              let urlData = JSON.parse(res.data);
              if (urlData.code == 0) {
                photoArr.push(urlData.data)
                wx.hideLoading();
                that.setData({
                  photoArr: photoArr,
                  photoBox: true,
                  user_notes: user_notes
                })
              } else {
                app.showLoading(urlData.msg, "none")
              }

            }
          })
         
        }
      })
      
    }

  },
  //删除图片
  deleteImg: function (e) {
    let idx = e.currentTarget.dataset.idx;
    let photoArr = this.data.photoArr;
    photoArr.splice(idx, 1);
    this.setData({
      photoArr: photoArr
    })

  },
  //插入语音
  voiceTap: function () {
    var that = this;
    that.setData({
      voiceBox: true,
      keyboardIsShow: true,
    })
  },
  // 公开私有
  isShare:function(){
    this.setData({
      isShare: !this.data.isShare
    })
  }
})