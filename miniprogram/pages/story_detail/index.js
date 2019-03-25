const moment = require('../../common/moment.min.js')
const navigationBarHeight = (getApp().statusBarHeight + 44) + 'px';
const { get_userinfo } = require('../../common/common.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navigationBarTitle: '故事详情',
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
    //点赞数量
    star_count: 0,
    //当前用户是否点赞
    is_star: false,
    //用户的评论内容
    user_comment: '',
  
    //点赞
    _timeout_star: 0,
    navigationBarHeight,
    
    formId:'',
    access_token:'',
    openId:''
    
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

    this.get(id)

    wx.cloud.callFunction({
      // 需调用的云函数名
      name: 'detail',
      data: { id },
      success({ errMsg, result }) {
        console.log('detail', errMsg, result)
        that.setData({
          detail: result,
          openId: result.userInfo.openId
        })
        that.save()
      },
      fail(error) {
        console.log('error', error)
      }
    })

    //拉取第一批用户评论
    this.getComment(0),
      //第二步  获取access_token
      wx.request({
      url: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx6cce0a9f266c7329&secret=a2818494a5523557e1762affdc3e27ae',
        method: "GET",
        success: function (res) {
          console.log(res);
          that.setData({
            access_token: res.data.access_token //获取到的access_token
          })
        }
      })
  },

  form: function (e) {
   /*this.setData({
      formId: e.detail.formId
    })
    console.log('getformId', e.detail.formId);*/
    this.submit(e.detail.formId);
  },
  //获取评论
  getComment (offset, cb) {

    const that = this

    if (offset > this.data.total) return

    wx.cloud.callFunction({
      name: 'comment',
      data: { type: 'get', data: { offset, count: 10, story_id: that.data.id }},
      success ({ errMsg, result}) {
        
        console.log('get comment list', errMsg, result, that.data.openId)
        
        result = result || { total: 0, list: [], is_star: false, star_count: 0 }

        let comments = that.data.comments
        
        //通过_id进行过滤
        const to_add = result.list.filter(item => !comments.some(({ _id }) => item._id === _id))

        comments = comments.concat(to_add)
        that.setData({ total: result.count, comments, is_star: result.is_star, star_count: result.star_count })

        that.save()
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

    this.save()
  },

  /**
   * 点赞
   * @param {Object} 
   */
  star: function (e) {

    let star_count = this.data.star_count
    let is_star = this.data.is_star
    let type = ''

    //已经点赞过
    if (is_star)  { 
      star_count--
      type = 'unstar'
    } else {
      star_count ++
      type = 'star'
    } 

    is_star = !is_star

    this.setData({ star_count, is_star })


    //延时处理
    if (this.data._timeout_star) clearTimeout(this.data._timeout_star)

    const that = this

    const time_out = setTimeout(function () {

      wx.cloud.callFunction({
        name: 'comment',
        data: { type, data: { story_id: that.data.id }},
        success ({ errMsg, result}) {

          console.log('set star result errMsg', errMsg, result)

          if (result && result.ret === 0) {
            that.setData({
              star_count: result.total || 0
            })
          }
        }
      })
    }, 500)
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
  submit: function (e) {

    const content = (this.data.user_comment || '').trim()

    if (!content) return

    wx.showLoading({ title: '提交中', mask: true })

    const that = this

    wx.cloud.callFunction({
      name: 'comment',
      data: { type: 'add', data: { content, story_id: that.data.id }},
      success ({ errMsg, result}) {
        
        console.log('add comment', errMsg, result)

        if (result.ret === 0) { 

          wx.showToast({ title: '评论成功' })

          that.notify_after_submit(e);

          that.setData({
            user_comment: ''
          })
          that.update_after_submit()
        }
        else  wx.showToast({ title: '提交失败' })
      },
      fail (error) {
        console.log('error', error)
      },
      complete () {

        wx.hideLoading()
        that.save()
      }
    })
  },
  notify_after_submit: function(e) {
    var that = this; 
    console.log('user', get_userinfo().nickName);
    var l = 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=' + that.data.access_token;
    var d = {
      touser: that.data.openId, //用户的openid      
      template_id: '2WTJj7Mhvh7gzV2dQ0nMfxiEhU3fwXOBkMNYODNMPWY',
      page: '/pages/story_detail/index',
      form_id: e,
      data: {           //模板消息要对应 有几个写几个  避免为空模板
        "keyword1": {
          "value": that.data.user_comment,
          "color": "#4a4a4a"
        },
        "keyword2": {
          "value": get_userinfo().nickName,
          "color": "#9b9b9b",
        },
        "keyword3": {
          "value": that.data.detail.title,
          "color": "#9b9b9b"
        },
        "keyword4": {
          "value": that.data.date,
          "color": "#9b9b9b"
        },
      },
      color: '#ccc',
      emphasis_keyword: 'keyword1.DATA'
    }
    wx.request({
      url: l,
      data: JSON.stringify(d),
      
      method: 'POST',
      success: function (res) {
        console.log('notify', res);
      },
      fail: function (err) {
        console.log(err);
      },
      
    });
  },

  /**
   * 更新count数据
   */
  update_after_submit: function () {

    //没有加载到底，只需要更新total即可
    if (this.data.total > this.data.comments.length) this.update_count()
    else this.getComment(this.data.comments.length)
  },

  //更新count数
  update_count: function () {
    const that = this
    wx.cloud.callFunction({
      name: 'comment',
      data: { type: 'count', data: { story_id: that.data.id }},
      success ({ errMsg, result}) {
        
        console.log('update_count', errMsg, result)
        
        if (result.ret === 0) {

          that.setData({
            total: result.total
          })
        }

      },
      fail (error) {
        console.log('error', error)
      }
    })
  },

  //数据缓存
  save: function () {
    const key = this.data.id
    const data = this.data
    try {
      wx.setStorageSync(key, JSON.stringify(data))
    } catch (ex) {
      console.log('get data to cache error, key=publish, ex=', ex)
    }
  },

  //获取数据
  get: function (id) {

    if (!id) return

    try {

      const data = JSON.parse(wx.getStorageSync(id) || '{}')

      this.setData(data)

    } catch (ex) {
      console.log('get data from cache error, key=list, ex=', ex)
    }
  }
})