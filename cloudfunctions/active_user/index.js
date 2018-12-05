// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const user_collection = db.collection('owl_user')
const utils_collection  = db.collection('owl_utils')

// 云函数入口函数
exports.main = async (event, context) => {

  return new Promise(resovle => {
    try {
      const data = JSON.parse(event.rawData)
      const openid = event.userInfo.openId
      data.active = 1
      data.ut = new Date()

      const uid_doc = utils_collection.doc('uid')
      return Promise.all([
        //查询用户的登录信息
        user_collection.where({ _id: openid }),
        //查询最大的uid
        uid_doc.get()
      ]).then(([user_doc,  utils_res ]) =>{

        console.log('utils_res=', utils_res)
        const { index } = utils_res.data
        data.uid = getUid(index)

        console.log(data)
        return Promise.all([
          user_doc.update({ data: data }),
          uid_doc.update({ data: {index: index + 1 }})
        ]).then(([user_res, uid_res ]) => {
          console.log(user_res, uid_res)
          return resovle({
            ret: 0,
            msg: 'OK',
            data: { uid: data.uid }
          })
        })
      }).catch(ex => {
        console.log('error', ex)
        return resovle({ ret: -100, msg: 'server busy' })
      })
    } catch (ex) {
      console.log('parse error', ex)
      return resovle({ ret: -100, msg: 'server busy' })
    }
  })
}

/**
 * 计算uid
 */
function getUid (index) {
  index = '' + (index || '1')
  return 'owl_' + (index > 1e6 ? index : new Array(6 - index.length + 1).join('0') + index)
}