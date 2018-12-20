//云函数入口文件
const cloud = require('wx-server-sdk')
const db = cloud.database()
const story_collection = db.collection('owl_comment')
const user_collection = db.collection('owl_user')
const utils_collection = db.collection('owl_utils')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  
  const { type, data } = event
  const wxContext = cloud.getWXContext()

  console.log('comment start', type, JSON.stringify(data), JSON.stringify(wxContext))

  if (type === 'add')  return await add(data, wxContext)

  return await getlist(data, wxContext)
}

/**
 * 发布留言
 * @param {Object} data 
 */
async function add(data, wxContext) {


  if (!data || !data.text) return { ret: -1, msg: 'invalid input' }

  return utils_collection.doc('comment_id').then(res => {

    const { index } = res.data

    

  })

}

/**
 * 查询留言
 * @param {Object} data 
 */
async function getlist (data, wxContext) {

}


/**
 * 计算story_id
 */
function getSid(index) {
  index = '' + (index || '1')
  return 'comment_' + (index > 1e6 ? index : new Array(6 - index.length + 1).join('0') + index)
}