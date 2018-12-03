/**
 * 跳转到登录界面
 */
exports.goToLogin = function () {
  wx.reLaunch({
    url: '/pages/login/index',
  })
}