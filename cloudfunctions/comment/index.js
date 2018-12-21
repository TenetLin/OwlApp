//云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const comment_collection = db.collection('owl_comment')
const user_collection = db.collection('owl_user')
const utils_collection = db.collection('owl_utils')

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

  return utils_collection.doc('comment_id').then(async res => {

    const { index } = res.data

    data._id = getSid(index)

    return comment_collection.add(data)

  }).then(result => {
    console.log('insert suc', result)
    return resolve({ ret: 0, msg: 'OK' })
  }).catch(ex => {
    console.log('insert error', ex)
    return resolve({ ret: -100, msg: 'err' })
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