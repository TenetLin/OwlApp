'use strict'
const { goToLogin } = require('./common/common.js')

App({

  /**
   * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
   */
  onLaunch: function () {
    this.Login()
  },

  /**
   * 登录
   */
  Login: function () {
    //检查登录态是否过期
    wx.checkSession({
      success() {
        wx.cloud.callFunction({
          // 需调用的云函数名
          name: 'user_info',
          success({ errMsg, result }) {
            console.log('user_info', errMsg, result)
            if (result.ret !== 1) {
              goToLogin()
            } else {
              try {
                wx.setStorageSync('myself', JSON.stringify(result.data))
              } catch (ex) {
                console.log('get data to cache error, key=myself, ex=', ex)
              }
            }
          },
          fail(error) {
            console.log('user_info call error', error)
            goToLogin()
          } 
        })
      },
      fail() {
        //尝试去登录
        wx.login({
          success(res) {
            if (res.code) {
              console.log(res.code)
              wx.cloud.callFunction({
                // 需调用的云函数名
                name: 'code',
                data: { code: res.code },
                // 成功回调
                success({ errMsg, result }) {
                  console.log('code success', errMsg, result)
                  //用户尚未激活
                  if (result.ret === 0) {
                    goToLogin()
                  }
                },
                fail() {
                  console.log('code error', arguments)
                }
              })
            } else {
              console.log('登录失败！' + res.errMsg)
            }
          }
        })
      }
    })
  },

  /**
   * 当小程序启动，或从后台进入前台显示，会触发 onShow
   */
  onShow: function (options) {
  },

  /**
   * 当小程序从前台进入后台，会触发 onHide
   */
  onHide: function () {
    
  },

  /**
   * 当小程序发生脚本错误，或者 api 调用失败时，会触发 onError 并带上错误信息
   */
  onError: function (msg) {
    
  }
})