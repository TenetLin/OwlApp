// 云函数入口文件
const cloud = require('wx-server-sdk')
const fetch = require('node-fetch')
const url = 'https://api.weixin.qq.com/sns/jscode2session?appid=$appid&secret=$secret&js_code=$js_code&grant_type=authorization_code'
cloud.init()
const db = cloud.database()
const user_collection = db.collection('owl_user')
const utils_collection = db.collection('owl_utils')

// 云函数入口函数
exports.main = async (event, context) => {

  const { code } = event

  const app_sec = await utils_collection.doc('app').get();

  console.log(code, app_sec)

  if (app_sec.errMsg !== 'document.get:ok') return { ret: -100, msg: 'get appid and secret error' }

  const { appid, secret } = app_sec.data || {}

  if (!appid || !secret) return { ret: -100, msg: 'get appid and secret error' }

  const _url = url.replace('$appid', appid).replace('$secret', secret).replace('$js_code', code);

  const { openid, session_key } = await fetch(_url).then(res => res.json())

  if (!openid || !session_key) return { ret: -100, msg: 'fetch openid and session_key error' }

  const user_ret = await user_collection.where({ _id: openid }).get()

  console.log(user_ret);

  if (user_ret.errMsg !== 'collection.get:ok') return { ret: -100, msg: 'get user error' }

  let user_up_ret, user = user_ret.data[0] || {}

  if (user_ret.data.length === 0) {
    user_up_ret = await user_collection.add({
      data: {
        appid,
        _id: openid,
        session_key,
        sk_ut: new Date
      }
    })

  } else {

    user_up_ret = await user_collection.where({ _id: openid }).update({
      data: {
        session_key,
        sk_ut: new Date()
      }
    })

  }
  console.log('user_up_ret=', user_up_ret)

  return { ret: user.active || 0, msg: 'OK' }
}