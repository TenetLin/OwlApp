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
    swiper_height: '600px',
    homes:false,
    select_date: '',
    calendar_select: '',
    hide_calendar: true,
    nowweather: 'null',
    data: []
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    wx.hideTabBar()
    app.editTabbar()
    console.log('tabbar=', this.data.tabbar)
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
 getLocation: function () {
    var that = this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        that.getWeatherInfo(latitude, longitude);
      }
    })
  },
  getWeatherInfo: function (latitude, longitude) {
    var _this = this;
    var key = 'edf8201a10b04b25a51eb33682cb8204';//你自己的key
    //需要在微信公众号的设置-开发设置中配置服务器域名
    var url = 'https://free-api.heweather.com/s6/weather?key=' + key + '&location=' + longitude + ',' + latitude;
    wx.request({
      url: url,
      data: {},
      method: 'GET',
      success: function (res) {
        var now = res.data.HeWeather6[0].now;//当前天气
        var basic = res.data.HeWeather6[0].basic;
        //var update = res.data.HeWeather6[0].update.loc;//更新时间
        _this.setData({
          /* todyIcon: '../../images/weather/' + daily_forecast_today.cond_code_d + '.png', //在和风天气中下载天气的icon图标，根据cond_code_d显示相应的图标 */
          nowweather: basic.parent_city + '  ' + now.cond_txt + '  ' + now.tmp + '℃'
        });
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.getLocation();
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