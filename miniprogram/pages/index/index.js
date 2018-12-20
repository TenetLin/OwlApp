const moment = require('../../common/moment.min.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    date: moment().format('YYYY年MM月DD日'),
    list: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    try {
      const data = JSON.parse(wx.getStorageSync('list') || '{}')
      this.setData(data)
    } catch (ex) {
      console.log('get data from cache error, key=list, ex=', ex)
    }

    const that = this
    const date = moment().format('YYYYMMDD')
    
    wx.cloud.callFunction({
      // 需调用的云函数名
      name: 'getlist',
      data: { date },
      success({ errMsg, result }) {
        
        console.log('get list suc', errMsg, result)

        that.setData({
          list: result
        })
        that.save()
      },
      fail(error) {
        console.log('get list error', error)
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  
  save: function () {
    try {
      wx.setStorageSync('list', JSON.stringify(this.data))
    } catch (ex) {
      console.log('get data to cache error, key=list, ex=', ex)
    }
  }
})