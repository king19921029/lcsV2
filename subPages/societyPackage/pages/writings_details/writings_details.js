//logs.js
let app = getApp();
const uuid = require('util.js');
Page({
  data: {
    isMessage:false,	//是否吊起键盘
    editMessage:'',		//输入的评论内容
    isFollow:true,

    initSize:10,      //初始化评论每页显示条数
    initSkip:0,        //舒适化评论开始页码
  },
  onLoad: function (options) {
    wx.hideShareMenu();
    // console.log("隐藏了当前页面的转发按钮");
    // console.log(options.id)
    wx.showLoading({
      title:"正在加载"
    })
    this.setData({
      recordId:options.id
    })

    // 初始化文章内容
    this.initDetail(options.id)

    // 初始化相关课程
    this.initSkuList(options.id)

    // 初始化相关评论
    this.initCommentList(options.id)

    // 初始化文章相关推荐
    this.initNewsList(options.id)
  },
  onHide: function () {
    // 页面轨迹记录
    let uuids = uuid.create_UUID();//uid
    let pageCode = "3002";//页面CODE
    let beginTime = app.globalData.beginTime;//页面开始时间戳
    let endTime = Date.parse(new Date()) / 1000;//结束时间戳
    let objId = this.data.recordId;
    let objType = 3;
    app.stopPageViewTime(uuids, pageCode, beginTime, endTime, objId, objType)
  },
  onUnload: function () {
    // 页面轨迹记录
    let uuids = uuid.create_UUID();//uid
    let pageCode = "3002";//页面CODE
    let beginTime = app.globalData.beginTime;//页面开始时间戳
    let endTime = Date.parse(new Date()) / 1000;//结束时间戳
    let objId = this.data.recordId;
    let objType = 3;
    app.stopPageViewTime(uuids, pageCode, beginTime, endTime, objId, objType)
  },
  onShow: function () {
    // 页面轨迹记录
    let viewTime = app.globalData.viewTime;
    app.onPageViewTime(viewTime)

    // 初始化文章内容
    // this.initDetail(this.data.recordId)
  },
  // 初始化文章内容
  initDetail:function(id){
    let that = this;
    app.wxRequest("coreapi/core/v1/queryRecordDetail",
      {
        recordId:id
      },
      "POST",function (res) {
        if (res.data.code == 0) {
          // console.log(res)
          let detail = res.data.data;
          that.setData({
            detail:detail
          })
          // WxParse.wxParse('news_content', 'html', that.data.detail.news_content, that, 5);
          wx.hideLoading()
        } else {
          app.showLoading(res.data.msg, "none");
        }
    })
  },
  // 初始化相关课程
  initSkuList:function(id){
    let that = this;
    app.wxRequest("coreapi/core/v1/queryNewsRecommendSkuList",
      {
        token:'',
        recordId:id
      },
      "POST",function (res) {
        if (res.data.code == 0) {
          // console.log(res)
          let skuList = res.data.data;
          that.setData({
            skuList:skuList
          })
        } else {
          app.showLoading(res.data.msg, "none");
        }
    })
  },
  // 初始化相关评论
  initCommentList:function(id){
    let that = this;
    let size = that.data.initSize;
    let skip = that.data.initSkip;
    app.wxRequest("coreapi/core/v1/queryNewsUserCommentList",
      {
        token:'',
        recordId:id,
        size:size,
        skip:skip
      },
      "POST",function (res) {
        if (res.data.code == 0) {
          // console.log(res)
          let commentList = res.data.data;
          that.setData({
            commentList:commentList
          })
        } else {
          app.showLoading(res.data.msg, "none");
        }
    })
  },
  // 下拉加载
  onReachBottom: function() {
    wx.showLoading({
      title: '加载中',
    })
    let that = this;
    let size = that.data.initSize;
    let skip = that.data.initSkip + that.data.initSize;
    let id = that.data.recordId;
    app.wxRequest("coreapi/core/v1/queryNewsUserCommentList",
      {
        token:'',
        recordId:id,
        size:size,
        skip:skip
      },
      "POST",function (res) {
        if (res.data.code == 0) {
          let commentList = res.data.data;
          let commentList2 = that.data.commentList;
          if (commentList.length <= 0 ) {
            wx.hideLoading()
            app.showLoading("没有更多内容了", "none");
            return
          }else{
            for (var i = 0; i < commentList.length; i++) {
              commentList[i].isShow = false;
              commentList2.push(commentList[i])
            }
            wx.hideLoading()
            that.setData({
              commentList:commentList2,
              initSkip:skip
            })
          }
        } else {
          app.showLoading(res.data.msg, "none");
        }
    })
  },
  // 初始化文章相关推荐
  initNewsList:function(id){
    let that = this;
    app.wxRequest("coreapi/core/v1/queryNewsRecommendNewsList",
      {
        token:'',
        recordId:id
      },
      "POST",function (res) {
        if (res.data.code == 0) {
          // console.log(res)
          let newsList = res.data.data;
          that.setData({
            newsList:newsList
          })
        } else {
          app.showLoading(res.data.msg, "none");
        }
    })
  },
  // 输入窗口切换
  edit_message:function(){
    let token = app.globalData.token;
    if (token) {
      this.setData({
        isMessage:true
      })
    }else{
      // app.showLoading("请先登录","none")
      wx.navigateTo({
        url:'../../../loginPackage/pages/login/login'
      })
    }
  },
  // 实时监控输入框内容
  bindMessage:function(e){
  	let mess = e.detail.value;
  	// console.log(mess)
  	this.setData({
  		editMessage:mess
  	})
  },
  // 提交评论
  confirm:function(){
    let that = this;
  	let mess = that.data.editMessage;
    let id = that.data.recordId;
    let commentLength = that.data.commentList.length;
    that.setData({
      isMessage:false,
      initSize:commentLength,
      initSkip:0
    })

    if (mess == "") {
      app.showLoading("评论内容不能为空", "none");
    }else{
      app.showLoading("正在发布","loading")
      app.isToken().then(
        app.wxRequest("coreapi/core/v1/sendTeacherNewsUserComment",
          {
            recordId:id,
            comment:mess
          },
          "POST",function (res) {
            if (res.data.code == 0) {
              let success = res.data.data.actionResult;
              if (success == "1") {
                // 评论成功
                wx.hideLoading()
                app.showLoading("评论成功", "none");
              }else{
                // 评论失败
              }
            } else {
              app.showLoading(res.data.msg, "none");
            }
        })
      )
    }
  },
  reloadNews:function(e){
    wx.pageScrollTo({
      scrollTop: 0
    })
    wx.showLoading({
      title:"加载中"
    })
    // 当前页面切换新闻
    let id = e.currentTarget.dataset.id;
    this.setData({
      recordId:id
    })
    // 初始化文章内容
    this.initDetail(id)

    // 初始化相关课程
    this.initSkuList(id)

    // 初始化相关评论
    this.initCommentList(id)

    // 初始化文章相关推荐
    this.initNewsList(id)
  },
  to_kecheng:function(e){
   // 先判断是否购买过该课程
    let that = this;
    let sku_id = e.currentTarget.dataset.skuid;
    // console.log(sku_id)
    app.wxRequest("coreapi/core/v1/querySkuInfo",
      {
        skuId:sku_id,       //课程id
      },
      "POST",function (res) {
        if (res.data.code == 0) {
          // console.log(res.data.data.is_buy)
          if (res.data.data.is_buy == "0") {
            wx.navigateTo({
              url:"../../../../pages/commonPage/noBuyDetails/noBuyDetails?skuId="+sku_id
            })
          }else{
            wx.navigateTo({
              url:"../../../../pages/commonPage/buyDetailsEnd/buyDetailsEnd?skuId="+sku_id
            })
          }
          
        } else {
          app.showLoading(res.data.msg, "none");
        }
    })
  },
  to_recommend:function(e){
    let token = app.globalData.token;
    wx.navigateTo({
      url:'../recommend_details/recommend_details?teacherId='+e.currentTarget.dataset.id
    })
  },
  // 关注
  follow:function(e){
    let that = this;
    let id = e.currentTarget.dataset.id;
    let token = app.globalData.token;
    if (token) {
      app.wxRequest("coreapi/core/v1/sendUserFollow",
        {
          fId:id,           //老师或者用户的id
          fType:"1",       //用户类型，0用户，1老师
        },
        "POST",function (res) {
          if (res.data.code == 0) {
            // console.log(res)
            let _Follow = res.data.data;
            if (_Follow.actionResult == "1") {
              // 关注成功
              that.setData({
                isFollow:false
              })
              that.initDetail(that.data.recordId)
              app.showLoading("关注成功", "none");
            }else{
              // 关注失败
            }
          } else {
            app.showLoading(res.data.msg, "none");
          }
      })
    }else{
      wx.navigateTo({
        url:'../../../loginPackage/pages/login/login'
      })
    }
  },
  onShareAppMessage: function (res) {
    let that = this;
    if (res.from === 'button') {
      // 来自页面内转发按钮
      // console.log(res.target)
    }
    return {
      // title: '分享标题',
      path: '/pages/school/school',
      imageUrl:'../../../../images/icon.jpg'
    }
  },
})
