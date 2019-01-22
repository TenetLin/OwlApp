const moment = require('../../common/moment.min.js');
const app = getApp();
const navigationBarHeight = (app.statusBarHeight + 44) + 'px';
const swiper_height = 600 + 'px';
var lastindex =2;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    day_datas: [],
    tabbar: {},
    navigationBarTitle: '主页',
    navigationBarHeight,
    titles:true,
    weathers:true,
    swiper_height,
    homes:false,
    type: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {

    app.editTabbar();

    try {

      const data = JSON.parse(wx.getStorageSync('list') || '{}')

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
        },
        {
          date: tomorrow,
          showDate: moment().add(1, 'days').format('YYYY年MM月DD日'),
          data: []
        }
      ]
    })
    
    this.getOneDay(today)
    this.getOneDay(yesterday)
  },

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
        console.log('data=', that.data);
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

  //通过滑动动画，判断是左滑动还是右滑动
  bindanimationfinish: function(e) {

    if (e.detail.source === 'touch') {

      let type = e.detail.dx > 0 ? 'left': 'right'

      this.setData({ type })
    }
  },

  bindchange: function (e) {

    if (e.detail.source !== 'touch') return
    let type = this.data.type
    let day_datas = this.data.day_datas

    let new_date
    let cur_index = e.detail.current

    /* 这样判断左右，测试是准的*/
    var cur = e.detail.current
    
    if ((cur - lastindex<0) || cur-lastindex == 2)
    {
      console.log(cur , lastindex,"左")
      new_date = moment(day_datas[0].date, 'YYYYMMDD').add(-1, 'days')
      day_datas.splice(2, 1)


      day_datas.unshift({
        date: new_date.format('YYYYMMDD'),
        showDate: new_date.add(-1, 'days').format('YYYY年MM月DD日'),
        data: []
      })
    }
    else
    {
      console.log(cur , lastindex,"右")
      new_date = moment(day_datas[2].date, 'YYYYMMDD').add(1, 'days')
      day_datas.splice(0, 1)


      day_datas.push({
        date: new_date.format('YYYYMMDD'),
        showDate: new_date.format('YYYY年MM月DD日'),
        data: []
      })
    }
    lastindex = cur





    // if (cur_index < 2) {

    //   new_date = moment(day_datas[0].date, 'YYYYMMDD').add(-1, 'days')
    //   day_datas.splice(2, 1)


    //   day_datas.unshift({
    //     date: new_date.format('YYYYMMDD'),
    //     showDate: new_date.add(-1, 'days').format('YYYY年MM月DD日'),
    //     data: []
    //   })

    // } else {

    //   new_date = moment(day_datas[2].date, 'YYYYMMDD').add(1, 'days')
    //   day_datas.splice(0, 1)


    //   day_datas.push({
    //     date: new_date.format('YYYYMMDD'),
    //     showDate: new_date.format('YYYY年MM月DD日'),
    //     data: []
    //   })
    // }
/* 设置 weathers 的真值确定是否显示天气，设置 homes 的真值确定是否显示回到今天*/
    this.setData({ day_datas })
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