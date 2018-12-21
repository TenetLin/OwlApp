const moment = require('../../common/moment.min.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    //日期
    date: moment().format('YYYY年MM月DD日'),
    //当前页面的故事内容
    detail: {},
    //评论列表
    comments: [],
    //当前翻到了第几页
    current_index: 0,
    //总数
    total: 0,
    //用户的评论内容
    user_comment: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function ({ id }) {

    const that = this

    if (!id) {
      wx.showToast({
        title: '参数错误',
        image: '/images/warning.png'
      })
      return
    }
    
    this.setData({ id })
    wx.cloud.callFunction({
      // 需调用的云函数名
      name: 'detail',
      data: { id },
      success({ errMsg, result }) {
        console.log('detail', errMsg, result)
        that.setData({
          detail: result
        })
      },
      fail(error) {
        console.log('error', error)
      }
    })

    //拉取第一批用户评论
    this.getComment(0)
  },

  //获取评论
  getComment (offset, cb) {

    const that = this

    if (offset > this.data.total) return

    wx.cloud.callFunction({
      name: 'comment',
      data: { type: 'get', data: { offset: 0, count: 10 }},
      success ({ errMsg, result}) {
        
        console.log('', errMsg, result)
        
        result = result || { total: 0, data: [] }

        let comments = that.data.comments
        comments = comments.concat(result.data)
        that.setData({ total: result.total, comments })
      },
      fail (error) {
        console.log('error', error)
        wx.showToast({
          title: '查询失败',
          image: '/images/warning.png'
        })
      },
      complete () {
        cb && cb()
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

  /**
   * 文本框输入
   */
  input: function (e) {
    this.setData({
      user_comment: e.detail.value
    })
  },

  /**
   * 查看更多
   */
  more: function () {

    wx.showLoading({ title: '请求中', mask: true })

    const offset = this.data.comments.length    
    this.getComment(offset, function () { wx.hideLoading() })
  },

  /**
   * 用户点击发布按钮
   */
  submit: function () {

    const content = (this.data.user_comment || '').trim()

    if (!content) return

    wx.showLoading({ title: '提交中', mask: true })

    const that = this

    wx.cloud.callFunction({
      name: 'comment',
      data: { type: 'add', data: { content }},
      success ({ errMsg, result}) {
        
        console.log('', errMsg, result)
        
        result = result || []

        let comments = that.data.comments
        comments = comments.concat(result)
        that.setData({ comments })
      },
      fail (error) {
        console.log('error', error)
      },
      complete () {

        wx.hideLoading()
      }
    })
  }
})