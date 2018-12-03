// 云函数模板
// 部署：在 cloud-functions/login 文件夹右击选择 “上传并部署”

const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init()

const db = cloud.database()

/**
 * 这个示例将经自动鉴权过的小程序用户 openid 返回给小程序端
 * 
 * event 参数包含小程序端调用传入的 data
 * 
 */
exports.main = (event, context) => {
  // 获取 WX Context (微信调用上下文)，包括 OPENID、APPID、及 UNIONID（需满足 UNIONID 获取条件）
  const { APPID, OPENID } = cloud.getWXContext()
  return new Promise(resovle => {
    //查询用户的注册信息
    return db.collection('owl_user').where({ _id: OPENID }).get().then(res => {
      
      return resovle({ ret: res.data && res.data[0] && res.data[0].active || 0, msg: 'OK' })
      
    }).catch(ex => {
      resovle({ ret: -100, msg: 'error' })
    })
  })
}