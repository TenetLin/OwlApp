// 云函数模板
// 部署：在 cloud-functions/user_info 文件夹右击选择 “上传并部署”

const cloud = require('wx-server-sdk')
// 初始化 cloud
cloud.init()
const db = cloud.database()
const user_collection = db.collection('owl_user')
const story_collection = db.collection('owl_story')
const star_collection = db.collection('owl_star')
const attation_collection = db.collection('owl_attation')
const _ = db.command

const fields = {
  uid: true, 
  active: true, 
  avatarUrl: true,
  nickName: true,
}

/**
 * 这个示例将经自动鉴权过的小程序用户 openid 返回给小程序端
 * 
 * event 参数包含小程序端调用传入的 data
 * 
 */
exports.main = async (event, context) => {

  // 获取 WX Context (微信调用上下文)，包括 OPENID、APPID、及 UNIONID（需满足 UNIONID 获取条件）
  const { APPID, OPENID } = cloud.getWXContext()

  let { uid } = event

  console.log('receive_data', JSON.stringify(event), JSON.stringify(context), uid, OPENID)

  let user_res = null

  if (uid) user_res = await user_collection.field(fields).where({ uid }).get()

  else user_res = await user_collection.field(fields).where({ _id: OPENID }).get()

  console.log('get user info ret', user_res)
  
  const user = user_res.data[0]

  if (!user) return { ret: -100, msg: 'error' }

  if (!user.active) return { ret: 0, msg: 'OK' }

  if (!uid) uid = user.uid

  const story_res = await story_collection.field({ story_id: true }).where({ uid }).get()

  console.log('get story id suc', story_res)

  const story_ids = story_res.data.map(({ _id }) => _id)

  const count_res = await Promise.all([
    star_collection.where({ story_id: _.in(story_ids) }).count(),
    attation_collection.where({ follower: uid }).count(),
    attation_collection.where({ followed: uid }).count()
  ])
  

  console.log('count_res', count_res)

  const star_info     = count_res[0] || {}
  const attation_info = count_res[1] || {}
  const fans_info     = count_res[2] || {}

  return {
    ret: 1, 
    msg: 'OK', 
    data: { 
      uid: user.uid,
      openid: OPENID,
      avatarUrl: user.avatarUrl,
      nickName: user.nickName,
      starNum: star_info.total || 0,
      attentionNum: attation_info.total || 0,
      fansNum: fans_info.total || 0
    }
  }
}