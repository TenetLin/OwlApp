const navigationBarHeight = (getApp().statusBarHeight + 44) + 'px';
const swiper_height = 600 + 'px';
const moment = require('../../common/moment.min.js');
Page({
  data: {
    background: ['demo-text-1', 'demo-text-2', 'demo-text-3'],
    vertical: false,
    autoplay: false,
    circular: false,
    interval: 2000,
    duration: 500,
    previousMargin: 0,
    nextMargin: 0,
    tabbar: {},
    date: moment().format('YYYY年MM月DD日'),
    list: [],
    navigationBarTitle: '主页',
    navigationBarHeight,
    swiper_height
  },
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
  },

  //跳转到用户页面
  goUser: function (e) {

    console.log('start go user', e)

    const { uid } = e.currentTarget.dataset

    wx.navigateTo({
      url: `../user_detail/index?uid=${uid}`
    })
  },

  //跳转到详情页面
  goDetail: function (e) {
    console.log('start go detail', e)

    const { id } = e.currentTarget.dataset

    wx.navigateTo({
      url: `../story_detail/index?id=${id}`
    })
  },
  changeProperty: function (e) {
    var propertyName = e.currentTarget.dataset.propertyName
    var newData = {}
    newData[propertyName] = e.detail.value
    this.setData(newData)
  },
  changeIndicatorDots: function (e) {
    this.setData({
      indicatorDots: !this.data.indicatorDots
    })
  },
  changeAutoplay: function (e) {
    this.setData({
      autoplay: !this.data.autoplay
    })
  },
  intervalChange: function (e) {
    this.setData({
      interval: e.detail.value
    })
  },
  durationChange: function (e) {
    this.setData({
      duration: e.detail.value
    })
  },
  scroll()
  {

  },
  reactBottom() {
    console.log('触底-加载更多')
  },
})
