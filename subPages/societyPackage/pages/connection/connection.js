//logs.js
let app = getApp()
const uuid = require('util.js');
Page({
  data: {
    num:1,    //tab切换状态  关注/推荐
    index:0,  //当前切换索引值
    array: ['全部好友', '同课的人'],


    isLogin:false,       //是否登录  默认未登录
    initFollowSize:10,    //初始化关注列表每页条数
    initFollowSkip:0,      //初始化关注列表初始页码

    initRecommendSize:10, //初始化推荐列表每页条数
    initRecommendSkip:0,   //初始化推荐列表初始页码


    isMicPlay:false,
    isIpx:false,     //iphonex适配

    addInitSkip: -6
  },
  sameMore:function(e){
    wx.showLoading()
    let that = this;
    let index = e.currentTarget.dataset.index;
    let followListToger = that.data.followListToger;
    let num = followListToger[index].user_list.length;
    let sku_id = followListToger[index].sku_id;
    let skip = that.data.addInitSkip + 10;
    app.wxRequest("coreapi/core/v1/queryUserFollowSameSkuList",
      {
        skuId:sku_id,
        skip:num,
        size:10,
      },
      "POST",function (res) {
        
        let list = res.data.data;
        if (list.length > 0 && list.length < 10) {
          for (var i = 0; i < list.length; i++) {
            followListToger[index].user_list.push(list[i])
          }
          that.setData({
            addInitSkip:skip,
            followListToger:followListToger
          })
          wx.hideLoading()
        }else{
          // that.setData({
          //   addInitSkip:skip,
          //   followListToger:followListToger
          // })
          app.showLoading("没有更多了","none")
          wx.hideLoading()
        }
      })
  },
  tabNum:function(e){
  	// console.log(e.currentTarget.dataset.num)
  	let that = this;
  	let num = e.currentTarget.dataset.num;
    let index = that.data.index;
  	if (num == 1) {
      
  		that.setData({
  			num:1,
        initFollowSize:10,
        initFollowSkip:0
  		})
      this.initFollowList("0")

      // 页面轨迹记录
      let viewTime = app.globalData.viewTime;
      app.onPageViewTime(viewTime)
      // 页面轨迹记录
      let uuids = uuid.create_UUID();//uid
      let pageCode = "3006";//页面CODE
      let beginTime = app.globalData.beginTime;//页面开始时间戳
      let endTime = Date.parse(new Date()) / 1000;//结束时间戳
      app.stopPageViewTime(uuids, pageCode, beginTime, endTime)

  	}else if(num == 2){
      
  		that.setData({
  			num:2,
        initRecommendSize:10,
        initRecommendSkip:0
  		})
      this.initRecommendList()

      if (index == 0) {
        // 页面轨迹记录
        let viewTime = app.globalData.viewTime;
        app.onPageViewTime(viewTime)
        // 页面轨迹记录
        let uuids = uuid.create_UUID();//uid
        let pageCode = "3004";//页面CODE
        let beginTime = app.globalData.beginTime;//页面开始时间戳
        let endTime = Date.parse(new Date()) / 1000;//结束时间戳
        app.stopPageViewTime(uuids, pageCode, beginTime, endTime)
      }else{
        // 页面轨迹记录
        let viewTime = app.globalData.viewTime;
        app.onPageViewTime(viewTime)
        // 页面轨迹记录
        let uuids = uuid.create_UUID();//uid
        let pageCode = "3005";//页面CODE
        let beginTime = app.globalData.beginTime;//页面开始时间戳
        let endTime = Date.parse(new Date()) / 1000;//结束时间戳
        app.stopPageViewTime(uuids, pageCode, beginTime, endTime)
      }


  	}else if(num == 3){
  		that.setData({
  			num:3
  		})
  	}
  },
  follow:function(e){
    let that = this;
    let type = e.currentTarget.dataset.type;
    let userid = e.currentTarget.dataset.userid;
    // console.log(type,userid)
    // app.isToken().then(
    let RecommendList = that.data.RecommendList;
    let index = e.currentTarget.dataset.index;
    console.log(index)
      app.wxRequest("coreapi/core/v1/sendUserFollow",
        {
          fId:userid,           //老师或者用户的id
          fType:type,       //用户类型，0用户，1老师
        },
        "POST",function (res) {
          if (res.data.code == 0) {
            // console.log(res)
            let _Follow = res.data.data;
            if (_Follow.actionResult == "1") {
              // 关注成功
              app.showLoading("关注成功", "none");
              RecommendList[index].isShow = true;
              that.setData({
                RecommendList:RecommendList
              })
            }else{
              // 关注失败
              app.showLoading("关注失败", "none");
            }
          } else {
            app.showLoading(res.data.msg, "none");
          }
      })
    // )
  },
  bindPickerChange: function(e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })

    this.initFollowList(e.detail.value)
  },
  to_followDetails:function(){
    wx.navigateTo({
      url:'../follow_details/follow_details'
    })
  },
  to_recommend:function(e){
    let type = e.currentTarget.dataset.type;  //user_type（用户类型,0为普通用户,1为老师）
    let id = e.currentTarget.dataset.userid;  //（用户ID）
    // console.log(e,type,id)
    if (type == 1) {
      wx.navigateTo({
        url:'../recommend_details/recommend_details?teacherId='+id
      })
    }else{
      wx.navigateTo({
        url:'../follow_details/follow_details?viewUserId='+id
      })
    }
  },
  to_my:function(){
    wx.navigateTo({
      url:'../../../personalPackage/pages/my/my'
    })
  },
  onLoad: function () {
    this.initFollowList("0")
    
  },
  go_login:function(){
    wx.navigateTo({
      url:'../../../loginPackage/pages/login/login'
    })
  },
  onShow:function(){
    // console.log("播放状态"+app.globalData.isMicPlay)
    let token = app.globalData.token;
    this.setData({
      isMicPlay: app.globalData.isMicPlay
    })
    // console.log(token) 
    if (token) {
      this.setData({
        isLogin:true
      })

      this.initFollowList("0")
      // // 页面轨迹记录
      let viewTime = app.globalData.viewTime;
      app.onPageViewTime(viewTime)
    }else{
      this.setData({
        isLogin:false
      })
    }

    this.setData({
      isIpx:app.globalData.isIpx
    })
  },
  // 初始化关注列表
  initFollowList:function(type){
    let that = this;
    // let size = that.data.initFollowSize;
    // let skip = that.data.initFollowSkip;
    let size = "10";
    let skip = "0";
    
    // app.isToken().then(
      app.wxRequest("coreapi/core/v1/queryUserFollowList",
        {
          type:type,
          size:size,
          skip:skip
        },
        "POST",function (res) {
          if (res.data.code == 0) {

            // console.log(res)
            if (type == 0) {
              let followList = res.data.data;
              that.setData({
                followList:followList
              })
              // 停止下拉
              wx.stopPullDownRefresh()
            }else{
              let followListToger = res.data.data;
              console.log(followListToger)
              let user_list_arr = [];
              for (var i = 0; i < followListToger.length; i++) {
                for (var j = 0; j < followListToger[i].user_list.length; j++) {
                  user_list_arr.push(followListToger[i].user_list[j])
                }
              }
              // console.log(user_list_arr)
              that.setData({
                user_list_arr:user_list_arr,
                followListToger:followListToger
              })
              // 停止下拉
              wx.stopPullDownRefresh()
              console.log(that.data.user_list_arr)
            }
          } else {
            app.showLoading(res.data.msg, "none");
          }
      })
    // )
  },
  onReachBottom: function() {
    
    let that = this;
    let sizeFollow = that.data.initFollowSize;
    let skipFollow = that.data.initFollowSkip + that.data.initFollowSize;
    let sizeRecommend = that.data.initRecommendSize;
    let skipRecommend = that.data.initRecommendSkip + that.data.initRecommendSize;
    let id = that.data.recordId;
    let num = that.data.num;
    let index = that.data.index;
    if (num == 1) {   //关注
      if (index == 0) {
        wx.showLoading({
          title: '加载中',
        })
        app.wxRequest("coreapi/core/v1/queryUserFollowList",
          {
            type:0,
            size:sizeFollow,
            skip:skipFollow
          },
          "POST",function (res) {
            if (res.data.code == 0) {
              // console.log(res)
              let followList = res.data.data;
              let followList2 = that.data.followList;

              if (followList.length <= 0 ) {
                wx.hideLoading()
                app.showLoading("没有更多数据了", "none");
                return
              }else{
                for (var i = 0; i < followList.length; i++) {
                  followList[i].isShow = false;
                  followList2.push(followList[i])
                }
                wx.hideLoading()
                // console.log(reachRecordList)
                that.setData({
                  followList:followList2,
                  initFollowSkip:skipFollow
                })
              }
            } else {
              app.showLoading(res.data.msg, "none");
            }
        })
      }else if(index == 1){
        wx.showLoading({
          title: '加载中',
        })
        app.wxRequest("coreapi/core/v1/queryUserFollowList",
          {
            type:1,
            size:sizeFollow,
            skip:skipFollow
          },
          "POST",function (res) {
            if (res.data.code == 0) {
              // console.log(res)
              let followList = res.data.data;
              let followList2 = that.data.followList;

              if (followList.length <= 0 ) {
                wx.hideLoading()
                app.showLoading("没有更多数据了", "none");
                return
              }else{
                for (var i = 0; i < followList.length; i++) {
                  followList[i].isShow = false;
                  followList2.push(followList[i])
                }
                wx.hideLoading()
                // console.log(reachRecordList)
                that.setData({
                  followList:followList2,
                  initFollowSkip:skipFollow
                })
              }
            } else {
              app.showLoading(res.data.msg, "none");
            }
        })
      }
    }else if(num == 2){
      wx.showLoading({
        title: '加载中',
      })
      app.wxRequest("coreapi/core/v1/queryUserRecommendList",
        {
          size:sizeRecommend,
          skip:skipRecommend
        },
        "POST",function (res) {
          if (res.data.code == 0) {
            // console.log(res)
            let RecommendList = res.data.data;
            let RecommendList2 = that.data.RecommendList

            if (RecommendList.length <= 0 ) {
              wx.hideLoading()
              app.showLoading("没有更多数据了", "none");
              return
            }else{
              for (var i = 0; i < RecommendList.length; i++) {
                RecommendList[i].isShow = false;
                RecommendList2.push(RecommendList[i])
              }
              wx.hideLoading()
              // console.log(reachRecordList)
              that.setData({
                RecommendList:RecommendList2,
                initRecommendSkip:skipRecommend
              })
            }
          } else {
            // console.log(res)
            app.showLoading(res.data.msg, "none");
          }
      })
    }
  },
  // 初始化推荐列表
  initRecommendList:function(){
    let that = this;
    // app.isToken().then(
      app.wxRequest("coreapi/core/v1/queryUserRecommendList",
        {
          size:"10",
          skip:"0"
        },
        "POST",function (res) {
          if (res.data.code == 0) {
            // console.log(res)
            let RecommendList = res.data.data;
            for (var i = 0; i < RecommendList.length; i++) {
              RecommendList[i].isShow = false
            }
            that.setData({
              RecommendList:RecommendList
            })
            // 停止下拉
            wx.stopPullDownRefresh()
          } else {
            // console.log(res)
            app.showLoading(res.data.msg, "none");
          }
      })
    // )
  },
  onHide:function(){
    let that = this;
    let num = that.data.num;
    let index = that.data.index;
    if (num == 1) {

      // 页面轨迹记录
      let viewTime = app.globalData.viewTime;
      app.onPageViewTime(viewTime)
      // 页面轨迹记录
      let uuids = uuid.create_UUID();//uid
      let pageCode = "3006";//页面CODE
      let beginTime = app.globalData.beginTime;//页面开始时间戳
      let endTime = Date.parse(new Date()) / 1000;//结束时间戳
      app.stopPageViewTime(uuids, pageCode, beginTime, endTime)

    }else if(num == 2){


      if (index == 0) {
        // 页面轨迹记录
        let viewTime = app.globalData.viewTime;
        app.onPageViewTime(viewTime)
        // 页面轨迹记录
        let uuids = uuid.create_UUID();//uid
        let pageCode = "3004";//页面CODE
        let beginTime = app.globalData.beginTime;//页面开始时间戳
        let endTime = Date.parse(new Date()) / 1000;//结束时间戳
        app.stopPageViewTime(uuids, pageCode, beginTime, endTime)
      }else{
        // 页面轨迹记录
        let viewTime = app.globalData.viewTime;
        app.onPageViewTime(viewTime)
        // 页面轨迹记录
        let uuids = uuid.create_UUID();//uid
        let pageCode = "3005";//页面CODE
        let beginTime = app.globalData.beginTime;//页面开始时间戳
        let endTime = Date.parse(new Date()) / 1000;//结束时间戳
        app.stopPageViewTime(uuids, pageCode, beginTime, endTime)
      }


    }
  },
  onUnload:function(){
    let that = this;
    let num = that.data.num;
    let index = that.data.index;
    if (num == 1) {

      // 页面轨迹记录
      let viewTime = app.globalData.viewTime;
      app.onPageViewTime(viewTime)
      // 页面轨迹记录
      let uuids = uuid.create_UUID();//uid
      let pageCode = "3006";//页面CODE
      let beginTime = app.globalData.beginTime;//页面开始时间戳
      let endTime = Date.parse(new Date()) / 1000;//结束时间戳
      app.stopPageViewTime(uuids, pageCode, beginTime, endTime)

    }else if(num == 2){


      if (index == 0) {
        // 页面轨迹记录
        let viewTime = app.globalData.viewTime;
        app.onPageViewTime(viewTime)
        // 页面轨迹记录
        let uuids = uuid.create_UUID();//uid
        let pageCode = "3004";//页面CODE
        let beginTime = app.globalData.beginTime;//页面开始时间戳
        let endTime = Date.parse(new Date()) / 1000;//结束时间戳
        app.stopPageViewTime(uuids, pageCode, beginTime, endTime)
      }else{
        // 页面轨迹记录
        let viewTime = app.globalData.viewTime;
        app.onPageViewTime(viewTime)
        // 页面轨迹记录
        let uuids = uuid.create_UUID();//uid
        let pageCode = "3005";//页面CODE
        let beginTime = app.globalData.beginTime;//页面开始时间戳
        let endTime = Date.parse(new Date()) / 1000;//结束时间戳
        app.stopPageViewTime(uuids, pageCode, beginTime, endTime)
      }


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
  // 下拉刷新
  onPullDownRefresh: function(){
    let num = this.data.num;  //tab切换 关注 推荐
    if (num == 1) {
      this.initFollowList("0")
    }else {
      this.initRecommendList()
    }
    
  }
})
