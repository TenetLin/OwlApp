const app = getApp()

Component({

  properties: {
    text: {
      type: String,
      value: 'Wechat'
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
      type: Boolean,
      value: false
    },
    date:{
      type:String,
      value:null
    }
  },

  data: {
    statusBarHeight: app.statusBarHeight + 'px',
    navigationBarHeight: (app.statusBarHeight + 44) + 'px',
  },

  methods: {
    backHome: function () {
      wx.reLaunch({
        url: '../index/index',
      })
    },
    back: function () {
      wx.navigateBack({
        delta: -1
      })
    }
  }
})