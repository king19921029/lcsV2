var playTimes;//记录音视频时长
var micPlayTime;//音视频定时器
var audioPlayTimeOut;//音频计时器

var pageViewTime;//记录全局页面定时器
var uuid = require('./utils/util.js'); 
App({
  globalData: {
    windowSize:{},//设备大小
    model:"",//设备型号
    userId:null,//用户id
    micBeginTime:0,//音乐开始时长
    micBeginSkuId:"",
    micBeginCwId:"",
    micBeginMicId:"",
    micAudioManagerTime:"",//播放时长
    audioPlayTime:0,//音频播放时长
    token:null,
    userInfo: null,
    schoolStateNow:0,
    isMicPlay:false,//音频是否在播放
    skuId:null,
    cwId:null,
    playTime:0,//播放时长
    playTimeTimeOut:false,//定时器是否存在
    viewTime:0,//页面停留时长
    beginTime: null,//页面开始时间戳
    playTimePoint:null,//视频播放时长
    fileTimeArr:[],//存入播放时长数组
    url:'https://api-dev.licaishi365.com',
    // url:'http://192.168.2.139:8833',

    header: {
      "content-type": "application/x-www-form-urlencoded",
      "device-type": "xiaochengxu-maya",
      "version": "0",
      "uuid":"xiaochengxu"
    },
  },
  onLaunch: function () {
    var that = this;
    

    let token = wx.getStorageSync("token") || "";
    that.globalData.header["x-authorization"] = token;
    that.globalData.header["uuid"] = uuid.create_UUID();//uid
    that.globalData.token = token
    // 获取openid
    that.getOpenId();
    //轮循计时
    // that.postSetData()
    // 获取设备
    wx.getSystemInfo({
      success: function (res) {
        // console.log(res)
        let windowSize = {
          windowWidth: res.windowWidth,
          windowHeight: res.windowHeight
        }
        that.globalData.windowSize = windowSize;
        if (res.model.search('iPhone X') != -1){
          that.globalData.isIpx = true;
        }else{
          that.globalData.isIpx = false;
        }
        wx.setStorageSync("model", res.platform)
        that.globalData.model = res.platform
      }
    })
    // userId
    this.wxRequest('coreapi/user/v1/getuserinfo',
      {}, 'POST', (res) => {
      if (res.data.code == 0) {
        that.globalData.userId = res.data.data.id
      }
    })

    
   
  },
  onHide(res) {
    console.log("退出了")
    let that = this;
    let isMicPlay = that.globalData.isMicPlay;


    // 小程序退出时发送时（但是点击查看图片大图也算小程序退出，冲突）
    // if ( isMicPlay ){
    //   // 开始时长
    //   let micBeginTime = that.globalData.micBeginTime;
    //   // 结束时长
    //   var com_endTime = Date.parse(new Date()) / 1000;
    //   // 听了多少秒
    //   let com_seeTime = com_endTime - micBeginTime;
     
    //   if (micBeginTime > 0 && com_seeTime > 0 && com_seeTime < 99999) {
    //     // playTime所需参数
    //     let uuids = uuid.create_UUID();//uid

    //     let skuId = that.globalData.micBeginSkuId;
    //     let cwId = that.globalData.micBeginCwId;
    //     let fileId = that.globalData.micBeginMicId; //videoId

    //     let fileType = 0; //文件类型
    //     var playTimePoint = parseInt(that.globalData.micAudioManagerTime + com_seeTime) || 0; //播放到什么位置
    //     that.stopPlayer(uuids, skuId, cwId, fileId, fileType, com_seeTime, playTimePoint)
    //   }
    // }
  },
  //封装的请求方法
  wxRequest: function (url, param, method,success,fail) {
    var that = this;
    if (url.indexOf('https') != 0) {
      url = this.globalData.url + '/' + url
    }
    param = param || {}
    method = method
    
    wx.request({
      header: this.globalData.header,
      url: url,
      data: param,
      method: method,
      success: function (res) {
        typeof success == 'function' && success(res)
      },
      fail: function (res) {
        typeof fail == 'function' && fail(res)
      }
    })

  },
  //打开loading
  showLoading: function (title, types) {
    wx.showToast({
      title: title,
      icon: types
    });
  },
  // 开始记时，播放时长
  onPlayer(playTime){
    var that = this;
    let playTimeTimeOut = that.globalData.playTimeTimeOut;
    // if ( playTimeTimeOut ){
      playTimes = setTimeout(function () {
        playTime = playTime + 1
        that.globalData.playTime = playTime
        that.onPlayer(playTime);
        // console.log(playTime)
      }, 1000)
    // }
   
  },
  // 停止计时,与后台交互
  stopPlayer(uid, skuId, cwId, fileId, fileType, playTime, playTimePoint){
    var that = this;
    // 停止定时器
    clearTimeout(playTimes);
    // 初始化为0
    that.globalData.playTime = 0;
    that.globalData.playTimeTimeOut = false;
    let obj = {
      uid: uid,
      cwId: cwId,
      skuId: skuId,
      fileId: fileId,
      fileType: fileType,
      playTime: playTime,
      playTimePoint: playTimePoint,
      fileTimeArr: fileTimeArr
    }
    setTimeout(function () {
      that.clearTimeoutFun();
    }, 1000)
    
    let fileTimeArr = wx.getStorageSync("fileTimeArr") || [];
    fileTimeArr.push(obj);
    wx.setStorageSync("fileTimeArr", fileTimeArr)

  },
  //清除定时器
  clearTimeoutFun(){
    clearTimeout(playTimes);
  },
  // 开始计时,页面时长
  onPageViewTime(viewTime) {
    var that = this;
    if (!that.globalData.beginTime){
      var beginTime = Date.parse(new Date()) / 1000;
      that.globalData.beginTime = beginTime
    }
    pageViewTime = setTimeout(function () {
      viewTime = viewTime + 1
      that.globalData.viewTime = viewTime
      that.onPageViewTime(viewTime);
    }, 1000)
  },
  stopPageViewTime(uid, pageCode, beginTime, endTime, objId, objType, cwId){
    var that = this;
    // 停止定时器
    clearTimeout(pageViewTime);
    // 初始化为0
    that.globalData.viewTime = 0;
    that.globalData.beginTime = 0;
    let obj = {
      uid: uid,
      pageCode: pageCode,
      beginTime: beginTime,
      endTime: endTime,
      objId: objId || "",
      objType: objType || "",
      cwId: cwId || ""
    }
    let viewTimeArr = wx.getStorageSync("viewTimeArr") || [];
    viewTimeArr.push(obj);
    wx.setStorageSync("viewTimeArr", viewTimeArr)
  },
  //轮循，每秒检测本地是否有数据
  postSetData(){
    var that = this;
    micPlayTime = setTimeout(function () {
      let fileTimeArr = wx.getStorageSync("fileTimeArr")
      let viewTimeArr = wx.getStorageSync("viewTimeArr")
      let studyEnd = wx.getStorageSync("studyEnd")
      // 发送音视频
      if (fileTimeArr.length > 0 ){
        if (fileTimeArr.length == 1 ){
          // 向后台发送数据
          that.wxRequest('coreapi/statistics/v1/fileplaytime',
            {
              uid: fileTimeArr[0].uid,
              skuId: fileTimeArr[0].skuId,
              cwId: fileTimeArr[0].cwId,
              fileId: fileTimeArr[0].fileId, //videoId
              fileType: fileTimeArr[0].fileType, //类型,
              playTime: fileTimeArr[0].playTime, //播放时长
              playTimePoint: fileTimeArr[0].playTimePoint //播放到视频的第几秒
            }, 'POST', function (res) {
            if (res.data.code == 0) {
              console.log("发送了学习时长")

              // 用于查看发送记录
              var time = uuid.formatTime(new Date());
              fileTimeArr[0].date = time;
              let seeFileplaytime = wx.getStorageSync("seeFileplaytime") || [];
              seeFileplaytime.push(fileTimeArr[0])
              wx.setStorageSync("seeFileplaytime", seeFileplaytime)


              //删除
              fileTimeArr.shift();
              wx.setStorageSync("fileTimeArr", fileTimeArr)
            } else {
              // 失败，重新塞进数组
              if (fileTimeArr.indexOf(fileTimeArr[0]) == -1) {
                fileTimeArr.unshift(fileTimeArr[0])
                wx.setStorageSync("fileTimeArr", fileTimeArr)
              }
            }
          })
        }else{
          for (var i = 0; i < fileTimeArr.length; i++) {
            // 如果数组转态为1的时候说明发送完毕，马上删除
            if ( fileTimeArr[i].status && fileTimeArr[i].status == 1 ) {
              fileTimeArr.shift();
              wx.setStorageSync("fileTimeArr", fileTimeArr)
            } {
              // 标记这条数据也以发送
              fileTimeArr[i].status = 1
              // 向后台发送数据
              that.wxRequest('coreapi/statistics/v1/fileplaytime',
                {
                  uid: fileTimeArr[i].uid,
                  skuId: fileTimeArr[i].skuId,
                  cwId: fileTimeArr[i].cwId,
                  fileId: fileTimeArr[i].fileId, //videoId
                  fileType: fileTimeArr[i].fileType, //类型,
                  playTime: fileTimeArr[i].playTime, //播放时长
                  playTimePoint: fileTimeArr[i].playTimePoint //播放到视频的第几秒
                }, 'POST', function (res) {
                  if (res.data.code == 0) {
                    console.log("发送了学习时长")

                    var time = uuid.formatTime(new Date());
                    fileTimeArr[i].date = time;
                    let seeFileplaytime = wx.getStorageSync("seeFileplaytime") || [];
                    seeFileplaytime.push(fileTimeArr[i])
                    wx.setStorageSync("seeFileplaytime", seeFileplaytime)

                    fileTimeArr.shift();
                    wx.setStorageSync("fileTimeArr", fileTimeArr)
                  } else {
                    // 失败，重新塞进数组
                    if (fileTimeArr.indexOf(fileTimeArr[i]) == -1 ){
                      fileTimeArr[i].status == 0;
                      fileTimeArr.unshift(fileTimeArr[i])
                      wx.setStorageSync("fileTimeArr", fileTimeArr)
                    }else{
                      that.showLoading("请检查网络")
                    }
                  }
                })
            }

          }
        }
      }
      // 发送全局停留时长
      if (viewTimeArr.length > 0 ){
        for (var i = 0; i < viewTimeArr.length; i++) {
          // 向后台发送数据
          that.wxRequest('coreapi/statistics/v1/pageviewtime',
            {
              uid: viewTimeArr[i].uid,
              pageCode: viewTimeArr[i].pageCode,
              beginTime: viewTimeArr[i].beginTime,
              endTime: viewTimeArr[i].endTime,
              objId: viewTimeArr[i].objId,
              objType: viewTimeArr[i].objType,
              cwId: viewTimeArr[i].cwId
            }, 'POST', function (res) {
              if (res.data.code == 0) {
                viewTimeArr.shift();
                wx.setStorageSync("viewTimeArr", viewTimeArr)
              } else if (res.data.code == 1002){
                viewTimeArr.shift();
                wx.setStorageSync("viewTimeArr", viewTimeArr)
              }
          })
        }
      }
      // 发送最后15秒
      if (studyEnd.length > 0 ){
        for (var i = 0; i < studyEnd.length; i++) {
          // 向后台发送数据
          that.wxRequest('coreapi/core/v1/userStudyEndCW',
            {
              skuId: studyEnd[i].skuId,
              cwId: studyEnd[i].cwId
            }, 'POST', function (res) {
              if (res.data.code == 0) {
                studyEnd.shift();
                wx.setStorageSync("studyEnd", studyEnd)
              } else if (res.data.code == 1002) {
                studyEnd.shift();
                wx.setStorageSync("studyEnd", studyEnd)
              }
            })
        }
      }

      //查看发送记录（上线前删除）
      let seeFileplaytime = wx.getStorageSync("seeFileplaytime")
      if (seeFileplaytime.length > 50 ){
        wx.removeStorageSync("seeFileplaytime")
      }
      // that.postSetData();
      
    }, 1500)
  },
  // 检测token
  isToken(){
    const promise = new Promise((resolve, reject) => {
      this.wxRequest('coreapi/user/v1/getuserinfo',
        {}, 'POST', (res)=>{
          // 表示登录未过期
          // console.log(res.data)
          if (res.data.code == 0) {
            resolve(res.data.data)
          }
          else if(res.data.code == 1005){
            this.globalData.token = null
          } else {
            wx.navigateTo({
              url: '/subPages/loginPackage/pages/login/login',
            })
          }
      })
    });
    return promise;
  },
  // 检测是否有未读消息
  isMessage(){
    const promise = new Promise((resolve, reject) => {
      this.wxRequest("coreapi/core/v1/queryUserNotReadNotice",
        {},
        "POST", function (res) {
          if (res.data.code == 0) {
            resolve(res.data.data)
          }
      })
    });
    return promise;
  },
  getOpenId: function () {
    var that = this;
    // 登录获取code发送给后台拿到optionId
    wx.login({
      success: function (res) {
        if (res.code) {
          var code = res.code;
          // console.log(code)
          that.wxRequest('coreapi/wechat/v1/weiXinAauth4XCXOpenId', 
            { code: code }, 'get', function (res) {
            that.globalData.openId = res.data.openid;
            that.globalData.unionId = res.data.unionid;
          })



          // var appid = "wxe56a10a18a1a932b";
          // var secret = "ba70ed12d8f6a60e641a9946146225f3"
          // var wxUrl = 'https://api.weixin.qq.com/sns/jscode2session?appid=' + appid + '&secret=' + secret + '&js_code=' + code + '&grant_type=authorization_code'; 

          // wx.request({
          //   url: wxUrl,
          //   data: {},
          //   method: 'GET', 
          //   success: function (res) {
          //     console.log(res.data.openid);
          //     var openid = res.data.openid;

          //     // 获取access_token
          //     var tokens = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + appid + "&secret=" + secret
          //     wx.request({
          //       url: tokens,
          //       data: {},
          //       method: 'GET',
          //       success: function (res) {
          //         var access_token = res.data.access_token;
          //         console.log(access_token)
          //         console.log(openid)
          //         // 获取unionid
          //         var un = "https://api.weixin.qq.com/cgi-bin/user/info?lang=zh_CN&access_token=" + access_token + "&openid=" + openid
          //         wx.request({
          //           url: un,
          //           data: {

          //           },
          //           method: 'GET',
          //           success: function (res) {
          //             console.log(res);
          //           }
          //         });
          //       }
          //     });
          //   }
          // });

        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
        // wx.getUserInfo({
        //   success: function (res) {
        //   that.globalData.avatarUrl = res.userInfo.avatarUrl
        //   }
        // })


      },
    })
  },
  // 录音播放
  getMicUrl: function (id, AudioContext){
    var that = this;
    that.wxRequest('coreapi/media/v1/getplayallinfo',
      { videoId: id }, 'POST', function (res) {
        console.log(res);
        if (res.data.code == 0) {
          console.log(res.data.data.playInfoList[1].playURL)
          AudioContext.src = res.data.data.playInfoList[1].playURL;
          AudioContext.play()
        } else {
         that.showLoading(res.data.msg,"none")
        }
      })
  },
  //区分网络
  // wxRequest: function (url, param, method, success, fail, complete, header) {
  //   var that = this;
  //   if (url.indexOf('https') != 0) {
  //     url = this.globalData.url + '/' + url
  //   }
  //   param = param || {}
  //   method = method
  //   header = this.globalData.header

  //   wx.getNetworkType({
  //     success: function (res) {
  //       console.log(res.networkType);
  //       if (res.networkType == "2g" || res.networkType == "3g") {
  //         that.showLoading("加载中", "loading");
  //         wx.request({
  //           header: header,
  //           url: url,
  //           data: param,
  //           method: method,

  //           success: function (res) {
  //             typeof success == 'function' && success(res)
  //             // wx.hideLoading()
  //           }
  //           ,
  //           fail: function (res) {
  //             typeof fail == 'function' && fail(res)
  //           }
  //           ,
  //           complete: function (res) {

  //             typeof complete == 'function' && complete(res)
  //           }
  //         })
  //       } else if (res.networkType == "none") {
  //         that.showLoading("无网络", "none");
  //       } else {
  //         wx.request({
  //           header: header,
  //           url: url,
  //           data: param,
  //           method: method,

  //           success: function (res) {
  //             typeof success == 'function' && success(res)
  //             // wx.hideLoading()
  //           }
  //           ,
  //           fail: function (res) {
  //             typeof fail == 'function' && fail(res)
  //           }
  //           ,
  //           complete: function (res) {

  //             typeof complete == 'function' && complete(res)
  //           }
  //         })
  //       }
  //     }
  //   })

  // },

})