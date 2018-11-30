'use strict'

exports.wx_login = function (cb) {
  wx.login({
    success(res) {
      if (res.code) {
        //TODO::
        console.log(res);
      } else {
        //获取code失败
        console.log('get code error', res);
      }
    }
  })
};