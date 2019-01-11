// pages/myself/index.js
const app = getApp();
const navigationBarHeight = (app.statusBarHeight + 44) + 'px';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    starNum: 0,
    attentionNum: 0,
    fansNum: 0,
    navigationBarTitle: '我的',
    navigationBarHeight,
    titles:true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.editTabbar();
    try {
      const data = JSON.parse(wx.getStorageSync('myself') || '{}')
      this.setData({
        starNum     : data.starNum || 0,
        attentionNum: data.attentionNum || 0,
        fansNum     : data.fansNum || 0
      })
    } catch (ex) {
      console.log('get data from cache error, key=myself, ex=', ex)
    }
    const that = this
    wx.cloud.callFunction({
      // 需调用的云函数名
      name: 'user_info',
      success({ errMsg, result }) {
        console.log(result)
        if (result.ret === 1) {
          that.setData(result.data)
          try {
            wx.setStorageSync('myself', JSON.stringify(result.data))
          } catch (ex) {
            console.log('get data to cache error, key=myself, ex=', ex)
          }
        }
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
  //跳转到用户页面
  goUser: function (e) {

    console.log('start go user', e)

    const { uid } = e.currentTarget.dataset
    var {title} = e.currentTarget.dataset.title

    wx.navigateTo({
      url: `../user_list/user_list?uid=${uid}&title=${title}`
    })
  },

  //跳转到我的故事界面
  goMyStorys: function (e) {

    console.log('start go mystory', e)

    const { uid } = e.currentTarget.dataset

    wx.navigateTo({
      url: `../story_list/story_list?uid=${uid}`
    })

  },
  goAbout: function (e) {

    console.log('start go mystory', e)
    wx.navigateTo({
      url: '../about/index'
    })
  },
})