let app = getApp()
const uuid = require('util.js');
Page({
  data: {
    imgList:[],
    have_text:false,
    have_img:false
  },
  addImgUpload:function(){
    let that = this;
    let url = app.globalData.url;
    wx.chooseImage({
      count:4,
      sizeType: ['compressed'],
      success (res) {
        const tempFilePaths = res.tempFilePaths.slice(0,4);
        let imgArr = that.data.imgList;
        console.log(tempFilePaths)
        wx.showLoading({
          title:"照片上传中"
        })
        if (tempFilePaths.length > 0) {
          that.setData({
            have_img:true
          })
        }else{
          that.setData({
            have_img:false
          })
        }

        for (var i = 0; i < tempFilePaths.length; i++) {
          wx.uploadFile({
            url: url + '/coreapi/core/v1/uploadImageFile', //仅为示例，非真实的接口地址
            header: {
              "content-type": "application/x-www-form-urlencoded",
              "device-type": "xiaochengxu-maya",
              "version": "0",
              "uuid":"xiaochengxu",
              "x-authorization":app.globalData.token
            },
            filePath: tempFilePaths[i], 
            name: 'fileField',
            formData:{
              // fileField:tempFilePaths[0]
            },
            success (res){
              let data = JSON.parse(res.data).data;
              // console.log(data)
              imgArr.push(data)
              that.setData({
                imgList:imgArr
              })

              wx.hideLoading()
            }
          })
        }
      }
    })
  },
  remove_this:function(e){
    let that = this;
    let thisNum = e.currentTarget.dataset.num;
    let nowImgList = that.data.imgList;
    nowImgList.splice(thisNum,1)
    // console.log(e.currentTarget.dataset.num)
    that.setData({
      imgList:nowImgList
    })

    if (thisNum == 0) {
      that.setData({
        have_img:false
      })
    }
  },
  feedback:function(e){
    let text = e.detail.value;
    // console.log(text)
    if (!text) {
      this.setData({
        have_text:false
      })
    }else{
      this.setData({
        text:text,
        have_text:true
      })
    }
  },
  onShow: function () {
    // 页面轨迹记录
    let viewTime = app.globalData.viewTime;
    app.onPageViewTime(viewTime)


    // console.log("11111")
  },
  onHide:function(){
    // 页面轨迹记录
    let uuids = uuid.create_UUID();//uid
    let pageCode = "3013";//页面CODE
    let beginTime = app.globalData.beginTime;//页面开始时间戳
    let endTime = Date.parse(new Date()) / 1000;//结束时间戳
    app.stopPageViewTime(uuids, pageCode, beginTime, endTime)
  },
  onUnload:function(){
    // 页面轨迹记录
    let uuids = uuid.create_UUID();//uid
    let pageCode = "3013";//页面CODE
    let beginTime = app.globalData.beginTime;//页面开始时间戳
    let endTime = Date.parse(new Date()) / 1000;//结束时间戳
    app.stopPageViewTime(uuids, pageCode, beginTime, endTime)
  },
  // 提交按钮
  subMessage:function(){
    let that = this;
    let text = that.data.text;
    let imgList = that.data.imgList;
    // console.log(text,imgList)
    app.wxRequest("coreapi/core/v1/sendUserFeedback",
      {
        content:text?text:'',
        picUrl1:imgList[0] || '',
        picUrl2:imgList[1] || '',
        picUrl3:imgList[2] || '',
        picUrl4:imgList[3] || ''
      },
      "POST",function (res) {
        if (res.data.code == 0) {
          // console.log(res.data.data.actionResult)
          if (res.data.data.actionResult == "1") {
            app.showLoading("提交成功", "none");

            wx.navigateBack({
              delta:1
            })
          }
        } else {
          app.showLoading(res.data.msg, "none");
        }
    })
  }
})