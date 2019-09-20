let app = getApp();
Page({
	data:{
		have_noChoose:false,				//是否有未做的题目
		canSend:true
	},
	off:function(){
		this.setData({
			have_noChoose:false
		})
	},
	to_answer:function(){
		wx.navigateTo({
			url:'../checkout_detail/checkout_detail'
		})
	},
	to_checkNum:function(e){
		let num = e.currentTarget.dataset.num;
		// console.log(num)
		let pages = getCurrentPages();
  		let prevPage = pages[pages.length - 2];
  		let cwId = this.data.cwId;

  		// console.log(pages)
  		prevPage.setData({
  			testData:{cwId:cwId,current:num,isResult:1}
  		})
  		wx.navigateBack({
			delta: 1
		})
	},
	onLoad:function(options){
		let that = this;
		// console.log(options)

		that.setData({
			seconds:options.seconds,
			cwId:options.cwId
		})
		// 初始化考题总览
		that.initQuestion()
	},
	initQuestion:function(){
		wx.showLoading({
			title:"加载中"
		})
		let that = this;
		app.isToken().then(
	      app.wxRequest("coreapi/core/v1/queryQuestionDetailByCwId",
	        {
	          cwId:that.data.cwId
	        },
	        "POST",function (res) {
	          if (res.data.code == 0) {
	            let Question = res.data.data.question_list;


	            for (var i = 0; i < Question.length; i++) {
	            	Question[i].checked = false
	            }
	            that.setData({
	              QuestionList:Question
	            })


	            // 初始化大腕的考题
				that.initActive()

				wx.hideLoading()
	          } else {
	            app.showLoading(res.data.msg, "none");
	          }
	      })
	    )
	},
	initActive:function(){
		let that = this;
		let aList = wx.getStorageSync("ArrAnswer");
		let Question = that.data.QuestionList;
		// console.log(Question)
		
		

		for (var i = 0; i < Question.length; i++) {
			if (aList[i] == undefined) {
				// console.log("不存在")
			}else{
				if (aList[i].code) {
					// console.log(aList[i])
					if (aList[i].code != '') {
						Question[i].checked = true
						that.setData({
							QuestionList:Question
						})
					}
				}

				if (aList[i].codeArr) {
					let codeArrJ = aList[i].codeArr;
					// console.log(aList[i].codeArr)
					for (var j = 0; j < codeArrJ.length; j++) {
						// console.log(codeArrJ[j])



						if (codeArrJ[j] != "0") {
							Question[i].checked = true
							that.setData({
								QuestionList:Question
							})
						}
					}
					
				}
			}
		}

		that.initNoAnswer()

		that.initSendMessage()
	},
	initNoAnswer:function(){
		let that = this;
		let _Question = that.data.QuestionList;
		let noAnswerArr = []

		for (var i = 0; i < _Question.length; i++) {
			if (_Question[i].checked == false) {
				noAnswerArr.push(_Question[i])
			}
		}

		let noAnswerLength = noAnswerArr.length;
		if (noAnswerLength > 0) {
			that.setData({
				have_noChoose:true
			})
		}else{
			that.setData({
				have_noChoose:false
			})
		}
		that.setData({
			noAnswerLength:noAnswerLength
		})
	},
	initSendMessage:function(){
		let that = this;
		let storageAlist = wx.getStorageSync("ArrAnswer");
		let question = that.data.QuestionList;
		let answerArr = [];
		for (var i = 0; i < question.length; i++) {
			answerArr.push("0")
		}
		// console.log("1111")
		// console.log(storageAlist)

		for(var item in storageAlist){
			if (storageAlist[item].codeArr) {
				// answerArr.push(storageAlist[item].codeArr.join(''))
				answerArr[item] = storageAlist[item].codeArr.join('')
			}
			if (storageAlist[item].code) {
				// answerArr.push(storageAlist[item].code)
				answerArr[item] = storageAlist[item].code
			}
		}
		that.setData({
			answerArr:answerArr
		})

		for (var i = 0; i < answerArr.length; i++) {
			// console.log(answerArr[i])
			if (answerArr[i] != 0) {
				that.setData({
					canSend:true
				})
				return
			}else{
				that.setData({
					canSend:false
				})
			}
		}
		
	},
	sendQuestion:function(){
		let that = this;
		let seconds = that.data.seconds;
		let cwId = that.data.cwId;
		let answerArr = that.data.answerArr;
		let noAnswerLength = that.data.noAnswerLength;
		// console.log(cwId,seconds,answerArr)
		if (noAnswerLength > 0) {
			wx.showModal({
	        	title: '提示',
	        	content: '您还有'+ noAnswerLength +'道题未答，确定提交考卷吗？',
	        	success (res) {
	          		if (res.confirm) {
		            	// console.log('用户点击确定')
		            	app.isToken().then(
					      app.wxRequest("coreapi/core/v1/sendQPResult",
					        {
					          cwId:that.data.cwId,
					          answer:answerArr,
					          time:seconds
					        },
					        "POST",function (res) {
					          if (res.data.code == 0) {
					            // let actionResult = res.data.data.actionResult;


					            // if (actionResult == 1) {
					            // 	app.showLoading("提交成功", "none");
					            // }
					            wx.removeStorageSync("ArrAnswer")
					            wx.navigateTo({
					            	url:'../checkout_result/checkout_result?cwId='+cwId
					            })
					          } else {
					            app.showLoading(res.data.msg, "none");
					          }
					      })
					    )
		          	} else if (res.cancel) {
		            	// console.log('用户点击取消')
	          		}
	        	}
	      	})
		}else{
			app.showLoading("交卷中......", "none");
			app.isToken().then(
		      app.wxRequest("coreapi/core/v1/sendQPResult",
		        {
		          cwId:that.data.cwId,
		          answer:answerArr,
		          time:seconds
		        },
		        "POST",function (res) {
		          if (res.data.code == 0) {
		            // let actionResult = res.data.data.actionResult;


		            // if (actionResult == 1) {
		            // 	app.showLoading("提交成功", "none");
		            // }
		            wx.removeStorageSync("ArrAnswer")
		            wx.navigateTo({
		            	url:'../checkout_result/checkout_result?cwId='+cwId
		            })
		          } else {
		            app.showLoading(res.data.msg, "none");
		          }
		      })
		    )
		}
	}
})