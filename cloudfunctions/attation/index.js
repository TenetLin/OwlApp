// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const attation_collection = db.collection('owl_attation')
const user_collection = db.collection('owl_user')

// 云函数入口函数
exports.main = async (event, context) => {

  const { uid, type } = event
  const { OPENID } = cloud.getWXContext()

  console.log('req', uid, type)

  if (!uid) return { ret: -1, msg: 'uid cannot be empty' }

  if (type === 'atttation')     return await attation(uid, OPENID)
  if (type === 'dis_attation')  return await dis_attation(uid, OPENID)
  if (type === 'query')         return await query(uid, OPENID)
  if (type === 'query_list')    return await query_list()
}

/**
 * 关注
 * @param {String} uid 
 * @param {String} openid 
 */
async function attation (uid, openid) {

  const user_res = await user_collection.doc(openid).get()

  console.log('get user ret', JSON.stringify(user_res))

  //查询失败
  if (user_res.errMsg !== 'document.get:ok') return { ret: -100, msg: 'db query error'}

  const store_user = user_res.data || {}

  if (store_user.uid === uid) return { ret: -1, msg: 'cannot follow yourself' }

  const a_res = await attation_collection.where({ follower: store_user.uid, followed: uid }).count()

  console.log('a_res', store_user.uid, uid, JSON.stringify(a_res))

  if (a_res.total >= 1) return { ret: 0, msg: 'OK' }

  const add_res = await attation_collection.add({
      data: {
          follower: store_user.uid, 
          followed: uid,
          ct: Date.now()
      }
  })

  console.log('add_res', JSON.stringify(add_res))

  return { ret: 0, msg: 'OK'}
}

/**
 * 取消关注
 * @param {String} uid 
 * @param {String} openid 
 */
async function dis_attation (uid, openid) {
  const user_res = await user_collection.doc(openid).get()

  console.log('get user ret', JSON.stringify(user_res))

  //查询失败
  if (user_res.errMsg !== 'document.get:ok') return { ret: -100, msg: 'db query error'}

  const store_user = user_res.data || {}

  if (store_user.uid === uid) return { ret: -1, msg: 'cannot unfollow yourself' }

  const a_res = await attation_collection.where({ follower: store_user.uid, followed: uid }).get()

  console.log('a_res', store_user.uid, uid, JSON.stringify(a_res))

  if (a_res.data.length === 0) return { ret: 0, msg: 'OK' }

  const add_res = await attation_collection.doc(a_res.data[0]._id).remove()

  console.log('add_res', JSON.stringify(add_res))

  return { ret: 0, msg: 'OK'}
}

/**
 * 查询当前用户是否关注了某个用户
 * @param {String} uid 
 * @param {String} openid 
 */
async function query(uid, openid) {
    
  const user_res = await user_collection.doc(openid).get()

  console.log('get user ret', JSON.stringify(user_res))

    //查询失败
  if (user_res.errMsg !== 'document.get:ok') return { ret: -100, msg: 'db query error'}
  
  const store_user = user_res.data || {}

  if (store_user.uid === uid) return { ret: -1, msg: 'illeage' }

  const a_res = await attation_collection.where({ follower: store_user.uid, followed: uid }).count()

  console.log('a_res', store_user.uid, uid, JSON.stringify(a_res))

  return { ret: 0, msg: 'OK', followed: a_res.total >= 1 }
}

/**
 * 
 */
async function query_list() {

}