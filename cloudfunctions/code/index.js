// 云函数入口文件
const cloud = require('wx-server-sdk')
const fetch = require('node-fetch')
const url = 'https://api.weixin.qq.com/sns/jscode2session?appid=wx60c38530b526b496&secret=7fb477c6ad0e97ed57e3cd5a55832451&js_code=JSCODE&grant_type=authorization_code'
cloud.init()
const db = cloud.database()
const collection = db.collection('owl_user')

// 云函数入口函数
exports.main = async (event, context) => {

  const { code } = event
  const { APPID } = cloud.getWXContext()

  return new Promise(resovle => {
    return fetch(url.replace('JSCODE', code))
      .then(res => res.json())
      .then(res => {

        console.log(res)
        const { openid, session_key } = res

        return collection.where({ _id: openid }).get().then(res => {

          //用户已经在后台注册OK
          if (res.data.length === 1) {
            
            const user = res.data[0]

            return collection.where({ _id: openid }).update({
              data: {
                session_key,
                sk_ut: new Date()
              }
            }).then(res => {
              console.log('update session_key succ', res)
              return user
            })
          } else {
            return collection.add({
              data: {
                appid: APPID,
                _id: openid,
                session_key,
                sk_ut: new Date
              }
            }).then(res => {
              console.log('add session_key succ', res)
              return {}
            })
          }
        }).then(user => {
          console.log('update db', user)
          return resovle({ ret: user.active || 0, msg: 'OK' })
        })
      }).catch( ex => {
        console.error('error=', ex)
        return resovle({ ret: -100, msg: 'error' })
      })
  })
}