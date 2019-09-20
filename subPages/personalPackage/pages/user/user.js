let app = getApp();
let list = [];
const uuid = require('util.js');
Page({
  data: {
    user_icon:'',           //头像
    nickname:'',
    sex:'',                 //当前性别选项
    sexarray: ['男', '女'], //性别选项
    birthdate:'',           //当前日期选项
    birthdatePush:'',
    job_type:'',              //当前职位类型
    Profession:[],//职位选项
    work_year:'',         //当前工作年限
    work_yearArray:["0","1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20"], //工作年限选项
    work_yearArray:["1年以下","1-3年","3-5年","5-10年","10年以上"],
    signature:'',  //个性签名

    initCityData:'',  //初始化省市
    cityId:'',
    provinceId:'',    //城市ID
    mulInit:false,    //当前地区是否有默认值
    multiIndex:[],
    multiArray:[],



    pass:false  //跳过按钮
  },
  // 昵称
  bindinputNickname:function(e){
    let that = this;
    // console.log(e.detail.value)
    if (e.detail.value.length > 11) {
      app.showLoading("昵称不能超过12个字符","none")
      that.setData({
        nick_name:e.detail.value.slice(0,11)
      })
    }else{
      that.setData({
        nick_name:e.detail.value
      })
    }
    
  },
  // 性别选项
  bindPickerSexChange: function(e) {
    let that = this;
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    if (e.detail.value == "0") {
      that.setData({
        sex: '男'
      })
    }else{
      that.setData({
        sex: '女'
      })
    }
  },
  // 出生日期
   bindDateChange: function(e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    let chooseDate = e.detail.value;
    let dateArr = chooseDate.split("-");
    let date = dateArr[0]+'年'+dateArr[1]+'月'+dateArr[2]+'日'
    this.setData({
      birthdate: date,
      birthdatePush:e.detail.value
    })
  },



  // 初始化省份、城市
  initProvinces:function(){
    let that = this;
    // app.isToken().then(
      app.wxRequest("coreapi/meta/v1/queryprovinces",
        { },
        "POST",function (res) {
          if (res.data.code == 0) {
            // console.log(res.data.data)
            // 获取数据接口返回的省级数组
            let provincesList = res.data.data;

            // 将数组中省份名称提取出单存入一个新的数组
            let provinceArr = [];
            for (var i = 0; i < provincesList.length; i++) {
              provinceArr.push(provincesList[i].province)
            }

            // 渲染picker第一列
            that.setData({
              multiArray:[provinceArr,[]],
              provincesList,
              provinceArr
            })

            // 设置默认第二列显示的值
            let default_provinceId = provincesList[0].provinceId;
            if (default_provinceId) {
              that.initCity(default_provinceId)
            }
          } else {
            // console.log(res)
            app.showLoading(res.data.msg, "none");
          }
      })
    // )
  },
  // 初始化城市
  initCity:function(provinceId){
    let that = this;
    if (provinceId) {
      that.setData({
        provinceId:provinceId
      })
      // app.isToken().then(
        app.wxRequest("coreapi/meta/v1/querycity",
          { provinceId:provinceId },
          "POST",function (res) {
            if (res.data.code == 0) {
              // console.log(res)
              // 获取接口数据返回的城市数组
              let cityArray = res.data.data;

              // 将数组中城市名称提取出单存入一个新的数组
              let city = [];
              for (var i = 0; i < cityArray.length; i++) {
                city.push(cityArray[i].city)
              }
              
              // 渲染picker第二列
              let provinceArr = that.data.provinceArr;
              that.setData({
                multiArray:[provinceArr,city],
                cityArray,
                city
              })
            } else {
              // console.log(res)
              app.showLoading(res.data.msg, "none");
            }
        })
      // )
    }
  },
  // 省市切换渲染页面
  bindRegionChange: function (e) {
    // console.log(this.data.cityArray)
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      mulInit: true
    })
    // this.setData({
    //   "multiIndex[0]": e.detail.value[0],
    //   "multiIndex[1]": e.detail.value[1]
    // })


    // console.log(this.data.multiArray[0][this.data.multiIndex[0]],this.data.multiArray[0][this.data.multiIndex[1]])

    var class_key = 0;
    var cityArray =this.data.cityArray;
    if (e.detail.value[1] == "u") {
      e.detail.value[1] = 0
      var select_key = 0
    }else{
      var select_key = e.detail.value[1];
    }
    var real_key = select_key - 1;
    if (real_key < class_key) {
      // console.log("--1--"+cityArray[0]['cityId'])
      this.setData({
        cityId: cityArray[0]['cityId']
      })
    } else {
      // console.log("--2--"+cityArray[real_key]['cityId'])
      this.setData({
        cityId: cityArray[real_key]['cityId']
      })
    }

    // let initCityData = this.data.multiArray[0][this.data.multiIndex[0]]+','+this.data.multiArray[1][this.data.multiIndex[1]];
    // console.log(initCityData)
    this.setData({
      multiIndex: e.detail.value
    })
     // console.log(this.data.multiArray[0][this.data.multiIndex[0]]+' '+this.data.multiArray[1][this.data.multiIndex[1]])
    this.setData({
        initCityData:this.data.multiArray[0][this.data.multiIndex[0]]+' '+this.data.multiArray[1][this.data.multiIndex[1]]
    })
  },
  // 监听picker滚动时间，动态渲染列表
  bindMultiPickerColumnChange: function (e){

    let that = this;
    // console.log('修改的列为', e.detail.column, '，值为', e.detail.value)

    var data = {
      multiArray: that.data.multiArray,
      multiIndex: that.data.multiIndex
    };
    data.multiIndex[e.detail.column] = e.detail.value;
    var provinceId_session = that.data.provinceId;

    switch (e.detail.column) {
      case 0:
        var provincesList = that.data.provincesList;
        var provinceId = provincesList[e.detail.value].provinceId;
        if (provinceId_session != provinceId) {　　　　// 与之前保持的省id做对比，如果不一致则重新请求并赋新值
          that.initCity(provinceId);　　　　　　
        }
        data.multiIndex[1] = 0;
        break;
    }
    that.setData(data);
  },



  // 初始化职业
  initProfession:function(){
    let that = this;
    // app.isToken().then(
      app.wxRequest("coreapi/meta/v1/queryprofession",
        { },
        "POST",function (res) {
          if (res.data.code == 0) {
            // console.log(res)
            let fession = [];
            let Profession = res.data.data;
            for (var i = 0; i < Profession.length; i++) {
              fession.push(Profession[i].name)
            }

            that.setData({
              Profession:fession,           //只包含职位名称的数组
              submitProfession:Profession   //包含职位名称以及职位ID的数组
            })
          } else {
            // console.log(res)
            app.showLoading(res.data.msg, "none");
          }
      })
    // )
  },
  // 工作类型
  bindPickerJobChange: function(e) {
    let that = this;
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    that.setData({
      job_type: that.data.Profession[e.detail.value],
      submitJobType:that.data.submitProfession[e.detail.value].id
    })
  },
  // 工作年限选项
  bindPickerTimelongChange: function(e) {
    let that = this;
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    that.setData({
      work_year: that.data.work_yearArray[e.detail.value],
      submitWorkYear: e.detail.value
    })
  },
  // 个性签名
  bindinputSignature:function(e){
    let that = this;
    that.setData({
      signature:e.detail.value
    })
  },
  upload:function(){
    let that = this;
    let url = app.globalData.url;
    wx.chooseImage({
      count:1,
      success (res) {
        const tempFilePaths = res.tempFilePaths
        // console.log(tempFilePaths[0])
        that.setData({
          user_icon:tempFilePaths[0]
        })
        wx.showLoading({
          title:"头像上传中"
        })
        wx.uploadFile({
          url: url+'/coreapi/media/v1/uploadheaderimg', //仅为示例，非真实的接口地址
          header: {
            "content-type": "application/x-www-form-urlencoded",
            "device-type": "xiaochengxu-maya",
            "version": "0",
            "uuid":"xiaochengxu",
            "x-authorization":app.globalData.token
          },
          filePath: tempFilePaths[0], 
          name: 'fileField',
          formData:{
            // fileField:tempFilePaths[0]
          },
          success (res){
            let url = JSON.parse(res.data).data;
            // console.log(JSON.parse(res.data))
            that.setData({
              user_icon:url
            })
            wx.hideLoading()
            //do something
          }
        })
      }
    })
  },
  onLoad: function (options) {

    if (options) {
      if (options.from == "sign") {
        this.setData({
          pass:true
        })
      }
    }



    app.showLoading("加载中","loading")
    // 初始化省份
    this.initProvinces()

    // 初始化职业信息
    this.initProfession()

    //初始化个人信息
    this.initqueryUserInfo()
  },
  // 初始化个人信息
  initqueryUserInfo:function(){
    let that = this;
    app.wxRequest("coreapi/user/v1/getuserinfo",
      { },
      "POST",function (res) {
        if (res.data.code == 0) {
          let _data = res.data.data;
          // console.log(res.data.data)

          // 渲染页面信息
          let user_icon = _data.headerUrl;   //头像
          let nick_name = _data.nickName;    //昵称
          let sex = _data.sex;                //性别
          let birthdate = _data.birthdate;    //出生日期
          let initCityData = _data.cityName+' '+_data.provinceName;    //省份,城市
          // let province_name = _data.provinceName;//省份
          let job_type = _data.jobName;      //职业类型
          let job_type_id = _data.jobType;    //职业类型id
          let work_year = _data.workYear;    //工作年限
          let workYearInit = _data.workYear;  //工作年限代码
          let signature = _data.signature;    //个性签名
          let id = _data.id;

          if (work_year == "0") {
            that.setData({
              work_year:"一年以下"
            })
          }else if(work_year == "1") {
            that.setData({
              work_year:"1-3年"
            })
          }else if(work_year == "2") {
            that.setData({
              work_year:"3-5年"
            })
          }else if(work_year == "3") {
             that.setData({
              work_year:"5-10年"
            })
          }else if(work_year == "4") {
             that.setData({
              work_year:"10年以上"
            })
          }



          // console.log("查看初始化省市"+initCityData)
          that.setData({
            user_icon:user_icon,
            nick_name:nick_name,
            sex:sex=='0'?'男':'女',
            birthdate:that.initData(birthdate),
            job_type:job_type,
            // work_year:work_year,
            id:id,
            cityId:_data.cityId,
            provinceId:_data.provinceId,
            signature:signature,

            job_type_id:job_type_id,
            workYearInit:workYearInit
          })







          if (initCityData) {
            that.setData({
              mulInit: true,
              initCityData:initCityData
            })
          }
        } else {
          // console.log(res)
          app.showLoading(res.data.msg, "none");
        }
    })
  },
  onReady: function () {
    
  },
  onShow: function () {
    // 页面轨迹记录
    let viewTime = app.globalData.viewTime;
    app.onPageViewTime(viewTime)


    let time = new Date().getFullYear()+'-'+new Date().getMonth()+'-'+new Date().getDate();
    this.setData({
      endTimeInit:time
    })
    // console.log(time)
  },
  onHide:function(){
    // 页面轨迹记录
    let uuids = uuid.create_UUID();//uid
    let pageCode = "3014";//页面CODE
    let beginTime = app.globalData.beginTime;//页面开始时间戳
    let endTime = Date.parse(new Date()) / 1000;//结束时间戳
    app.stopPageViewTime(uuids, pageCode, beginTime, endTime)
  },
  onUnload:function(){
    // 页面轨迹记录
    let uuids = uuid.create_UUID();//uid
    let pageCode = "3014";//页面CODE
    let beginTime = app.globalData.beginTime;//页面开始时间戳
    let endTime = Date.parse(new Date()) / 1000;//结束时间戳
    app.stopPageViewTime(uuids, pageCode, beginTime, endTime)
  },
  initData:function(number){
    let that = this;
    var n=number;
    var date = new Date(n);
    var Y = date.getFullYear() + '年';
    var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '月';
    var D = (date.getDate()<10 ? '0'+date.getDate() : date.getDate()) + '日';
    return (Y+M+D)
  },

  // 提交修改信息
  _submit:function(){
    wx.showLoading({
      title:"正在提交"
    })
    let that = this;

    // let dataD = {
    //   birthdate: that.data.birthdatePush || '',    //出生日期,
    //   cityId: that.data.cityId || '',          //城市ID
    //   // cityName: that.data.multiArray[1][that.data.multiIndex[1]] || '北京',   //城市名称
    //   cityName: that.data.initCityData.split(" ")[0] || '',
    //   headerUrl: that.data.user_icon || '',     //头像
    //   id: that.data.id,                       
    //   jobName: "",          
    //   jobType: that.data.job_type || '',        //职业类型
    //   nickName: that.data.nick_name || '',      //昵称          
    //   provinceId: that.data.provinceId,   //省份ID
    //   // provinceName: that.data.multiArray[0][that.data.multiIndex[0]] || '北京',   //省份名称
    //   provinceName: that.data.initCityData.split(" ")[1] || '',
    //   sex: that.data.sex == '男'?'0':'1' || '', //性别
    //   workUnit: "",
    //   workYear: that.data.work_year || '',       //工作年限
    //   signature: that.data.Signature || ''        //个性签名
    // }

    // console.log(dataD)
    app.wxRequest("coreapi/user/v1/updateinfo",
      {
        birthdate: that.data.birthdatePush || '',    //出生日期,
        cityId: that.data.cityId || '',          //城市ID
        cityName: that.data.initCityData.split(" ")[0] || '',   //城市名称
        headerUrl: that.data.user_icon || '',     //头像
        id: that.data.id,                       
        jobName: that.data.job_type,                    //职业类型名称
        jobType: that.data.submitJobType || '',        //职业类型ID
        nickName: that.data.nick_name || '',      //昵称          
        provinceId: that.data.provinceId,   //省份ID
        provinceName: that.data.initCityData.split(" ")[1] || '',   //省份名称
        sex: that.data.sex == '男'?'0':'1' || '', //性别
        workUnit: '',                  //工作单位
        workYear: that.data.submitWorkYear || '',       //工作年限代码
        signature: that.data.signature || ''        //个性签名
      },
      "POST",function (res) {
        if (res.data.code == 0) {
          // console.log(res)
          if (that.data.pass == true) {
            wx.redirectTo({
              url:'../../../../pages/school/school'
            })
          }else{
            wx.hideLoading()
            wx.navigateBack();
          }
        } else {
          // console.log(res)
          app.showLoading(res.data.msg, "none");
        }
    })
  },
  _pass:function(){
    wx.redirectTo({
      url:'../../../../pages/school/school'
    })
  }
})