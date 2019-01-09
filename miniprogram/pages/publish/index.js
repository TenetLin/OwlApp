const { save_files, upload_files, get_userinfo, remove_files } = require('../../common/common.js')
const navigationBarHeight = (getApp().statusBarHeight + 44) + 'px';
wx.cloud.init()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    checked: false,
    //文章标题
    title: '',
    start_text: '',
    start_images: [],
    end_text: '',
    end_images: [],
    index: 0,
    navigationBarTitle: '发布',
    navigationBarHeight
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    try {
      const data = JSON.parse(wx.getStorageSync('publish') || '{}')
      this.setData(data)
    } catch (ex) {
      console.log('get data from cache error, key=list, ex=', ex)
    }
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

  //页面元素的输入
  input: function (e) {
    // console.log(e)
    
    //标题输入
    if (e.target.id === 'title') {
      this.setData({
        title: e.detail.value
      })
    }

    //文本框输入
    if (e.target.id === 'start_text') {
      this.setData({
        start_text: e.detail.value
      })
    }

    if (e.target.id === 'end_text') {
      this.setData({
        end_text: e.detail.value
      })
    }
    this.save()
  },

  /**
   * 删除当前的图片
   */
  delImage: function (e) {
    const { index, type } = e.currentTarget.dataset
    let del_file
    if (type === 'start') {

      const files = this.data.start_images

      del_file = files.splice(index, 1)

      this.setData({
        start_images: files
      })
      this.save()
    }
    if (type === 'end') {

      const files = this.data.end_images

      del_file = files.splice(index, 1)

      this.setData({
        end_images: files
      })
      this.save()
    }
  },

  /**
   * 选择图片进行上传
   */
  chooseImage: function (e) {

    console.log('1', e)
    
    let count
    //故事开头
    if (e.target.id === 'add_start') {
      count = 5 - this.data.start_images.length
    } else {
      count = 2 - this.data.end_images.length
    }

    if (count <= 0 ) return

    var that = this
    wx.chooseImage({
      count,                                          //最多可以选择的图片张数，默认9
      sizeType: ['compressed'],           // 可以指定是原图还是压缩图，默认二者都有
      // sourceType: ['album', 'camera'],  // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {

        console.log(res)
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        let files = res.tempFilePaths.map(src => {   return  { temp_src: src } })

        console.log('2', e)

        if (e.target.id === 'add_start') {

          files = that.data.start_images.concat(files)

          save_files(files, function (result) {
            that.setData({
              start_images: result
            })
            that.save()
            console.log('3', that.data)
          })
          
        } 
        if (e.target.id === 'add_end') {
          files = that.data.end_images.concat(files)

          save_files(files, function (result) {
            that.setData({
              end_images: result
            })
            that.save()
            console.log('3', that.data)
          })
        }
      }
    })
  },
  /**
   * 原创按钮点击
   */
  tapRadio: function (e) {

    this.setData({
      checked: !this.data.checked
    })

    console.log('tap', this.data)

    this.save()
  },

  /**
   * 提交表单
   */
  submit: function () {
    const that = this
    if (that.data.start_text.trim() === '') {
      wx.showToast({
        title: '开头不可为空',
        image: '/images/warning.png'
      })
      return
    }
    if (that.data.end_text.trim() === '') {
      wx.showToast({
        title: '结尾不可为空',
        image: '/images/warning.png'
      })
      return
    }

    wx.showLoading({ title: '故事提交中', mask: true })
    //上传开头的文件
    upload_files(that.data.start_images, 'start', function(start_result) {

      that.setData({
        start_images: start_result
      })

      //上传结尾的文件
      upload_files(that.data.end_images, 'end', function (end_result) {

        that.setData({
          end_images: end_result
        })

        const user_info = get_userinfo()

        const data = {
          uid: user_info.uid,
          checked: that.data.checked,
          //文章标题
          title: that.data.title,
          start_text: (that.data.start_text || '').trim(),
          start_images: (that.data.start_images || []),
          end_text: (that.data.end_text || '').trim(),
          end_images: (that.data.end_images || []),
        }
        
        wx.cloud.callFunction({
          name: 'publish',
          data,
          success({ errMsg, result }) {

            console.log(arguments)
            if (result.ret === 0) {
              remove_files(that.data.start_images, function () {
                remove_files(that.data.end_images, function () {
                 
                  wx.hideLoading()
                  wx.showToast({ title: '成功' })
                  that.del()
                  that.setData({
                    checked: false,
                    //文章标题
                    title: '',
                    start_text: '',
                    start_images: [],
                    end_text: '',
                    end_images: [],
                    index: 0,
                  })
                  setTimeout(function () {
                    wx.reLaunch({
                      url: '/pages/index/index',
                    })
                  }, 1000)
                })
              })
            } else {
              wx.hideLoading()
              wx.showToast({ title: '失败', image: '/images/warning.png' })
              setTimeout(function () {
                wx.reLaunch({
                  url: '/pages/index/index',
                })
              }, 1000)
            }
          },
          fail (error) {
            console.log('submit error', error)
            wx.hideLoading()
            wx.showToast({ title: '失败', image: '/images/warning.png' })
            setTimeout(function () {
              wx.reLaunch({
                url: '/pages/index/index',
              })
            }, 100)
          }
      })
    })
    })
  },
  
  /**
   * 将数据缓存到缓存中
   */
  save: function () {
    try {
      wx.setStorageSync('publish', JSON.stringify(this.data))
    } catch (ex) {
      console.log('get data to cache error, key=publish, ex=', ex)
    }
  },
  
  /**
   * 将用户缓存的数据清除
   */
  del: function () {
    try {
      wx.removeStorageSync('publish')
    } catch (e) {
      console.log('remove data from cache error, key=publish, ex=', e)
    }
  }
})