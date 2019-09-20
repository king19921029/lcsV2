const recorderManager = wx.getRecorderManager();
const innerAudioContext = wx.createInnerAudioContext();
const util = require('../../../utils/repetitionTap.js');
var setIntervalTime = "";
const app = getApp();
Page({
  data: {
    tempFilePath: null,//录音完成的url
    time: 0,
    recorderManagerStatus: 0,//录音状态
    recorderManagerDuration: null,
    interval: false,//录音计数器
    voiceAnimation: false,//语音动画
    photoArr: [],//照片数组
    photoBox: false,//照片盒子
    voiceBox: false,//语音盒子
    voiceX: true,//语音X号
    user_notes: "",//用户笔记
    isShare: true,//是否公开
    WriteNotes: "",//页面编辑数据
    WriteNotes_audioid:"",//录音id
    keyboardIsShow:false,//键盘是否显示
    is_share:"1",
    isSet:true,//是否保存
  },
  onLoad: function (e) {
    var that = this;
    var data = wx.getStorageSync('WriteNotes');
    let photoArr = that.data.photoArr;
    
    if (data.pic_url_1){
      photoArr.push(data.pic_url_1)
    }
    if (data.pic_url_2){
      photoArr.push(data.pic_url_2)
    }
    if (data.pic_url_3) {
      photoArr.push(data.pic_url_3)
    }

    if ( data.audio_id ){
      that.setData({
        WriteNotes: data,
        WriteNotes_audioid: data.audio_id || null,
        recorderManagerDuration: data.audio_time || null,
        audioId: data.audio_id || null,
        photoArr: photoArr,
        time: data.audio_time || 0,
        is_share: data.is_share,
        recorderManagerStatus:3
      })
    }else{
      that.setData({
        WriteNotes: data,
        WriteNotes_audioid: data.audio_id || null,
        recorderManagerDuration: data.audio_time || null,
        audioId: data.audio_id || null,
        photoArr: photoArr,
        time: data.audio_time || 0,
        is_share: data.is_share
      })
    }
    
   
     
  },
  onShow: function () {
    var that = this;

    // 监听录音播放时
    innerAudioContext.onPlay(function () {
      that.setData({
        voiceAnimation:true
      })
    })
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
              WriteNotes_audioid: urlData.data,
              recorderManagerStatus: 3,
              recorderManagerDuration: parseInt(res.duration / 1000),
              time: parseInt(res.duration / 1000)
            })
          } else {
            app.showLoading(urlData.msg, "none")
          }

        }
      })

    })
    
  },
  // 编写笔记
  userSay: function (e) {
    var that = this;
    let user_notes = e.detail.value;
    let WriteNotes = that.data.WriteNotes;
    WriteNotes.content = user_notes
   
    that.setData({
      user_notes: e.detail.value,
      WriteNotes: WriteNotes,
      voiceBox:false
    })
    
    console.log(user_notes)
  },
  init: function () {
    let that = this;
  },
  onUnload:function(){
    wx.removeStorageSync("WriteNotes")
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

    if (!that.data.interval) {
      that.data.interval = true;
      that.data.time = 0;
      that.data.WriteNotes_audioid = "";
      setIntervalTime = setInterval(function () {
        that.startTime();
      }, 1000)
    } else {
      return false;
    }



  }, 300),
  stop: function () {
    if (this.data.time < 2) {
      app.showLoading("多录一会吧", 'none')
    } else {
      recorderManager.stop();
      clearInterval(setIntervalTime);
    }

  },
  //播放声音
  play: function (e) {
    var that = this;
    let url = e.currentTarget.dataset.url;
    let audio_id = e.currentTarget.dataset.id;
    if (audio_id ){
      app.getMicUrl(audio_id, innerAudioContext)
    }else{
      console.log(url);
      innerAudioContext.src = url;
      innerAudioContext.play()
      this.setData({
        voiceAnimation: true
      })
    }
    
    
  },
  // 播放语音
  paly_ly: function (e) {
    const that = this;
    let isPaly = that.data.isPaly;
    let audio_id = e.currentTarget.dataset.id

    if (isPaly) {
      innerAudioContext.stop()
      that.setData({
        isPaly: false
      })
    } else {

      that.setData({
        isPaly: true
      })
      app.getMicUrl(audio_id, innerAudioContext)
    }
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
    this.setData({
      recorderManagerDuration: null,
      interval: false,
      audioId:"",
      time: 0,
      recorderManagerStatus: 0,
    })
  },
  // 保存录音
  saveMicTap: function () {
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

      const header = app.globalData.header;
      const url = app.globalData.url;
      wx.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success(res) {
          const tempFilePaths = res.tempFilePaths
          wx.showLoading({
            title: '上传中'
          })
          wx.uploadFile({
            url: url + '/coreapi/core/v1/uploadImageFile',
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
                  photoBox: true
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
  deleteImg:function(e){
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
  isShare_one: function () {
    this.setData({
      is_share: "0"
    })
  },
  isShare_two: function () {
    this.setData({
      is_share: "1"
    })
  },
  // 保存笔记
  saveNotes: function () {
    var that = this;
    let userNoteId = that.data.WriteNotes.note_id;
    // 笔记内容 必传
    let content = that.data.user_notes || that.data.WriteNotes.content;

    // 语音ID
    let audioId = that.data.audioId || "";
    // 语音时长
    let audioTime = that.data.recorderManagerDuration || "";
    // 是否公开 必传
    var isShare = that.data.is_share;
    // 照片
    let photoArr = that.data.photoArr;
    console.log(photoArr)
    let picUrl1 = photoArr[0] || ""
    let picUrl2 = photoArr[1] || ""
    let picUrl3 = photoArr[2] || ""

    if (content == "" && photoArr == "" && audioId == "" ) {
      app.showLoading("请填写笔记内容", "none");
      return false;
    }

    if( that.data.isSet ){ 
      // SKU基础信息
      app.wxRequest("coreapi/core/v1/updateUserNote",
        {
          userNoteId: userNoteId,
          content: content,
          audioId: audioId,
          audioTime: audioTime,
          isShare: isShare,
          picUrl1: picUrl1,
          picUrl2: picUrl2,
          picUrl3: picUrl3,

        }, "POST", function (res) {
          console.log(res.data.data)
          if (res.data.code == 0) {
            if (res.data.data.actionResult == "1") {
              wx.removeStorageSync('user_notes')
              that.setData({
                isSet:false
              })
              setTimeout(function () {
                wx.navigateBack();
              }, 800)

            }
          } else {
            app.showLoading(res.data.msg, "none");
          }
        })
    }

   

  },
})