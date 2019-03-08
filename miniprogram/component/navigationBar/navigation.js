const app = getApp()

Component({

  properties: {
    text: {
      type: String,
      value: null
    },
    back: {
      type: Boolean,
      value: false
    },
    home: {
      type: Boolean,
      value: false
    },
    title: {
      type: Boolean,
      value: false
    },
    weather: {
      type: String,
      value: null
    },
    date:{
      type:String,
      value: null
    }
  },

  data: {
    statusBarHeight: app.statusBarHeight + 'px',
    navigationBarHeight: (app.statusBarHeight + 44) + 'px',
  },

  methods: {
    backHome: function () {
      /*回到当前日期*/
    },
    back: function () {
      wx.navigateBack({
        delta: -1
      })
    }   
  }
})