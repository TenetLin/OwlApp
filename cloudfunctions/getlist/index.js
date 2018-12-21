// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const story_collection = db.collection('owl_story')
const user_collection = db.collection('owl_user')
const _ = db.command

//临时文件访问链接
const tem_url_timeout = 24 * 3600 * 1e3


// 云函数入口函数
exports.main = async (event, context) => {

  const { date } = event

  return story_collection.where({ date }).orderBy('date_time', 'desc').get().then(async function (result) {

    console.log(`get by date suc, date=${date}`, result)

    result.data = result.data || []

    let openids = new Set()

    for (let item of result.data) {
      
      item.url_ut = item.url_ut || 0
      if (Date.now() - item.url_ut > tem_url_timeout 
      && (item.start_images.length || item.end_images.length)) {

        await update(item)
        
      }

      openids.add(item.userInfo.openId)
    }

    openids = Array.from(openids)

    console.log('user openid=', openids)

    const user_ret = await user_collection.field({
      _id: true,
      avatarUrl: true,
      nickName: true,
      uid: true
    }).where({
      _id: _.in(openids)
    }).get()

    //用户信息查询失败
    if (user_ret.errMsg !== 'collection.get:ok') return result.data

    result.data = result.data.map(item => {

      user_ret.data.some(user => {

        if (item.userInfo.openId === user._id) {

          item.userInfo.avatarUrl = user.avatarUrl
          item.userInfo.nickName  = user.nickName
          item.userInfo.uid       = user.uid

          return true
        }
      })

      return item

    })
    
    return result.data
  })

}

/**
 * 更新图片链接
 *
 * @param {Object} item
 */
async function update(item) {

  let fileList = []

  console.log('before update1', item)

  fileList = fileList.concat(item.start_images)
  fileList = fileList.concat(item.end_images)

  console.log('before update2', fileList)

  fileList = fileList.map(item => {
    item.maxAge = 24 * 60 * 60
    return item
  })
  
  const result = await cloud.getTempFileURL({ fileList })


  console.log('get tempFileUrl result', result)

  result.fileList = result.fileList.map(item => {

    const temp = {}
    temp.fileID = item.fileID
    temp.tempFileURL = item.tempFileURL

    return temp
  })

  const start_images = result.fileList.slice(0, item.start_images.length)
  const end_images = result.fileList.slice(item.start_images.length)

  const url_ut = Date.now()

  return await story_collection.doc(item._id)
  .update({
    data: {
      start_images,
      end_images,
      url_ut
    }
  }).then(res => {

    console.log('update res', JSON.stringify(item), JSON.stringify(res))

    item.start_images = start_images
    item.end_images = end_images
    item.url_ut = url_ut

  }).catch(ex => {
    console.log('update eroor', JSON.stringify(item), ex)
  })
}