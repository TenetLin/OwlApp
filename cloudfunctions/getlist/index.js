// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const story_collection = db.collection('owl_story')

//临时文件访问链接
const tem_url_timeout = 24 * 3600 * 1e3
//缓存数据过期时间
const cache_data_timeout = 0 * 60 * 1e3

const data = {
  '20181207': {
    ut: 0,
    datas: []
  },
  '20181206': {
    ut: 0,
    datas: []
  }
}

// 云函数入口函数
exports.main = async (event, context) => {

  const { date } = event

  data[date] = data[date] || { ut: 0, datas: []}
  
  //数据更新时间小于5min，直接从缓存中取值
  if (Date.now() - data[date].ut < cache_data_timeout) {

    return { ret: 0, msg: 'OK', data: data[date].data }

  }

  await story_collection.where({ date }).orderBy('date_time', 'desc').get().then(async function (result) {

    console.log(`get by date suc, date=${date}`, result)

    const f_id_urls = {}

    result.data = result.data || []

    for (let item of result.data) {
      
      item.url_ut = item.url_ut || 0
      if (Date.now() - item.url_ut > tem_url_timeout 
      && (item.start_images.length || item.end_images.length)) {

        item = await update(item)
        
      }

      console.log(item)

    }

    data[date].ut = Date.now()
    data[date].datas = result.data

    console.log('cache date=', data)

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

  })

  const start_images = result.fileList.slice(0, item.start_images.length)
  const end_images = result.fileList.slice(item.start_images.length)

  const url_ut = Date.now()

  await story_collection.doc(item._id)
  .update({
    data: {
      start_images,
      end_images,
      url_ut
    }
  }).then(res => {

    console.log('update ret', JSON.stringify(item), JSON.stringify(ret))

    item.start_images = start_images
    item.end_images = end_images
    item.url_ut = url_ut

  }).cache(ex => {
    console.log('update eroor', JSON.stringify(item), ex)
  })
}