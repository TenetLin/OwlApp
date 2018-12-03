'use strict'
wx.cloud.init()

exports.login = function (cb) {
  wx.cloud.callFunction({
    // 需调用的云函数名
    name: 'login',
    // 成功回调
    complete({ errMsg, result }) {
      console.log(errMsg);
      cb && cb(result);
    }
  })
};