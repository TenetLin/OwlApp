const moment = require('../../common/moment.min.js')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    day_datas: [],
    tabbar: {},
    navigationBarTitle: '主页',
    navigationBarHeight: (app.statusBarHeight + 44) + 'px',
    titles : true,
    weathers: true,
    swiper_height: '600px',
    cur: 1,
    homes:false,
    last_index: 1                                                  //上一次滚动的位置
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {

    app.editTabbar()

    try {

      const data = JSON.parse(wx.getStorageSync('list') || '{}')
      const today = moment().format('YYYYMMDD')

      if (data.day_datas && data.day_datas.length) {
        
        data.day_datas.some((item, index) => {

          if (item.date === today) {
            data.last_index = index
            return true
          }
        })
      }

      this.setData(data)

    } catch (ex) {

      console.log('get data from cache error, key=list, ex=', ex)

    }

    const today = moment().format('YYYYMMDD')
    const tomorrow = moment().add(1, 'days').format('YYYYMMDD')
    const yesterday = moment().add(-1, 'days').format('YYYYMMDD')

    this.setData({
      day_datas: [
        {
          date: yesterday,
          showDate: moment().add(-1, 'days').format('YYYY年MM月DD日'),
          data: []
        },
        {
          date: today,
          showDate: moment().format('YYYY年MM月DD日'),
          data: []
        }
      ]
    })
    
    this.getOneDay(today)
    this.getOneDay(yesterday)
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
        
        let day_datas = that.data.day_datas

        day_datas = day_datas.map(item => {

          if (item.date === date) {
            item.data = result
          }
          return item
        })

        that.setData({ day_datas })

        that.save()
        console.log('data=', that.data)
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

  //滚动逻辑
  bindchange: function (e) {

    if (e.detail.source !== 'touch') return

    let day_datas = this.data.day_datas
    //上次滚动的位置
    let last_index = this.data.last_index
    //当前的位置
    let new_date

    let cur = e.detail.current

    console.log(`start|${last_index}|${cur}`)

    //向左, 并且向左的数据日期不足2天，需要补充一天的记录
    if (cur - last_index < 0 && cur <= 1) {

      new_date = moment(day_datas[cur].date, 'YYYYMMDD').add(-1, 'days')

      day_datas.unshift({
        date: new_date.format('YYYYMMDD'),
        showDate: new_date.add(-1, 'days').format('YYYY年MM月DD日'),
        data: []
      })

      last_index = cur + 1

    } else {

      //向右滑动。默认有今天的数据
      //或者向左，数据日期不止两天
      last_index = cur

      new_date = moment(day_datas[cur].date, 'YYYYMMDD')
    }

    console.log(`end|${last_index}|${cur}`)

    this.setData({ last_index, day_datas, cur })

    this.getOneDay(new_date.format('YYYYMMDD'))

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