const moment = require('../../common/moment.min.js');
const app = getApp();
const navigationBarHeight = (app.statusBarHeight + 44) + 'px';
const swiper_height = 600 + 'px';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    background: [1000, 21000],
    tabbar: {},
    date: moment().format('YYYY年MM月DD日'),
    list: [],
    navigationBarTitle: '主页',
    navigationBarHeight,
    titles:true,
    weathers:true,
    swiper_height
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.editTabbar();
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
  swiperChange:function(e){
    let s = e.detail.source
    if(s == "touch")
    {
        /**
   * 飞哥在这里处理用户滑动逻辑
   */
    var a = new Array(11111);
    this.setData({
      background: a,
    })
    }
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
  }
})