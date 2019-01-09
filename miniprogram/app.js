'use strict'
const { goToLogin } = require('./common/common.js')

App({

  /**
   * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
   */
  onLaunch: function () {
    wx.hideTabBar();
    this.getSystemInfo();
    this.Login();
    statusBarHeight: 0
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
    
  },
  getSystemInfo: function () {
    let t = this;
    wx.getSystemInfo({
      success: function (res) {
        t.statusBarHeight = res.statusBarHeight
        t.globalData.systemInfo = res;
      }
    });
  },
  editTabbar: function () {
    let tabbar = this.globalData.tabBar;
    let currentPages = getCurrentPages();
    let _this = currentPages[currentPages.length - 1];
    let pagePath = _this.route;

    (pagePath.indexOf('/') != 0) && (pagePath = '/' + pagePath);


    // if(pagePath.indexOf('/') != 0){
    //   pagePath = '/' + pagePath;
    // } 

    for (let i in tabbar.list) {
      tabbar.list[i].selected = false;
      (tabbar.list[i].pagePath == pagePath) && (tabbar.list[i].selected = true);
    }
    _this.setData({
      tabbar: tabbar
    });
  },
  editNavBar:function()
  {
   // let navbar = this.globalData.navbar;
  },
  globalData: {
    systemInfo: null,//客户端设备信息
    userInfo: null,
    tabBar: {
      "backgroundColor": "#ffffff",
      "color": "#979795",
      "selectedColor": "#1c1c1b",
      "list": [
        {
          "pagePath": "/pages/index/index",
          "iconPath": "icon/icon_home.png",
          "selectedIconPath": "icon/icon_home_HL.png",
          "text": "首页"
        },
        {
          "pagePath": "/pages/publish/index",
          "iconPath": "icon/icon_release.png",
          "isSpecial": true,
          "text": "发布"
        },
        {
          "pagePath": "/pages/myself/index",
          "iconPath": "icon/icon_mine.png",
          "selectedIconPath": "icon/icon_mine_HL.png",
          "text": "我的"
        }
      ]
    }
  }
})