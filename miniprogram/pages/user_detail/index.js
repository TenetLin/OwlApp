// miniprogram/pages/publish_ender/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    myself    : '',     //我的用户名
    uid       : '',     //用户名
    user_info : {},     //用户信息
    list      : [],     //信息列表,
    followed  : false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function ({ uid }) {
    
    this.setData({ uid })
    this.getMyself()
    this.getUsrInfo(uid)
    this.getUserList(uid)
    this.follow(uid, 'query')

  },

  follow: function (uid, type) {

    const that = this
    wx.cloud.callFunction({
      // 需调用的云函数名
      name: 'attation',
      data: { uid, type },
      success({ errMsg, result }) {

        console.log('attation succ', errMsg, result)

        if (result.ret === 0 && result.followed !== undefined) {
          that.setData({
            followed: !!result.followed
          })
        }
      },
      fail () {
        console.log('attation fail', arguments)
      }
    })

  },

  getMyself: function () {
    try {
      const data = JSON.parse(wx.getStorageSync('myself') || '{}')
      this.setData({
        myself :  data.uid || ''
      })
    } catch (ex) {
      console.log('get data from cache error, key=myself, ex=', ex)
    }
  },

  /**
   * 
   * @param {String} uid 用户名
   */
  getUsrInfo: function (uid) {

    const that = this
    wx.cloud.callFunction({
      // 需调用的云函数名
      name: 'user_info',
      data: { uid },
      success({ errMsg, result }) {

        console.log('get_user_info', errMsg, result)

        if (result.ret === 1) {
          that.setData({
            user_info: result.data
          })
        }
      }
    })
  },

  getUserList: function (uid) {
    const that = this
    wx.cloud.callFunction({
      // 需调用的云函数名
      name: 'getlist',
      data: { uid },
      success({ errMsg, result }) {
        
        console.log('get list suc', errMsg, result)

        that.setData({
          list: result
        })
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
    wx.navigateBack({
      delta: 1,
      success: function (e) {
        console.log('back suc', e)
      },
      fail: function (e) {
        console.log('back err', e)
      }
    })
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

  attation: function () {

    let type = 'atttation'
    const user_info = this.data.user_info
    if (this.data.followed) { 
      type = 'dis_attation'

      user_info.fansNum --

      if (user_info.fansNum < 0) user_info.fansNum = 0

      wx.showToast({ title: '已取消' })

    } else {

      user_info.fansNum ++

      wx.showToast({ title: '已关注' })
    }

    this.follow(this.data.uid, type)

    this.setData({
      followed: !this.data.followed,
      user_info
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