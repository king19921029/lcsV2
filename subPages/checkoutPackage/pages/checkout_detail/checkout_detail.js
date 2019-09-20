var iTimer;
let app = getApp();
let touchDotX = 0;//X按下时坐标
let touchDotY = 0;//y按下时坐标
let interval;//计时器
let time = 0;//从按下到松开共多少时间*100
Page({
	data:{
		indicatorDots:false,
		current:0,			//当前题号
		seconds:0,
    isFrist:false,
    time:'00:00:00',
    cost:0,
    questionList:[],
    QuestionList:[],
    isResult:0				//0结果页返回，1答题卡页返回
	},
	initQuestion:function(cwId){
		wx.showLoading({
			title:"加载中"
		})
		let that = this;
		let current = that.data.current;
		// app.isToken().then(
      app.wxRequest("coreapi/core/v1/queryQuestionDetailByCwId",
        {
          cwId:cwId,
          size:"1",
          skip:current
        },
        "POST",function (res) {
          if (res.data.code == 0) {
            // console.log(res)
            let Question = res.data.data;
            let qListNew = [res.data.data.question_list[current]];
            // console.log(qListNew)

            for (var i = 0; i < qListNew.length; i++) {
              for (var j = 0; j < qListNew[i].aList.length; j++) {
                qListNew[i].aList[j].checked = false
              }
            }
            // console.log(qListNew)
            that.setData({
              Question:Question,
              QuestionNum:Question.qp_count,
              QuestionList:qListNew,
            })
            // WxParse.wxParse('qName', 'html', qListNew[0].qName, that, 5);
            

            wx.hideLoading()
            // for (var i = 0; i < qListNew[0].aList.length; i++) {
            // 	WxParse.wxParse('AText' + i, 'html', qListNew[0].aList[i].AText, that, 5);
            // }
            

            // console.log(Question.question_list[current].qType)
            if (Question.question_list[current].qType == 0) {
              // 单选
              that.setData({
                QuestionType:true
              })
            }else{
              // 多选
              that.setData({
                QuestionType:false
              })
            }
            
            that.initActive()
            // 开始计时
            // if (that.data.seconds != 0) {
            //   clearTimeout(iTimer);
            // }else{
              
            // }


            that.charging(that);
          } else {
            app.showLoading(res.data.msg, "none");
          }
      })
	  // )
	},
	initActive:function(){
		let that = this;
		let storageAlist = wx.getStorageSync("ArrAnswer") || {};//本地存储答案
	    let qList = that.data.QuestionList;//考题
	    // let aListIndex = qList[that.data.current].aList;//当前题目选项
	    let aListIndex = qList[0].aList;//当前题目选项
	    let stoIndex = storageAlist[that.data.current]?storageAlist[that.data.current]:{};


	    // 多选
	    if(stoIndex.codeArr == undefined){
	    	// console.log(stoIndex)
	    	// console.log("不存在codeArr")
	    }else if ( stoIndex.codeArr ){
	      for (var i = 0; i < stoIndex.codeArr.length;i++ ){
	       
	        if (stoIndex.codeArr[i] == aListIndex[i].code ){
	          aListIndex[i].checked = true
	          // console.log(aListIndex[i])
	        }
	      }
	    }
	    
	    // 单选
	    if (stoIndex.code == undefined) {
	    	// console.log(stoIndex)
	    	// console.log("不存在code")
	    }else if (stoIndex.code) {
        	for (var i = 0; i < aListIndex.length; i++) {
          		if (aListIndex[i].code == stoIndex.code) {
		          aListIndex[i].checked = true
		          // console.log(aListIndex[i])
		        }
	      	}
	    }




		that.setData({
			QuestionList:qList
		})
    // console.log(that.data.QuestionList[storageAlist[0].numQ].aList[storageAlist[0].numA])
	},
	// 单选
	choose_answer_D:function(e){
		// console.log(e)
		let that = this;
		let numA = e.currentTarget.dataset.answer;		//选项index值
		let numQ = that.data.current;	//题号index值
		let code = e.currentTarget.dataset.code;		//选项  A B C D
		// console.log("当前题号为"+numQ,"选择的选项为"+code)
		let qList = that.data.QuestionList;
		let aList = wx.getStorageSync("ArrAnswer") || {};
		let current = that.data.current;
		let cwId = that.data.cwId;
		// console.log(numA,numQ)

		// console.log(qList[0])

		for (var i = 0; i < qList[0].aList.length; i++) {
			qList[0].aList[i].checked = false
		}

		that.setData({
			QuestionList:qList
		})
		qList[0].aList[numA].checked = !qList[0].aList[numA].checked;
		that.setData({
			QuestionList:qList
		})


		aList[numQ] = { numQ , numA , code }
		wx.setStorageSync("ArrAnswer",aList)

		current ++
		if (current >= that.data.QuestionNum) {
			wx.navigateTo({
          		url:"../answer_sheet/answer_sheet?cwId="+ cwId +"&seconds="+that.data.seconds
          	})
		}else{
			that.setData({
				current:current
			})
			that.initQuestion(cwId)
		}
	},
	// 多选
	choose_answer_S:function(e){

		let that = this;
		let numA = e.currentTarget.dataset.answer;
		let numQ = that.data.current;
		let code = e.currentTarget.dataset.code;		//选项  A B C D
	    let qList = that.data.QuestionList;
	    // let aListIndex = qList[that.data.current].aList;//当前题目选项
	    let aListIndex = qList[0].aList;//当前题目选项
		let aList = wx.getStorageSync("ArrAnswer") || {};
	    let codeArr = [];
	    // console.log(numA,numQ)
	    // if (btnId.indexOf(qList[i].code) == -1) {
	    //   qlistArr.push("0");
	    // } else {
	    //   qlistArr.push(qList[i].code);
	    // }
	    // console.log(qList[0].aList[numA])
		qList[0].aList[numA].checked = !qList[0].aList[numA].checked;
		that.setData({
			QuestionList:qList
		})
	    // console.log(code);
	    for (var i = 0; i < aListIndex.length; i++) {
	      // console.log(aListIndex[i]);
	 
	      if ( aListIndex[i].checked == true ){
	        codeArr.push(aListIndex[i].code);
	      }else{
	        codeArr.push("0");
	      }
	    }
	    // console.log(codeArr)
    
		aList[numQ] = { numQ , numA , codeArr }
		wx.setStorageSync("ArrAnswer",aList)
	},
	to_answer_sheet:function(){
		let that = this;
		let cwId = that.data.cwId;
		wx.navigateTo({
			url:'../answer_sheet/answer_sheet?cwId='+ cwId +'&seconds='+that.data.seconds
		})
	},
	to_answer_result:function(){
		wx.navigateTo({
			url:'../checkout_result/checkout_result'
		})
	},
	timing:function(that){
		// console.log(that)
		var seconds = that.data.seconds
		if (seconds > 21599) {
		    that.setData({
		    	time: '6小时，不想继续了gg'
		    });
		    return;
		}
		iTimer = setTimeout(function () {
		    that.setData({
		      seconds: seconds + 1
		    });
		    that.timing(that);
		},1000)
		that.formatSeconds(that)
	},
	formatSeconds:function(that){
		var mins=0,hours=0,seconds=that.data.seconds,time=''
		if(seconds<60){

		}else if(seconds<3600){
		    mins = parseInt(seconds /60)
		    seconds=seconds%60
		}else{
		    mins=parseInt(seconds/60)
		    seconds=seconds%60
		    hours=parseInt(mins/60)
		    mins=mins%60
		}
		that.setData({
		    time:that.formatTime(hours)+':'+that.formatTime(mins)+':'+that.formatTime(seconds)
		});
	},
	formatTime:function(num){
		if(num<10)
		return '0'+num
		else
		return num+''
	},
	charging:function(that){
		if(that.data.seconds<600){
			that.setData({
				cost:1
			})
  		}
	},
	onLoad:function(options){
    
		if (options) {
      
			let cwId = options.cwId;
			let skuId = options.skuId;
			wx.setStorageSync("_skuId",skuId)
			this.setData({
				cwId:cwId
			})
			// 初始化考题
	      this.timing(this);
				this.initQuestion(cwId)
		}else{
	      // 初始化考题
	      if (this.data.seconds != 0) {
	        this.setData({
	          seconds: 0,
	          time: '00:00:00'
	        })
	        clearTimeout(iTimer);
	        this.timing(this);
	      }
	      this.initQuestion(this.data.cwId)
      
		}
		
	},
	onShow:function(){
	    if (this.data.testData ){
	      if (this.data.testData.isResult == 0) {
	        // console.log("返回接收"+this.data.testData.cwId)
	        this.setData({
	          current: this.data.testData.current,
	          cwId:this.data.testData.cwId
	        })
	        
	        this.onLoad()
	      }
	      this.setData({
	        current: this.data.testData.current
	      })
	      this.initQuestion(this.data.testData.cwId)
	    }

	    // wx.getStorage({
	    //   key: 'ArrAnswer',
	    //   success: function (res) {
	    //     wx.showModal({
     //          title: '提示',
     //          content: '是否继续上次答题记录',
     //          success (res) {
     //            if (res.confirm) {
     //              // console.log('用户点击确定')
                  
     //            } else if (res.cancel) {
     //              // console.log('用户点击取消')
     //              wx.removeStorageSync("ArrAnswer")
     //            }
     //          }
     //        })
	    //   },
	    //   fail:function(res){
	        
	    //   }
	    // })
	},
	onReady:function(){
	},
  
	// 触摸开始事件
  touchStart: function(e) {
    touchDotX = e.touches[0].pageX; // 获取触摸时的原点
    touchDotY = e.touches[0].pageY;
    // 使用js计时器记录时间    
    interval = setInterval(function() {
      time++;
    }, 100);
  },
  // 触摸结束事件
  touchEnd: function(e) {
  	let that = this;
    let touchMoveX = e.changedTouches[0].pageX;
    let touchMoveY = e.changedTouches[0].pageY;
    let tmX = touchMoveX - touchDotX;
    let tmY = touchMoveY - touchDotY;
    let current = that.data.current;
    let cwId = that.data.cwId;


    if (time < 20) {
      let absX = Math.abs(tmX);
      let absY = Math.abs(tmY);
      if (absX > 2 * absY) {
        if (tmX<0){
          // console.log("左滑=====")
          current ++
          // console.log(current)

          if (current >= that.data.QuestionNum) {
          	// console.log("最后一题了")
          	wx.navigateTo({
          		url:"../answer_sheet/answer_sheet?cwId="+ cwId +"&seconds="+that.data.seconds
          	})
          }else{
          	that.setData({
          		current:current,
          		QuestionList:[]
          	})
          	that.initQuestion(cwId)
          }
        }else{
          // console.log("右滑=====")
          current --
          // console.log(current)
          if (current < 0) {
          	return
          }else{
          	that.setData({
          		current:current
          	})
          	that.initQuestion(cwId)
          }
        }
      }
      if (absY > absX * 2 && tmY<0) {
        // console.log("上滑动=====")
      }
    }
    clearInterval(interval); // 清除setInterval
    time = 0;
  }
})