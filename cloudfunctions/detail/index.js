// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const story_collection = db.collection('owl_story')
const user_collection = db.collection('owl_user')

// 云函数入口函数
exports.main = async (event, context) => {

  const { id } = event

  return await story_collection.doc(id).get().then(async function (result) {

    console.log(`get story ret, id=${id}`, result)

    if (result.errMsg !== 'document.get:ok') return result.data
    

    const user_ret = await user_collection.field({
      _id: true,
      avatarUrl: true,
      nickName: true,
      uid: true
    }).where({ _id: result.data.userInfo.openId }).get()

    console.log(`get user ret, openid=${result.data.userInfo.openId}`, user_ret)

    if (user_ret.errMsg !== 'collection.get:ok') return result.data

    result.data.userInfo.avatarUrl = user_ret.data[0].avatarUrl
    result.data.userInfo.nickName  = user_ret.data[0].nickName
    result.data.userInfo.uid       = user_ret.data[0].uid

    return result.data
    
  })
}