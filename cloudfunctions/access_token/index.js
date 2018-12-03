'use strict';
const cloud = require('wx-server-sdk')
const fetch = require('node-fetch')
cloud.init()
const db = cloud.database()
const url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET'

// 云函数入口函数
exports.main = async (event, context) => {

  //从数据库查询appid和appsecret
  return new Promise(resolve => {
    return db.collection('owl_utils').where({ _id: 'app' }).get().then(res => {
      const { appid, appsecret } = res.data[0]
      let req_url = url.replace('APPID', appid).replace('APPSECRET', appsecret)
      //换取access_token
      return fetch(req_url).then(res => res.json()).then(data => {
        console.log('get access_token suc, data=', data)
        const access_token = data.access_token

        return db.collection('owl_utils').where({ _id: 'app' }).update({
          data: {
            access_token,
            last_modify: new Date()
          }
        })
      })
    }).then(res => {
      console.log('process succfull', res)
    }).catch(ex => {
      console.log('process error', ex)
      resolve('OK')
    })
  })
}