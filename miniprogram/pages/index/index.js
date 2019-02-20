const moment = require('../../common/moment.min.js')
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    tabbar: {},
    navigationBarTitle: '主页',
    navigationBarHeight: (app.statusBarHeight + 44) + 'px',
    weathers: true,
    swiper_height: '600px',
    homes:false,
    select_date: '',
    calendar_select: '',
    hide_calendar: true,
    data: []
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    app.editTabbar()
    let select_date, data
    try {
      const all_data = JSON.parse(wx.getStorageSync('list') || '{}')
      if (all_data['default_date']) {
        select_date = moment(all_data['default_date'], 'YYYYMMDD')
        data = all_data[select_date] || []
      }
    } catch (ex) { console.log('get data from cache error, key=list, ex=', ex) }

    if (!select_date || !select_date.isValid()) {
      select_date = moment()
    }
    data = data || []
    this.setData({ select_date: select_date.format('YYYY年MM月DD日'), calendar_select: select_date.format('YYYY-MM-DD'), data })
    this.getOneDay(select_date.format('YYYYMMDD'))
  },

  /**
   * 获取一天的数据
   */
  getOneDay: function (date) {

    const that = this

    wx.cloud.callFunction({
      // 需调用的云函数名
      name: 'getlist',
      data: { date },
      success({ errMsg, result }) {
        console.log('get list suc', errMsg, result)
        that.setData({ data: result })
        that.save(date, result, true)
        console.log('data=', date, result)
      },
      fail(error) { console.log('get list error', error)}
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
  onPullDownRefresh: function ()  {

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

  /**
   * 展示日历菜单
   */
  show_calendar: function (e) {
    const hide_calendar = this.data.hide_calendar
    this.setData({ hide_calendar: !hide_calendar })
  },

  /**
   * 选择日期
   */
  select_date: function (e) {
    const { date } = e.detail
    const _date = moment(date, 'YYYY-MM-DD').format('YYYYMMDD')
    this.setData({ hide_calendar: true, select_date: moment(date, 'YYYY-MM-DD').format('YYYY年MM月DD日')})
    this.getOneDay(_date)
  },
  
  /**
   * 存储数据
   * date: 日期
   * data: 数据内容
   * isDefault: 是否是默认日期
   */
  save: function (date, data, isDefault) {
    try {
      const all_data = JSON.parse(wx.getStorageSync('list') || '{}')
      all_data[date] = data
      if (isDefault) all_data['default_date'] = date
      wx.setStorageSync('list', JSON.stringify(all_data))
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