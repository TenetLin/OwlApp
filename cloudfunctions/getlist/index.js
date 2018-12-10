// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const story_collection = db.collection('owl_story')

//临时文件访问链接
const tem_url_timeout = 24 * 3600 * 1e3
//缓存数据过期时间
const cache_data_timeout = 5 * 60 * 1e3

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

  const cache = data[date] || { ut: 0, data: []}
  
  //数据更新时间小于5min，直接从缓存中取值
  if (Date.now() - cache.ut < cache_data_timeout) {

    return { ret: 0, msg: 'OK', data: cache.data }

  }


  await story_collection.where({ date }).orderBy('date_time', 'desc').get().then(result => {

    const f_id_urls = {}

    result.data = result.data || []

    for (let i of result.data) {

      if (Date.now() - item.url_ut > tem_url_timeout 
      && (item.start_images.length || item.end_images.length)) {

        item = await update(item)
        
      }
    }
    
  })

}

/**
 *
 * 临时文件访问链接查询
 * @param {*} fids
 * @returns
 */
async function  get_urls(fileList) {

  const result = await cloud.getTempFileURL(fileList)

  return result.fileList
}


/**
 * 更新图片链接
 *
 * @param {*} item
 */
async function update(item) {

  const 
}