//云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const comment_collection = db.collection('owl_comment')
const user_collection = db.collection('owl_user')
const utils_collection = db.collection('owl_utils')
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  
  const { type, data } = event
  const wxContext = cloud.getWXContext()

  console.log('comment start', type, JSON.stringify(data), JSON.stringify(wxContext))

  if (type === 'add')  return await add(data, wxContext)

  if (type === 'get') return await getlist(data, wxContext)

  if (type === 'count') return await getCount(data, wxContext)

}

/**
 * 发布留言
 * @param {Object} data 
 */
async function add(data, wxContext) {

  console.log('add', JSON.stringify(data), wxContext)

  const appid = wxContext.APPID
  const openid = wxContext.OPENID

  if (!data || !data.content || !data.story_id) return { ret: -1, msg: 'invalid input' }

  return utils_collection.doc('comment_id').get().then(async res => {

    const { index } = res.data

    data._id = getSid(index)
    data.openid = openid
    data.appid = appid
    data.ct = Date.now()

    console.log('before store comments', JSON.stringify(data))

    return Promise.all([
      comment_collection.add({ data }),
      utils_collection.doc('comment_id').update({ data: { index: index + 1 } })
    ])

  }).then(async result => {
    console.log('insert suc', result)
    return { ret: 0, msg: 'OK' }
  }).catch(async ex => {
    console.log('insert error', ex)
    return { ret: -100, msg: 'err' }
  })

}

/**
 * 查询留言
 * @param {Object} data 
 */
async function getlist (data, wxContext) {

  console.log('get', JSON.stringify(data), wxContext)
  if (!data || !data.story_id) return { ret: -1, msg: 'invalid input' }

  let { story_id, offset = 0, count = 10 } = data

  if (count > 10 || count < 0 ) count = 10
  
  return Promise.all([
    comment_collection.where({ story_id }).count(),
    comment_collection.where({ story_id }).orderBy('ct', 'asc').skip(offset).limit(count).get()
  ]).then(async function ([count_res, data_res ]) {

    console.log('get succ', count_res, data_res);
    

    let openids = new Set()
    data_res.data = data_res.data || []

    data_res.data.forEach(({ openid }) => {
      openids.add(openid)
    })
    openids = Array.from(openids)

    //获取用户信息
    const user_ret = await user_collection.field({
      _id: true,
      avatarUrl: true,
      nickName: true,
      uid: true
    }).where({
      _id: _.in(openids)
    }).get()

    //用户信息查询失败
    if (user_ret.errMsg !== 'collection.get:ok') {
      
      console.log('get userinfo error', JSON.stringify(user_ret))

      return { ret: 0, msg: 'OK', list: data_res.data, count: count_res.total }

    } else {

      data_res.data.map(item => {

        user_ret.data.some(user => {
  
          if (item.openid === user._id) {
  
            item.avatarUrl = user.avatarUrl
            item.nickName  = user.nickName
            item.uid       = user.uid
  
            return true
          }
        })
  
        return item
      })

      return { ret: 0, msg: 'OK', list: data_res.data, count: count_res.total }

    }

  }).catch(async function (err) {

    console.log('get data error', err)

    return { ret: -100, msg: 'err', list: [], count: 0 }
  })
}

/**
 * 更新count数
 * @param {Object} data 
 * @param {Object} wxContext 
 */
async function getCount(data, wxContext) {

  console.log('getCount', JSON.stringify(data), wxContext)

  if (!data || !data.story_id) return { ret: -1, msg: 'invalid input' }

  const { story_id } = data

  const count_res = await comment_collection.where({ story_id }).count()

  console.log('getCount result', count_res)

  if (count_res.errMsg === 'collection.count:ok') return { ret: 0, msg: 'OK', total: count_res.total }

  return { ret: -100, msg: 'err' }

}


/**
 * 计算story_id
 */
function getSid(index) {
  index = '' + (index || '1')
  return 'comment_' + (index > 1e6 ? index : new Array(6 - index.length + 1).join('0') + index)
}