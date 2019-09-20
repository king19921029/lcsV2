//logs.js

Page({
  data: {
    isSearch: false
  },
  search:function(e){
  	// console.log(e.detail.value)
  },
  to_more:function(){
  	wx.navigateTo({
  		url:'../searchKC/searchKC'
  	})
  },
  onLoad: function () {
    
  }
})
