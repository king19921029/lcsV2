
Page({
  data: {
    isAll:false,
  },
  onLoad: function (options) {

  },
  onReady: function () {

  },
  onShow: function () {

  },
  // 在展开全部
  allTap:function(){
    this.setData({
      isAll:true
    })
  },
  noAllTap:function(){
    this.setData({
      isAll: false
    })
  }

})