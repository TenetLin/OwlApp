// 云函数模板
// 部署：在 cloud-functions/user_info 文件夹右击选择 “上传并部署”

const cloud = require('wx-server-sdk')
// 初始化 cloud
cloud.init()
const db = cloud.database()
const user_collection = db.collection('owl_user')
const story_collection = db.collection('owl_story')
const star_collection = db.collection('owl_star')
const _ = db.command

/**
 * 这个示例将经自动鉴权过的小程序用户 openid 返回给小程序端
 * 
 * event 参数包含小程序端调用传入的 data
 * 
 */
exports.main = async (event, context) => {
  // 获取 WX Context (微信调用上下文)，包括 OPENID、APPID、及 UNIONID（需满足 UNIONID 获取条件）
  const { APPID, OPENID } = cloud.getWXContext()

  const user_res = await  user_collection.field({ uid: true, active: true }).where({ _id: OPENID }).get();

  console.log('get user info ret', user_res)
  
  const user = user_res.data[0]

  if (!user) return { ret: -100, msg: 'error' }

  if (!user.active) return { ret: 0, msg: 'OK' }

  const uid = user.uid;

  const story_res = await story_collection.field({ story_id: true }).where({ uid }).get()

  console.log('get story id suc', story_res)

  const story_ids = story_res.data.map(({ _id }) => _id)

  const star_res = await star_collection.where({ story_id: _.in(story_ids)}).count()

  console.log('star_res', star_res)

  return { 
    ret: 1, 
    msg: 'OK', 
    data: { 
      uid: user.uid,
      openid: OPENID,
      starNum: star_res.total || 0,
      attentionNum: user.attentionNum || 0,
      fansNum: user.fansNum || 0
    }
  }
}