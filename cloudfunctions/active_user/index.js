// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const collection = cloud.database().collection('owl_user')

// 云函数入口函数
exports.main = async (event, context) => {

  return new Promise(resovle => {
    try {
      const data = JSON.parse(event.rawData)
      const openid = event.userInfo.openId
      data.active = 1
      data.ut = new Date()
      return collection.where({ _id: openid }).update({ data })
      .then(res => {
        console.log(res)
        return resovle({ ret: 0, msg: 'OK' })
      }).catch(ex => {
        console.log('error', ex)
        return resovle({ ret: -100, msg: 'server busy' })
      })
      
    } catch (ex) {
      return resovle({ ret: -100, msg: 'server busy' })
    }
  })

  
}