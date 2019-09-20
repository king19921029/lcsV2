//logs.js
let app = getApp();
Page({
  data: {
    // isSearch: false
    value:'',
    initSize:10,
    initSkip:0
  },
  onLoad: function (options) {
  	let that = this;
  	let keyword = options.keyword;
    let type = options.type;
    let size = that.data.initSize;
    let skip = that.data.initSkip;
    that.setData({
      value:keyword,
      type:type
    })
    app.wxRequest("coreapi/core/v1/queryObjectList",
      { 
        keyword: keyword,
        size: size, 
        skip: skip
      }, "POST", function (res) {
        let data = res.data.data;
        if (res.data.code == 0) {


          that.setData({
            activityList: res.data.data.activityList,
            newsList:res.data.data.newsList,
            skuList:res.data.data.skuList
          })
        } else {
          app.showLoading(res.data.msg, "none");
        }
      })
  },
  onShow:function(){
    let model = wx.getStorageSync("model")
    this.setData({
      model:model
    })
    // console.log(model)
  },
  to_search:function(){
    // wx.redirectTo({
    //   url:"../search/search"
    // })
    // wx.navigateBack({
    //   delta:1
    // })
    let pages = getCurrentPages();//当前页面
    let prevPage = pages[pages.length - 2];//上一页面
    prevPage.setData({
      from:"result"
    })
    wx.navigateBack({
      delta:1
    })
  },
  to_details:function(e){
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
  to_writing:function(e){
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url:'../../../societyPackage/pages/writings_details/writings_details?id='+id
    })
  },
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
  backSearch:function(){
    wx.navigateBack()
  },
  onReachBottom: function() {
    // Do something when page reach bottom.
    // console.log("触底")
    // app.showLoading("正在加载","loading")
    wx.showLoading({
      title: '加载中',
    })
    let that = this;
    let keyword = that.data.value;
    let size = that.data.initSize;
    let skip = that.data.initSkip + that.data.initSize;

    app.wxRequest("coreapi/core/v1/queryObjectList",
      {
        keyword: keyword, 
        size: size, 
        skip: skip
      },
      "POST",function (res) {
        if (res.data.code == 0) {
          let skuList = res.data.data.skuList;
          let skuList2 = that.data.skuList;

          if (skuList.length <= 0 ) {
            wx.hideLoading()
            app.showLoading("没有更多数据了", "none");
            return
          }else{
            for (var i = 0; i < skuList.length; i++) {
              skuList[i].isShow = false;
              skuList2.push(skuList[i])
            }
            wx.hideLoading()
            // console.log(reachRecordList)
            that.setData({
              skuList:skuList2,
              initSkip:skip
            })
          }
        } else {
          app.showLoading(res.data.msg, "none");
        }
    })
  },
})
