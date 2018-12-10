// 云函数入口文件
const cloud = require('wx-server-sdk')
const moment = require('moment')

cloud.init()
const db = cloud.database()
const utils_collection = db.collection('owl_utils')
const story_collection = db.collection('owl_story')

// 云函数入口函数
exports.main = async (event, context) => {

  const data = event
  data.date_time = Date.now()
  data.date = moment().format('YYYYMMDD')
  data.start_images = data.start_images.map(item => {
    item.store_src = null
    item.temp_src = null
    delete item.store_src
    delete item.temp_src
    return item
  })

  data.end_images = data.end_images.map(item => {
    item.store_src = null
    item.temp_src = null
    delete item.store_src
    delete item.temp_src
    return item
  })

  return new Promise(resolve => {
    return utils_collection.doc('story_id').get().then(res => {
      const { index } = res.data
      data._id = getSid(index)
      return Promise.all([
        story_collection.add({ data }),
        utils_collection.doc('story_id').update({ data: { index: index + 1 } })
      ])
    }).then(result => {
      console.log('insert suc', result)
      return resolve({ ret: 0, msg: 'OK' })
    }).catch(ex => {
      console.log('insert error', ex)
      return resolve({ ret: -100, msg: 'err' })
    })
  })
}

/**
 * 计算story_id
 */
function getSid(index) {
  index = '' + (index || '1')
  return 'story_' + (index > 1e6 ? index : new Array(6 - index.length + 1).join('0') + index)
}