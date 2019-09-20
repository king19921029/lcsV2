var app = getApp();
const util = require('../../utils/repetitionTap.js');
const uuid = require('../../utils/util.js');
import http from '../../utils/request.js'
import wxRouter from '../../utils/router.js'
const backgroundAudioManager = wx.getBackgroundAudioManager();
Page({
  data: {
    hotKeyword:"",//搜索推荐
    isFirstStatus:false,
    //轮播配置
    swiperData:{
      indicatorDots: true,
      autoplay: true,
      interval: 5000,
      duration: 200,
    },
    searchColor:false,//滚动高度
    homeBanner:{},//banner数据
    lsSubjectList: {},//SKU信息列表接口
    lsSubjectAllList:{},//SKU全部列表数据接口
    teacherList:{},//教授数据
    initShowType: 0, //初始化showType
    navStatus:0,//footer状态
    schoolStateNow:0,
    newSkuList:{},//最新课程
    societyList: {},//圈子信息
    toUserSkuList:{},//推荐信息
    complete: "0",//用户信息是否完整
    is_have:0,
    isMicPlay:false,
    model:"",//设备类型
    isIpx:false,
    showType:0,
    navStatusFirst:true
  },
  getPhoneNumber:function(res){
    console.log(res)
  },
  //查看发送记录
  testTap:function(){
    wx.navigateTo({
      url: '/pages/commonPage/seeFileplaytime/seeFileplaytime'
    })
  },
  onLoad: function (options) {
    
    var that = this;
    let token = wx.getStorageSync("token")
    let skuId = options.skuId || null;
    let cwId = options.cwId || null;
    // sku小节
    if (skuId && cwId ){
      let share = {
        skuId: skuId,
        cwId: cwId
      }
      if (token) {
        app.wxRequest("coreapi/core/v1/querySkuInfo",
          { skuId: skuId }, "POST", function (res) {
          if (res.data.code == 0) {
            if (res.data.data.is_buy == "1") {
              wx.navigateTo({
                url: '/pages/commonPage/courseDetails/courseDetails?skuId=' + skuId + "&cwId=" + cwId
              })
            } else {
              wx.navigateTo({
                url: '/pages/commonPage/noBuyDetails/noBuyDetails?skuId=' + skuId
              })
            }

          } else {
            app.showLoading(res.data.msg, "none");
          }
        })
      }else{
        wx.setStorageSync("share", share)
        wx.navigateTo({
          url: '/subPages/loginPackage/pages/login/login?timeout=1',
        })
      }
    }else{
      if (skuId) {
        if (token) {
          wx.navigateTo({
            url: '/pages/commonPage/noBuyDetails/noBuyDetails?skuId=' + options.skuId
          })
        }
      }
    }

    let isFirst = wx.getStorageSync("isFirst") || {};
    if (isFirst.schoolSataus ){
      that.setData({
        isFirstStatus:false,
        schoolStateNow: app.globalData.schoolStateNow,
        model: app.globalData.model,
        navStatusFirst:false
      })
    }else{
      that.setData({
        isFirstStatus: true, 
        schoolStateNow: app.globalData.schoolStateNow,
        model: app.globalData.model,
        navStatusFirst:true
      })
    }

  },
  onShow:function(){
    
    var that = this;
    that.setData({
      isMicPlay: app.globalData.isMicPlay,
      schoolStateNow: app.globalData.schoolStateNow,
      isIpx: app.globalData.isIpx
    })
    
    // pageViewTime
    let viewTime = app.globalData.viewTime;
    app.onPageViewTime(viewTime)

    // 电报红点
    let token = app.globalData.token;
    if (token == '' || token == null) {
      that.setData({
        is_have: false
      })
    } else {
      app.wxRequest("coreapi/core/v1/queryUserNotReadNotice",
        {},
        "POST", function (res) {
        if (res.data.code == 0) {
          that.setData({
            is_have: res.data.data.is_have
          })
        } else {
          app.showLoading(res.data.msg, "none");
        }
      })
    }
    // 分享过来的数据
    let share = wx.getStorageSync("share");
    // sku小节
    if (share.skuId && share.cwId) {
    
      app.wxRequest("coreapi/core/v1/querySkuInfo",
        { skuId: share.skuId }, "POST", function (res) {
        if (res.data.code == 0) {
          if (res.data.data.is_buy == "1") {
            wx.navigateTo({
              url: '/pages/commonPage/courseDetails/courseDetails?skuId=' + share.skuId + "&cwId=" + share.cwId,
              success:function(){
                wx.removeStorageSync("share")
              }
            })
          } else {
            wx.navigateTo({
              url: '/pages/commonPage/noBuyDetails/noBuyDetails?skuId=' + skuId
            })
          }

        } else {
          app.showLoading(res.data.msg, "none");
        }
      })

    } else {
      if (share.skuId) {
        wx.navigateTo({
          url: '/pages/commonPage/noBuyDetails/noBuyDetails?skuId=' + share.skuId
        })
      }
    }

    that.init(app.globalData.schoolStateNow);

    http.post(
      "/coreapi/core/v1/queryCollegeIndexBannerList",
      { showType: 0}
    ).then((res)=>{
      console.log("http",res)
    })

  },

  onUnload:function(){
    var that = this;
    let uuids = uuid.create_UUID();//uid
    let pageCode = that.getPageCode(that.data.showType);//页面CODE
    let beginTime = app.globalData.beginTime;//页面开始时间戳
    let endTime = Date.parse(new Date()) / 1000;//结束时间戳
    app.stopPageViewTime(uuids, pageCode, beginTime, endTime)
  },
  onHide:function(){          
    var that = this;
    let uuids = uuid.create_UUID();//uid
    let pageCode = that.getPageCode(that.data.showType);//页面CODE
    let beginTime = app.globalData.beginTime;//页面开始时间戳
    let endTime = Date.parse(new Date()) / 1000;//结束时间戳
    app.stopPageViewTime(uuids, pageCode, beginTime, endTime)
  },
  // 获取滚动条当前位置
  onPageScroll: function (e) { 
    var that = this;
    let scrollTop = e.scrollTop
    if (scrollTop > 250) {
      if (!that.data.searchColor) {
        that.setData({
          searchColor: true
        })
      } else {
        return false;
      }
    } else {
      if (that.data.searchColor) {
        that.setData({
          searchColor: false
        })
      } else {
        return false;
      }
    }
  },
  search:function(e){
    // wx.navigateTo({
    //   url: '/subPages/searchPackage/pages/search/search?hotKeyword=' + this.data.hotKeyword,
    // })
    var str = "乐乐";
    wxRouter.router(
      1,
      "/subPages/searchPackage/pages/search/search",
      str
    )
  },
  // 初始化数据
  init(showType){
    var that = this;
    // 0.热门搜索
    app.wxRequest('coreapi/core/v1/queryHotSearchKeyWord',
      {}, 'POST', function (res) {
        if (res.data.code == 0) {
          that.setData({
            hotKeyword: res.data.data.keyword
          })
        } else {
          app.showLoading(res.data.msg, "none")
        }
    })
    // 1.banner
    app.wxRequest("coreapi/core/v1/queryCollegeIndexBannerList",
      { showType: showType }, "POST", function (res) {
        if( res.data.code == 0 ){
          if (res.data.data.length > 0){
            that.setData({
              homeBanner: res.data.data,
            })
          }else{
            that.setData({
              homeBanner: res.data.data,
              searchColor:true
            })
          }
          
        }else{
          app.showLoading(res.data.msg,"none");
        }
    })
    // 3.SKU列表
    app.wxRequest("coreapi/core/v1/queryCollegeIndexSubjectList",
      { showType: showType },
      "POST", function (res) {
      if (res.data.code == 0) {
        that.setData({
          lsSubjectList: res.data.data
        })
      } else {
        app.showLoading(res.data.msg, "none");
      }
    })
    // 5.教授信息
    app.wxRequest("coreapi/core/v1/queryCollegeIndexTeacherList",
      { showType: showType },
      "POST", function (res) {
      // console.log(res.data);
      if (res.data.code == 0) {
        that.setData({
          teacherList: res.data.data
        })
      } else {
        app.showLoading(res.data.msg, "none");
      }
      
    })
    // 7.课程上新
    app.wxRequest("coreapi/core/v1/queryCollegeIndexNewSkuList",
      { showType: showType },
      "POST", function (res) {
        // console.log(res.data.data)
      if (res.data.code == 0) {
        let newSkuList = res.data.data;

        if (newSkuList.length > 2 ){
          let arr = newSkuList.slice(0, 3);
          that.setData({
            newSkuList: arr
          })
        }else{
          that.setData({
            newSkuList: newSkuList
          })
        }
      } else {
        app.showLoading(res.data.msg, "none");
      }
    })
    // 9圈子信息
    app.wxRequest("coreapi/core/v1/queryCollegeIndexBBSNewsList",
      { showType: showType },
      "POST", function (res) {
        if (res.data.code == 0) {
          var societyList = res.data.data
          that.setData({
            societyList: societyList
          })
        } else {
          app.showLoading(res.data.msg, "none");
        }
    })
    // 10推荐信息
    app.wxRequest("coreapi/core/v1/queryRecommendToUserSkuList",
      { showType: showType },
      "POST", function (res) {
        if (res.data.code == 0) {
          that.setData({
            toUserSkuList: res.data.data.skuList,
            complete: res.data.data.complete || "0"
          })
          
        } else if (res.data.code == 1005){
          app.showLoading(res.data.msg, "none");
          app.globalData.token = null;
          wx.removeStorageSync("token")
        }else{
          app.showLoading(res.data.msg, "none");
        }
    })
  },
  // 换一批
  changeList:function(){
    var that = this;
    // 10推荐信息
    app.wxRequest("coreapi/core/v1/queryRecommendToUserSkuList",
    { showType:0 },
    "POST", function (res) {
      if (res.data.code == 0) {
        that.setData({
          toUserSkuList: res.data.data.skuList
        })

      } else {
        app.showLoading(res.data.msg, "none");
      }
    }, function (res) {
      app.showLoading("慢点",'none')
      console.log(1);
    })
    
  },
  // banner点击
  bannerTap: util.repeatFun(function(e){
    console.log(1);
    var that = this;
    let linkType = e.currentTarget.dataset.linktype;
    let skuId = e.currentTarget.dataset.linktext;
    
   
    if (linkType == 0) {
      app.wxRequest("coreapi/core/v1/querySkuInfo",
        { skuId: skuId }, "POST", function (res) {
          if (res.data.code == 0) {
            wx.setStorageSync("skuInfo", res.data.data)
            if (res.data.data.is_buy == "0") {
              wx.navigateTo({
                url: '/pages/commonPage/noBuyDetails/noBuyDetails?skuId=' + skuId
              })
            } else {
              wx.navigateTo({
                url: '/pages/commonPage/buyDetailsEnd/buyDetailsEnd?skuId=' + skuId
              })
            }

          } else {
            app.showLoading(res.data.msg, "none");
          }
      })
    } else if (linkType == 1) {
      app.wxRequest("coreapi/core/v1/queryColumnInfo",
        { skuId: skuId }, "POST", function (res) {
          wx.setStorageSync("skuInfo", res.data.data)
          if (res.data.code == 0) {
            if (res.data.data.is_buy == "1") {
              wx.navigateTo({
                url: '/pages/schoolPackage/schoolColumn/schoolColumn?id=' + skuId,
              })
            } else {
              wx.navigateTo({
                url: '/pages/webView/webView?url=' + res.data.data.xxc_web_url,
              })
            }

          } else {
            app.showLoading(res.data.msg, "none");
          }
      })
    } else if(linkType == 2) {
      wx.navigateTo({
        url: '/subPages/societyPackage/pages/writings_details/writings_details?id=' + skuId,
      })
    }else {
      app.wxRequest("coreapi/core/v1/queryActivityWebInfo",
        { activityId: skuId }, "POST", function (res) {
        if (res.data.code == 0) {
          let xxc_web_url = res.data.data.xxc_web_url;
          let activity_id = res.data.data.activity_id;
          // console.log(web_url)
          wx.navigateTo({
            url: '/pages/webView/webView?url=' + xxc_web_url + "&activity_id=" + activity_id
          })
          console.log(res.data)
        } else {
          app.showLoading(res.data.msg, "none");
        }
      })   
    }

    
  },1000),
  // 电报
  newsTap:function(){
    if (app.globalData.token == "" || app.globalData.token == null ){
      wx.navigateTo({
        url: '/subPages/loginPackage/pages/login/login',
      })
    }else{
      app.isMessage().then((data) => {
        wx.navigateTo({
          url: '/subPages/searchPackage/pages/searchDB/searchDB',
        })
      })
    }
   

    
  },
  // 查看全部
  allSubList: function (e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../schoolPackage/schoolAllList/schoolAllList?id=' + id
    })
    // wx.navigateTo({
    //   url:"../commonPage/purchaseSuccess/purchaseSuccess"
    // })
  },
  // 底部切换
  footerTap(e){ 
    var that = this;
   
    // 结束当前的计时
    let uuids = uuid.create_UUID();//uid
    let pageCode = that.getPageCode(that.data.showType)//当前页面CODE
    let beginTime = app.globalData.beginTime;//页面开始时间戳
    let endTime = Date.parse(new Date()) / 1000;//结束时间戳
    app.stopPageViewTime(uuids, pageCode, beginTime, endTime)
    
    // pageViewTime
    let viewTime = app.globalData.viewTime;
    app.onPageViewTime(viewTime)

    // 初始化数据
    this.init(e.detail);
    wx.pageScrollTo({
      scrollTop: 0,
      
    })

    app.globalData.schoolStateNow = e.detail
    that.setData({
      showType: e.detail,
      searchColor:false
    })
  },
  // 去详情
  goDetails: util.repeatFun( function (e) {
    let skuId = e.currentTarget.dataset.skuid;
    let skuType = e.currentTarget.dataset.skutype;
    var that = this;
    app.wxRequest("coreapi/core/v1/querySkuInfo",
      { skuId: skuId }, "POST", function (res) {
      if (res.data.code == 0) {
        wx.setStorageSync("skuInfo", res.data.data)
        if (res.data.data.is_buy == "0") {
          wx.navigateTo({
            url: '/pages/commonPage/noBuyDetails/noBuyDetails?skuId=' + skuId
          })
        } else {
          wx.navigateTo({
            url: '/pages/commonPage/buyDetailsEnd/buyDetailsEnd?skuId='+skuId 
          })
        }

      } else {
        app.showLoading(res.data.msg, "none");
      }
    })
  },1000),
  // 去专栏
  goSpecial: function (e) {
    var that = this;
    let skuId = e.currentTarget.dataset.skuid;
    app.wxRequest("coreapi/core/v1/queryColumnInfo",
      { skuId: skuId }, "POST", function (res) {

        if (res.data.code == 0) {
          if ( res.data.data.is_buy == "1" ) {
            wx.setStorageSync("skuInfo", res.data.data)
            wx.navigateTo({
              url: '/pages/schoolPackage/schoolColumn/schoolColumn?id=' + skuId,
            })
          }else{
            wx.navigateTo({
              url: '/pages/webView/webView?url=' + res.data.data.xxc_web_url + "&skuId=" + skuId,
            })
          }
          
        } else {
          app.showLoading(res.data.msg, "none");
        }
    })
   
  },
   // 去学院教授
  goAllTeacher: function (e) {
    let showType = this.data.showType;
    wx.navigateTo({
      url: '../schoolPackage/schoolTeacher/schoolTeacher?showType=' + showType,
    })
  },
  // 去课程上新
  goNewCourse: function (e) {
    let showType = this.data.showType;
    wx.navigateTo({
      url: '../schoolPackage/newCourse/newCourse?showType=' + showType,
    })
  },
  newCourseDetails:function(e){
    var that = this;
    let skuId = e.currentTarget.dataset.skuid;
    let cwId = e.currentTarget.dataset.cwid;
    let isbuy = e.currentTarget.dataset.isbuy;
    if (cwId) {
      if (isbuy == "1" ){
        app.wxRequest("coreapi/core/v1/querySkuCwDetailInfo",
        { skuId: skuId, cwId: cwId }, "POST", function (res) {
            if (res.data.code == 0) {
              backgroundAudioManager.stop();
              wx.navigateTo({
                url: '/pages/commonPage/courseDetails/courseDetails?skuId=' + skuId + "&cwId=" + cwId + "&history_play_time=" + res.data.data.history_play_time
              })

            } else {
              app.showLoading(res.data.msg, "none");
            }
        })
      }else{
        wx.navigateTo({
          url: '/pages/commonPage/noBuyDetails/noBuyDetails?skuId=' + skuId
        })
      }
      
    } else {
      app.wxRequest("coreapi/core/v1/querySkuInfo",
      { skuId: skuId }, "POST", function (res) {
          if (res.data.code == 0) {
            wx.setStorageSync("shuInfo", res.data.data)
            if (res.data.data.is_buy == "0") {
              wx.navigateTo({
                url: '/pages/commonPage/noBuyDetails/noBuyDetails?skuId=' + skuId
              })
            } else {
              wx.navigateTo({
                url: '/pages/commonPage/buyDetailsEnd/buyDetailsEnd?skuId=' + skuId
              })
            }

          } else {
            app.showLoading(res.data.msg, "none");
          }
      })
    }

  },
  // 去圈子
  goSocietye: function (e) {
    let id = e.currentTarget.dataset.id;
    console.log(id);
    wx.navigateTo({
      url: '/subPages/societyPackage/pages/writings_details/writings_details?id='+id,
    })
  },
  // 去老师主页
  goTeacher:function(e){
    let id = e.currentTarget.dataset.teacherid;
    wx.navigateTo({
      url: '/subPages/societyPackage/pages/recommend_details/recommend_details?teacherId=' + id,
    })
  },
  // 去设置
  seeUser:function(){

    let token = app.globalData.token;
    if (token == '' || token == null) {
      wx.navigateTo({
        url: '/subPages/loginPackage/pages/login/login',
      })
    }else{
      wx.navigateTo({
        url: '/subPages/personalPackage/pages/user/user'
      })
    }
   
  },
  micGoDetails:function(){
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
      title: '我是理财师APP,让理财师更专业',
      path: '/pages/school/school',
    }
  },
  // 获取pagecode
  getPageCode: function (showType){
    if ( showType == 0 ){
      return "1001"
    } else if (showType == 1 ){
      return "1002"
    } else if ( showType == 2 ){
      return "1003"
    }else{
      return "1004"
    }
  },
  // 新手指导浮层点击
  isFirstTap(){
    let isFirst = wx.getStorageSync("isFirst") || {};
    isFirst.schoolSataus = true;
    wx.setStorageSync("isFirst", isFirst)
    this.setData({
      isFirstStatus:false
    })
  }
})
