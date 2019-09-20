//logs.js
const app = getApp();
const uuid = require('util.js');
Page({
  data: {
    initPlaceholder:'',
    searchData:[],      //搜索结果记录数组
    isSearch: true,     //是否为搜索页，非搜索结果页
    searchList:[],      //无用
    lookMore:true,      //查看所有搜索记录
    removeAll:false,    //删除全部搜索记录按钮
    noSearchData:false,  //没有搜索到结果

    isFocus:true
  },
  to_back:function(){
    wx.navigateBack()
  },
  // 开始搜索
  beginSearch:function(e){
    let that = this;
    let keyword = that.data.searchContent;
    
    if (keyword == undefined) {
      app.showLoading("搜索内容不能为空", "none");
    }else if(keyword == ''){
      app.showLoading("搜索内容不能为空", "none");
    }else {
      app.wxRequest("coreapi/core/v1/queryObjectList",
      { keyword: keyword, size: 5, skip: 0}, "POST", function (res) {
        let data = res.data.data;
        if (res.data.code == 0) {

          // console.log(res.data.data.activityList.length,res.data.data.newsList.length,res.data.data.skuList.length)
          if (res.data.data.activityList.length == 0 && res.data.data.newsList.length == 0 && res.data.data.skuList.length == 0) {
            // console.log("未搜到结果")
            that.setData({
              noSearchData:true,
              activityList: res.data.data.activityList,
              newsList:res.data.data.newsList,
              skuList:res.data.data.skuList,
              isSearch: false
            })
          }else{
            // console.log("搜索到结果")
            that.setData({
              noSearchData:false,
              activityList: res.data.data.activityList,
              newsList:res.data.data.newsList,
              skuList:res.data.data.skuList,
              isSearch: false
            })
          }


          // 本地缓存搜索记录
          let searchData = wx.getStorageSync("searchData") || [];
          // console.log(searchData)
          if (searchData.indexOf(keyword) > -1) {
            // console.log("搜索过")
            return
          }else{
            searchData.unshift(keyword)
            // console.log(searchData)

            wx.setStorageSync("searchData",searchData.splice(0,10))
          }
        } else {
          app.showLoading(res.data.msg, "none");
        }
      })
    }
  },
  // 获取输入内容
  search:function(e){
    this.setData({
      searchContent:e.detail.value
    })
  },
  // 全部搜索记录
  lookMore:function(){
    let that = this;
    let searchData = wx.getStorageSync("searchData");
    that.setData({
      lookMore:false,
      removeAll:true,
      searchData:searchData
    })

  },
  clear:function(){
    let that = this
   let searchData = wx.getStorageSync("searchData");

    if (searchData.length>2) {
      that.setData({
        lookMore:true,
        removeAll:false,
        searchData:searchData.slice(0,2)
      })
    }else{
      that.setData({
        lookMore:false,
        searchData:searchData
      })
    }

    that.setData({
      isSearch:true,
      noSearchData:false,
      searchContent:''
    })
  },
  // 查看更多
  to_more:function(e){
    let type = e.currentTarget.dataset.type;
    let keyword = this.data.searchContent;
    // console.log(keyword)

  	wx.navigateTo({
  		url:'../searchKC/searchKC?keyword='+keyword+'&type='+type
  	})
  },
  // 跳转课程详情页
  to_kecheng_detail:function(e){
    // 先判断是否购买过该课程
    let that = this;
    let sku_id = e.currentTarget.dataset.id;
    // console.log(sku_id)
    app.wxRequest("coreapi/core/v1/querySkuInfo",
      {
        skuId:sku_id,       //课程id
      },
      "POST",function (res) {
        if (res.data.code == 0) {
          wx.setStorageSync("skuInfo", res.data.data)
          // console.log(res.data.data)
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
  // 跳转文章页面
  to_writing:function(e){
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url:'../../../societyPackage/pages/writings_details/writings_details?id='+id
    })
  },
  // 跳转活动页面
  to_active:function(e){
    let id = e.currentTarget.dataset.id;
    // console.log(id)
    app.wxRequest("coreapi/core/v1/queryActivityWebInfo",
      {
        activityId:id,       //课程id
      },
      "POST",function (res) {
        if (res.data.code == 0) {
          // console.log(res.data.data.web_url)
          wx.navigateTo({
            url:'../../../../pages/webView/webView?url='+res.data.data.web_url
          })
        } else {
          app.showLoading(res.data.msg, "none");
        }
    })
  },
  // 热门搜索带人关键词
  initSearch:function(e){
    let that = this;
    let initSearch = e.currentTarget.dataset.initsearch;
    // console.log(initSearch)
    that.setData({
      searchContent:initSearch
    })

    that.beginSearch()
  },
  // 删除全部搜索记录按钮
  removeAll:function(){
    this.setData({
      lookMore:false,
      removeAll:false,
      searchData:[]
    })
    wx.clearStorageSync("searchData")
  },
  // 删除单条记录
  removeThis:function(e){
    let that = this;
    let index = e.currentTarget.dataset.index;
    let searchData = wx.getStorageSync("searchData");
    if (that.data.lookMore ==true) {
      searchData.splice(index,1)
      that.setData({
        searchData:searchData.slice(0,2)
      })

      wx.setStorageSync("searchData",searchData)

      if (that.data.searchData.length==0) {
        that.setData({
          lookMore:false,
          removeAll:false
        })
      }
    }else {
      searchData.splice(index,1)
      that.setData({
        searchData:searchData
      })
      wx.setStorageSync("searchData",searchData)

      if (that.data.searchList.length==0) {
        that.setData({
          lookMore:false,
          removeAll:false
        })
      }
    }
  },
  onLoad: function (options) {
    console.log(options)
    let that = this;
    // let hotKeyword = options.hotKeyword;
    // console.log(options)
    if (options) {
      that.setData({
        // searchContent:options.hotKeyword
        initPlaceholder:options.hotKeyword
      })
    }

    // 加载热搜词条
    that.initHot()
    // wx.clearStorage()
    if (!wx.getStorageSync("searchData")){
      // console.log("没有")
      that.setData({
        lookMore:false
      })
    }else{
      // console.log(wx.getStorageSync("searchData"))
      let searchData = wx.getStorageSync("searchData");

      if (searchData.length>2) {
        that.setData({
          searchData:searchData.slice(0,2)
        })
      }else{
        that.setData({
          lookMore:false,
          searchData:searchData
        })
      }
    }
  },
  // 加载热搜词条
  initHot:function(){
    let that = this;
    app.wxRequest("coreapi/core/v1/queryHotSearchKeyWordList",
      {
        showType:4,       //课程id
      },
      "POST",function (res) {
        // console.log(res.data.data)
        if (res.data.code == 0) {
         that.setData({
          hotList:res.data.data
         })
        } else {
          app.showLoading(res.data.msg, "none");
        }
    })
  },
  onShow:function(){
    // 页面轨迹记录
    let viewTime = app.globalData.viewTime;
    app.onPageViewTime(viewTime)


    let pages = getCurrentPages();//当前页面
    let currPage = pages[pages.length - 1];//上一页面
    if (currPage.data.from) {
      // console.log(currPage.data.from)
      this.setData({
        isSearch:true
      })
    }
  },
  onHide:function(){
    // 页面轨迹记录
    let uuids = uuid.create_UUID();//uid
    let pageCode = "4001";//页面CODE
    let beginTime = app.globalData.beginTime;//页面开始时间戳
    let endTime = Date.parse(new Date()) / 1000;//结束时间戳
    app.stopPageViewTime(uuids, pageCode, beginTime, endTime)
  },
  onUnload:function(){
    // 页面轨迹记录
    let uuids = uuid.create_UUID();//uid
    let pageCode = "4001";//页面CODE
    let beginTime = app.globalData.beginTime;//页面开始时间戳
    let endTime = Date.parse(new Date()) / 1000;//结束时间戳
    app.stopPageViewTime(uuids, pageCode, beginTime, endTime)
  },
})
