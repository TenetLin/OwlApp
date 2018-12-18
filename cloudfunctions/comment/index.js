//云函数入口文件
const cloud = require('wx-server-sdk')
const db = cloud.database()
const story_collection = db.collection('owl_comment')
const user_collection = db.collection('owl_user')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  
  const { type, data } = event

  console.log('comment start', type, JSON.stringify(data))

  if (type === 'add')  return await add(data)

  return await getlist(data)
}

/**
 * 发布留言
 * @param {Object} data 
 */
async function add(data) {

}

/**
 * 查询留言
 * @param {Object} data 
 */
async function getlist (data) {

}