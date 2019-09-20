//logs.js
let app = getApp();
const uuid = require('../../utils/util.js');
const backgroundAudioManager = wx.getBackgroundAudioManager();
const innerAudioContext = wx.createInnerAudioContext();
Page({
  data: {
    voiceAnimation:null,//为了安卓播放动作
    downText:false,       //长文本是否展开
    scrollTop:0,
    scrollTops:null,
    searchOpcity:false,   //导航栏是否出现背景
    imgUrls:[],

    // 轮播图配置
    indicatorDots: true,  //显示控制器  点
    autoplay: true,       //自动切换
    interval: 5000,       //间隔时间
    duration: 200,        //滑动速度

    type:1,
    isMicPlay:false,
    isFirstSocietyStatus:true,  //首次进入状态

   
    is_have:false,  // 是否有消息
    voiceAnimationStatus: -1,

    size:10,   //当前页显示条数
    skip:0,    //起始页码


    isPaly:false,

    list:[],         //管理关注数组
    dialog:false,
    isIpx:false,

    kcName:""   //分享用课程名
  },
  // 文本收起展开
  downText:function(e){
    let that = this;
    let index = e.currentTarget.dataset.index;
    let recordList = that.data.recordList;
    if (recordList[index].isShow == true) {
      recordList[index].isShow = false
    }else{
      recordList[index].isShow = true
    }
    that.setData({
      recordList:recordList
    })
  },
  // 播放语音
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
        voiceAnimation: idx,
        isPaly: true,
      })
      app.getMicUrl(audio_id, innerAudioContext)
      backgroundAudioManager.pause();
    }
  },
  // 下拉刷新
  onPullDownRefresh: function(){
    this.setData({
      size:10,
      skip:0
    })
    this.onLoad()
  },
  // 触底加载
  onReachBottom: function () {
    wx.showLoading({
      title: '加载中',
    })
    let that = this;
    let size = that.data.size;
    let skip = that.data.skip + that.data.size;

    app.wxRequest("coreapi/core/v1/queryCirclesIndexRecordList",
      {
        showType: "4",
        size: size,
        skip: skip
      },
      "POST", function (res) {
        if (res.data.code == 0) {
          let recordList = res.data.data;
          let reachRecordList = that.data.recordList;

          if (recordList.length <= 0) {
            wx.hideLoading()
            app.showLoading("没有更多内容了", "none");
            return
          } else {
            for (var i = 0; i < recordList.length; i++) {
              recordList[i].isShow = false;
              if (recordList[i].is_follow == "0") {
                recordList[i].is_follow = false
              } else {
                recordList[i].is_follow = true
              }

              reachRecordList.push(recordList[i])
            }
            wx.hideLoading()
            // console.log(reachRecordList)
            that.setData({
              recordList: reachRecordList,
              skip: skip
            })
          }
        } else {
          app.showLoading(res.data.msg, "none");
        }
      })
  },
  onLoad: function () {

    let isFirst = wx.getStorageSync("isFirst") || {};
    if (isFirst.societyStatus) {
      this.setData({
        isFirstSocietyStatus:false
      })
    }else{
      this.setData({
        isFirstSocietyStatus:true
      })
    }
    // wx.hideShareMenu();
    // console.log("隐藏了当前页面的转发按钮");
    let size = this.data.size;
    let skip = this.data.skip;
    // 圈子banner
    this.initBanner()

    // 文章列表
    this.initMessage()

    // 热搜词推荐
    this.hotKeyword()

    // 停止下拉
    wx.stopPullDownRefresh()
  },
  onShow:function(){
    let that =this;
    that.setData({
      isMicPlay: app.globalData.isMicPlay
    })
    let token = app.globalData.token;
    if (token) {
      app.wxRequest("coreapi/core/v1/queryUserNotReadNotice",
        { },
        "POST",function (res) {
          if (res.data.code == 0) {
            let UserNotReadNotice = res.data.data;
            if (UserNotReadNotice.is_have > 0) {
              that.setData({
                is_have:true
              })
            }else{
              that.setData({
                is_have:false
              })
            }
          } else {
            app.showLoading(res.data.msg, "none");
          }
      })
    }else{
      that.setData({
        is_have:false
      })
    }

    // 监听录音播放时
    innerAudioContext.onPlay(function(){
      console.log('语音播放')
      that.setData({
        voiceAnimationStatus: that.data.voiceAnimation
      })
    })

    // 监听录音停止时
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


    // iphonex适配
    that.setData({
      isIpx:app.globalData.isIpx
    })

  },
  // 初始化banner列表
  initBanner:function(){
    let that = this;
    app.wxRequest("coreapi/core/v1/queryCirclesIndexBannerList",
      {
        showType:"4"
      },
      "POST",function (res) {
        if (res.data.code == 0) {
          // console.log(res)
          let bannerList = res.data.data;
          that.setData({
            imgUrls:bannerList
          })
        } else {
          app.showLoading(res.data.msg, "none");
        }
    })
  },
  // banner跳转
  to_details:function(e){
    // console.log(e)
    let type = e.currentTarget.dataset.type;  //链接类型,0为课程,1为专栏,2文章,3新闻
    let text = e.currentTarget.dataset.text;  //链接的ID或者网页
    // 课程
    if (type == 0) {
      app.wxRequest("coreapi/core/v1/querySkuInfo",
        {
          skuId:text
        },
        "POST",function (res) {
          if (res.data.code == 0) {
            wx.setStorageSync("skuInfo", res.data.data)
            if (res.data.data.is_buy == "0") {
              wx.navigateTo({
                url:"../commonPage/noBuyDetails/noBuyDetails?skuId="+text
              })
            }else{
              wx.navigateTo({
                url:"../commonPage/buyDetailsEnd/buyDetailsEnd?skuId="+text
              })
            }
            
          } else {
            app.showLoading(res.data.msg, "none");
          }
      })
    }else if(type == 1){  //专栏
      app.wxRequest("coreapi/core/v1/queryColumnInfo",
        {
          skuId:text,       //课程id
          // skuId:"ea71c1bd-d8e0-11e8-9fff-00163e101f18"
        },
        "POST",function (res) {
          // console.log(res)
          if (res.data.code == 0) {
            wx.setStorageSync("skuInfo", res.data.data)
            if (res.data.data.is_buy == "0") {
              wx.navigateTo({
                url:'../webView/webView?url='+res.data.data.xxc_web_url
              })
            }else{
              wx.navigateTo({
                url:"../schoolPackage/schoolColumn/schoolColumn?id="+text
              })
            }
            
          } else {
            app.showLoading(res.data.msg, "none");
          }
      })
    }else if(type == 2){  //文章
      wx.navigateTo({
        url:"../../subPages/societyPackage/pages/writings_details/writings_details?id="+text
      })
    }else if(type == 3){  //网址
      app.wxRequest("coreapi/core/v1/queryActivityWebInfo",
        { activityId: text }, "POST", function (res) {
        if (res.data.code == 0) {
          let web_url = res.data.data.xxc_web_url;
          let activity_id = res.data.data.activity_id;
          wx.navigateTo({
            url: '../webView/webView?url=' + web_url + "&activity_id=" + activity_id
          })
        } else {
          app.showLoading(res.data.msg, "none");
        }
      })
    }
  },
  // 初始化首页信息
  initMessage:function(){
    let that = this;
    let size = that.data.size;
    let skip = that.data.skip;
    app.wxRequest("coreapi/core/v1/queryCirclesIndexRecordList",
      {
        showType:"4",
        size:size,
        skip:skip
      },
      "POST",function (res) {
        if (res.data.code == 0) {
          // console.log(res.data.data)
          let recordList = res.data.data;
          for (var i = 0; i < recordList.length; i++) {
            recordList[i].isShow = false;
            if (recordList[i].is_follow == "0") {
              recordList[i].is_follow = false
            }else{
              recordList[i].is_follow = true
            }
          }
          that.setData({
            recordList:recordList
          })

          // console.log(recordList)
        } else {
          app.showLoading(res.data.msg, "none");
        }
    })
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
  // 关注
  follow:function(e){
    let that = this;
    let id = e.currentTarget.dataset.teacherid;
    let index = e.currentTarget.dataset.index;
    let size = that.data.recordList.length;
    let token = app.globalData.token;
    if (token) {
      app.wxRequest("coreapi/core/v1/sendUserFollow",
        {
          fId:id,           //老师或者用户的id
          fType:"1",       //用户类型，0用户，1老师
        },
        "POST",function (res) {
          if (res.data.code == 0) {
            if (res.data.data.actionResult == "1") {
              // that.initMessage()
              let recordList = that.data.recordList;
              for (var i = 0; i < recordList.length; i++) {
                if (recordList[i].teacher_id == id) {
                  recordList[i].is_follow = true
                }
              }
              
              
              that.setData({
                recordList:recordList
              })
              // console.log(that.data.recordList)
              app.showLoading("关注成功", "none");
            }
          } else {
            app.showLoading(res.data.msg, "none");
          }
      })
    }else{
      wx.navigateTo({
        url:'../../subPages/loginPackage/pages/login/login'
      })
    }
  },





  // 去消息页面
  to_Notice:function(){
    let that = this;
    let token = app.globalData.token;
    if (token) {
      app.isMessage().then( (res) => {
        // console.log(res)
        let UserNotReadNotice = res.is_have;
        if (UserNotReadNotice.is_have > 0) {
          that.setData({
            is_have:true
          })

        }else{
          that.setData({
            is_have:false
          })
        }
        wx.navigateTo({
          url:"../../subPages/searchPackage/pages/searchDB/searchDB"
        })
      })
    }else{
      // app.showLoading("请先登录","none")
      wx.navigateTo({
        url:'../../subPages/loginPackage/pages/login/login'
      })
    }
  },
  // 点击评论进详情
  text_detail:function(e){
    let index = e.currentTarget.dataset.index;
    let id = this.data.recordList[index].teacher_record_id;
    // console.log(index,id)
    wx.navigateTo({
      url:"../../subPages/societyPackage/pages/writings_details/writings_details?id="+id
    })
  },
  // 跳转文章页面
  to_writing:function(e){
    let id = e.currentTarget.dataset.id;
    // console.log(id)
    wx.navigateTo({
      url:"../../subPages/societyPackage/pages/writings_details/writings_details?id="+id
    })
  },
  // 去老师主页
  to_recommend:function(e){
    let teacherid = e.currentTarget.dataset.teacherid;  //teacherid
    wx.navigateTo({
      url:'../../subPages/societyPackage/pages/recommend_details/recommend_details?teacherId='+teacherid
    })
  },
  // 跳转课程页面
  to_kecheng:function(e){
    // 先判断是否购买过该课程
    let that = this;
    let sku_id = e.currentTarget.dataset.skuid;
    app.wxRequest("coreapi/core/v1/querySkuInfo",
      {
        skuId:sku_id,       //课程id
      },
      "POST",function (res) {
        if (res.data.code == 0) {
          // console.log(res.data.data)
          wx.setStorageSync("skuInfo", res.data.data)
          if (res.data.data.is_buy == "0") {
            wx.navigateTo({
              url:"../commonPage/noBuyDetails/noBuyDetails?skuId="+sku_id
            })
          }else{
            wx.navigateTo({
              url:"../commonPage/buyDetailsEnd/buyDetailsEnd?skuId="+sku_id
            })
          }
          
        } else {
          app.showLoading(res.data.msg, "none");
        }
    })
  },
  // 跳转搜索页面
  to_search:function(){
    let hotKeyword = this.data.hotKeyword;
    wx.navigateTo({
      url:'../../subPages/searchPackage/pages/search/search?hotKeyword='+hotKeyword
    })
  },
  onReady:function(){
    this.audioCtx = wx.createAudioContext('myAudio')
  },
  // 搜索条当页面向下滚动显示背景
  onPageScroll: function (ev) {
    var that = this;
    if (ev){
      that.setData({
        scrollTops: ev.scrollTop
      })
    }
  },
 
  // 转载
  addNotes:function(e){
    var that = this;
    let linkId = e.currentTarget.dataset.linkid;
    let linkType = e.currentTarget.dataset.type;
    let token = app.globalData.token;
    if (token) {
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
    }else{
      wx.navigateTo({
        url:'../../subPages/loginPackage/pages/login/login'
      })
    }
  },
  onHide:function(){
    innerAudioContext.stop()

    // 页面轨迹记录
    let uuids = uuid.create_UUID();//uid
    let pageCode = "1003";//页面CODE
    let beginTime = app.globalData.beginTime;//页面开始时间戳
    let endTime = Date.parse(new Date()) / 1000;//结束时间戳
    app.stopPageViewTime(uuids, pageCode, beginTime, endTime)
  },
  onUnload:function(){
    innerAudioContext.stop()

    // 页面轨迹记录
    let uuids = uuid.create_UUID();//uid
    let pageCode = "1003";//页面CODE
    let beginTime = app.globalData.beginTime;//页面开始时间戳
    let endTime = Date.parse(new Date()) / 1000;//结束时间戳
    app.stopPageViewTime(uuids, pageCode, beginTime, endTime)
  },
  // 热搜词推荐
  hotKeyword:function(){
    let that = this;
    app.wxRequest('coreapi/core/v1/queryHotSearchKeyWord',
      {}, 'POST', function (res) {
        if (res.data.code == 0) {
          // console.log(res.data.data)
          that.setData({
            hotKeyword:res.data.data.keyword
          })
        } else {
          app.showLoading(res.data.msg, "none")
        }
      })
  },
  micGoDetails:function(){
     var that = this;
      let skuId = app.globalData.skuId;
      let cwId = app.globalData.cwId;
      wx.navigateTo({
        url: '/pages/commonPage/courseDetails/courseDetails?skuId=' + skuId + "&cwId=" + cwId + "&video_show=1"
      })
  },
  onShareAppMessage: function (res) {
    console.log(res)
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
    }
  },
  off_isFirst:function(){
    let isFirst = wx.getStorageSync("isFirst") || {};
    isFirst.societyStatus = true;
    wx.setStorageSync("isFirst", isFirst)
    this.setData({
      isFirstSocietyStatus:false
    })
  }
})
