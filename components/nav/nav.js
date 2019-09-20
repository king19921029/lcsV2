
Component({
  // options: {
  //   multipleSlots: true // 在组件定义时的选项中启用多slot支持
  // },
  /**
   * 组件的属性列表
   * 用于组件自定义设置
   */
  properties: {
    // 当前显示的小项
    stateNow: {
      type: String,  
      value: 0 // 学院为0理财  1银行  2保险 3财富  学习为0视野  1课桌  2笔记  圈子为0咖选  1人脉
    },
    // 当前显示的分类
    typeNow :{
      type : String ,
      value : 0
    },
    // 区分显示分类列表  0学院   1学习   2圈子
    state :{
      type : String ,
      value : 0
    },
    // 选项分类  学院  学习  圈子
    type :{
      type : String ,
      value : '学院'
    },
    //
    isIpx :{
      type : Boolean,
      value : false
    },
    navStatusFirst:{
      type : Boolean,
      value : false
    }
  },

  /**
   * 私有数据,组件的初始数据
   * 可用于模版渲染
   */
  data: {
    openstate: false, //按钮是否点击展开
    schoolType:[
      {
        "name":"理财",
        "status":0
      },
      {
        "name": "银行",
        "status": 1
      },

      {
        "name": "保险",
        "status": 2
      },

      {
        "name": "财富",
        "status": 3
      },


    ],
  },

  /**
   * 组件的方法列表
   * 更新属性和数据的方法与更新页面数据的方法类似
   */
  methods: {
    open:function(){
      let that = this;
      that.setData({
        openstate: !that.data.openstate
      })
    },
    // 主tab
    goSchool:function(){
      wx.redirectTo({
        url: '/pages/school/school',
      })
    },
    goStudy: function () {
      wx.redirectTo({
        url: '/pages/study/study',
      })
    },
    goSociety: function () {
      wx.redirectTo({
        url: '/pages/society/society',
      })
    },
    goConnection:function(){
      wx.redirectTo({
        url: '/subPages/societyPackage/pages/connection/connection',
      })
    },
    goMy:function(){
      wx.navigateTo({
        url:'/subPages/personalPackage/pages/my/my'
      })
    },
    schoolMoney: function () {
      wx.redirectTo({
        url: '/pages/society/society',
      })
    },
    // 学习类型切换
    studyCourseTab:function(){
      wx.redirectTo({
        url: '/pages/studyPackage/courseTab/courseTab',
      })
    },
    studyNotes: function () {
      wx.redirectTo({
        url: '/pages/studyPackage/notesTab/notesTab',
      })
    },
    // 学院tab切换
    schoolClass:function(e){
      this.triggerEvent('schools', e.currentTarget.dataset.status)
      this.setData({
        stateNow: e.currentTarget.dataset.status
      })
    }
  }
})