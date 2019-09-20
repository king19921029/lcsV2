let app = getApp();
Page({
	data:{
		
	},
	onLoad:function(options){
		wx.showLoading()
		let that = this;
		let cwId = options.cwId;
		that.setData({
			cwId:cwId
		})
		// console.log(cwId)
		that.initUserQPResult(cwId)
		that.drawBg()


		if (options.back) {
			that.setData({
				back:"lx"
			})
		}
	    // that.drawProgress()
	},
	onShow:function(){
		let that = this;
		let model = wx.getStorageSync("model")
		// console.log(model)
		wx.getSystemInfo({

		　　success:function(res){
				// console.log(res.system.substr(0,1))
				if (res.system.substr(0,1) == "i") {
					// console.log("ios")
					that.setData({
						isIos:true
					})
				}else{
					// console.log("Android")
					that.setData({
						isIos:false
					})
				}
		　　　　// res里边就有你想要的信息

		　　}

		})
	},
	drawBg:function(){
		// 使用 wx.createContext 获取绘图上下文 context
	    var ctx = wx.createCanvasContext('bgCanvas')
	    ctx.setLineWidth(1);// 设置圆环的宽度
    	ctx.setStrokeStyle('#bbbdb5'); // 设置圆环的颜色
    	ctx.setLineCap('round') // 设置圆环端点的形状
    	ctx.beginPath();//开始一个新的路径
    	ctx.arc(36, 36, 30, 0, 2 * Math.PI, false);
    	//设置一个原点(100,100)，半径为90的圆的路径到当前路径
    	ctx.stroke();//对当前路径进行描边
    	ctx.draw();
	},
	drawProgress:function(n){
		// 使用 wx.createContext 获取绘图上下文 context
	    var ctx = wx.createCanvasContext('progressCanvas')
	    ctx.setLineWidth(4);// 设置圆环的宽度
    	ctx.setStrokeStyle('#ff5628'); // 设置圆环的颜色
    	ctx.setLineCap('round') // 设置圆环端点的形状
    	ctx.beginPath();//开始一个新的路径
    	// ctx.arc(35, 35, 31, -Math.PI / 2, 1.2*Math.PI - Math.PI / 2, false);
    	ctx.arc(36, 36, 31 ,1.5 * Math.PI, n * Math.PI + 1.5 * Math.PI, false);	//十分是0.2
    	//设置一个原点(100,100)，半径为90的圆的路径到当前路径
    	ctx.stroke();//对当前路径进行描边
    	ctx.draw();
	},
  	initUserQPResult:function(cwId){
  		let that = this;
  		// app.isToken().then(
	      app.wxRequest("coreapi/core/v1/queryUserQPResult",
	        {
	          cwId:cwId,
	          // cwId:"b7e6b40f-e7df-11e8-9fff-00163e101f18",
	          type:"0"
	        },
	        "POST",function (res) {
	          if (res.data.code == 0) {
	            // console.log(res)
	            let QPResult = res.data.data;
	            that.setData({
	            	QPResult:QPResult
	            })

	            // 画分数program
	            let acr = parseInt(QPResult.point) * 0.02;
	            that.drawProgress(acr)

	            wx.hideLoading()
	          } else {
	            app.showLoading(res.data.msg, "none");
	          }
	      })
	    // )
  	},
  	reload_answer:function(){
  		let pages = getCurrentPages();
  		let prevPage = pages[pages.length - 3];
  		let cwId = this.data.cwId;
  		// console.log("返回再答一次"+cwId)

  		prevPage.setData({
        	testData: { cwId: cwId, current:0 , isResult:0}
  		})

  		if (this.data.back == "lx") {
  			wx.redirectTo({
	  			url:'../checkout_detail/checkout_detail?cwId='+cwId
	  		})
  		}else{
  			wx.navigateBack({
				delta: 2
			})
  		}
  		
  		
  	},
  	backHome:function(){
  		if (this.data.back == "lx") {
  			wx.navigateBack({
	  			delta:1
	  		})
  		}else{
  			wx.navigateBack({
	  			delta:3
	  		})
  		}
  		
  	}
})