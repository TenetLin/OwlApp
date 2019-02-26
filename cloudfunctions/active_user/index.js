// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const user_collection = db.collection('owl_user')
const utils_collection  = db.collection('owl_utils')

// 云函数入口函数
exports.main = async (event, context) => {

  let user_info = null
  const wxContext = cloud.getWXContext()

  console.log('start', JSON.stringify(event.rawData), JSON.stringify(wxContext))

  try {
    user_info = JSON.parse(event.rawData) 
  } catch (ex) {
    console.log('parse error', ex)
    return { ret: -100, msg: 'server busy' }
  }

  if (!user_info) return { ret: -100, msg: 'user parse error'}

  const openid = wxContext.OPENID

  const user_res = await user_collection.doc(openid).get()

  console.log('get user ret', JSON.stringify(user_res))

  //查询失败
  if (user_res.errMsg !== 'document.get:ok') return { ret: -100, msg: 'db query error'}
  
  const store_user = user_res.data || {}

  extend(store_user, user_info)

  console.log(`store_user=`, JSON.stringify(store_user));

  //用户已经激活，更新用户信息
  if (store_user.active === 1) {

    //此处需要删除_id， 更新时不可带_id
    delete store_user._id;

    console.log(`store_user_latest=`, JSON.stringify(store_user));

    const update_res = await user_collection.doc(openid).update({ data: store_user })

    console.log('update_res', JSON.stringify(update_res))

    return { ret: 1, msg: 'OK', uid: store_user.uid }
  }

  const uid_res = await utils_collection.doc('uid').get()

  console.log('get uid index res', JSON.stringify(uid_res))


  if (uid_res.errMsg !== 'document.get:ok') return { ret: -100, msg: 'db query error'}

  const { index } = uid_res.data || {}
  
  store_user.ct = Date.now()
  store_user.uid = getUid(index)
  store_user._id = null
  store_user.active = 1
  delete store_user._id

  const add_ret = await Promise.all([
    utils_collection.doc('uid').update({ data: { index: index + 1 }}),
    user_collection.doc(openid).update({ data: store_user })
  ])

  console.log('add_ret', JSON.stringify(add_ret))

  return { ret: 0, msg: 'OK', uid: store_user.uid }
}


/**
 * 拓展用户信息
 * @param {Object} store_user 数据库保存的用户信息
 * @param {Object} user_info  客户端传递的用户信息
 */
function extend (store_user, user_info) {

  store_user.avatarUrl = user_info.avatarUrl
  store_user.city = user_info.city
  store_user.country = user_info.country
  store_user.gender = user_info.gender
  store_user.nickName = user_info.nickName
  store_user.province = user_info.province
  store_user.session_key = user_info.session_key
  store_user.sk_ut = new Date()
  store_user.ut = new Date()

  return
}

/**
 * 计算uid
 */
function getUid (index) {
  index = '' + (index || '1')
  return 'owl_' + (index > 1e6 ? index : new Array(6 - index.length + 1).join('0') + index)
}