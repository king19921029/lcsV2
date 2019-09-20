const app = getApp();
Component({
  properties: {
    name: {
      type: String,
      value: '金融'
    } 
  },
  data: {
   
  },
  methods: {
    _goDetails:function(){
      this.triggerEvent('micGoDetails')
    }
  }
})