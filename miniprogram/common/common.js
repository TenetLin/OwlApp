wx.cloud.init()

/*
{"checked":false,"title":"123123123","start_text":"123123123","start_images":[{"temp_src":"http://tmp/wx9b52f14eba6e62fd.o6zAJs41qbHMey6c8bndfsyx16s4.MgPAsH6mvn3Pf104157fa461f311a9fda5672cdbcd75.jpeg","store_src":"http://store/wx9b52f14eba6e62fd.o6zAJs41qbHMey6c8bndfsyx16s4.MgPAsH6mvn3Pf104157fa461f311a9fda5672cdbcd75.jpeg"},{"temp_src":"http://tmp/wx9b52f14eba6e62fd.o6zAJs41qbHMey6c8bndfsyx16s4.fu12YGh8V0nY547f49cc06c35b4aa9b9d37d1aa65eb4.jpeg","store_src":"http://store/wx9b52f14eba6e62fd.o6zAJs41qbHMey6c8bndfsyx16s4.fu12YGh8V0nY547f49cc06c35b4aa9b9d37d1aa65eb4.jpeg"},{"temp_src":"http://tmp/wx9b52f14eba6e62fd.o6zAJs41qbHMey6c8bndfsyx16s4.A2hkA3VVxkmb565a20f3fa197cfeec6d273b3c32f34a.jpeg","store_src":"http://store/wx9b52f14eba6e62fd.o6zAJs41qbHMey6c8bndfsyx16s4.A2hkA3VVxkmb565a20f3fa197cfeec6d273b3c32f34a.jpeg"}],"end_text":"1231231231","end_images":[{"temp_src":"http://tmp/wx9b52f14eba6e62fd.o6zAJs41qbHMey6c8bndfsyx16s4.O44ehuSkzrEJ921ce59ab623554f279bae9ed7c3bee5.jpeg","store_src":"http://store/wx9b52f14eba6e62fd.o6zAJs41qbHMey6c8bndfsyx16s4.O44ehuSkzrEJ921ce59ab623554f279bae9ed7c3bee5.jpeg"},{"temp_src":"http://tmp/wx9b52f14eba6e62fd.o6zAJs41qbHMey6c8bndfsyx16s4.iADYKlIwwReK827cb6d2d1353952448c8b2bdd0b2167.jpeg"}],"index":0,"__webviewId__":838}
 */

exports.goToLogin = goToLogin
exports.upload_files = upload_files
exports.save_files = save_files
exports.get_userinfo = get_userinfo
exports.remove_files = remove_files

/**
 * 跳转登录
 */
function goToLogin () {
  wx.reLaunch({
    url: '/pages/login/index',
  })
}

/**
 * 将Temp缓存中的文件存到本地缓存
 */
function save_files(files, cb, index) {
  files = files || []
  index = index || 0

  if (index >= files.length) {
    return cb && cb(files)
  }

  if (files[index].store_src || !files[index].temp_src) {
    return save_files(files, cb, index + 1)
  }
  wx.saveFile({
    tempFilePath: files[index].temp_src,
    success(res) {
      files[index].store_src = res.savedFilePath
    },
    fail(res) {
      wx.showToast({ title: '图片太大', image: '/images/warning.png' })
      console.log('saveFile error', res)
      files.splice(index, 1)
      index = index -1
    },
    complete () {
      save_files(files, cb, index + 1)
    }
  })
}

/**
 * 将本地缓存的文件删除
 */
function remove_files(files, cb, index) {
  files = files || []
  index = index || 0

  if (index >= files.length) {
    return cb && cb(files)
  }

  if (!files[index].savedFilePath) {
    return save_files(files, cb, index + 1)
  }
  wx.removeSavedFile({
    filePath: files[index].savedFilePath,
    success(res) {
      console.log('removeSavedFile suc', res)
      files[index].savedFilePath = ''
    },
    fail(res) {
      console.log('removeSavedFile error', res)
    },
    complete() {
      remove_files(files, cb, index + 1)
    }
  })
}


/**
 * 文件批量上传到服务器
 */
function upload_files (files, type, cb, index) {
  const user = get_userinfo()

  //用户信息不全，跳转重新授权
  if (!user || !user.uid) {
    goToLogin()
    return
  }

  index = index || 0
  files = files || []

  if (index >= files.length) {
    return cb && cb(files)
  }
  
  let path = `story/${user.uid}_${Date.now()}_${type}_${index}`
  wx.cloud.uploadFile({
    cloudPath: path, // 上传至云端的路径
    filePath: files[index].store_src,
    success: res => {
      // 返回文件 ID
      console.log(res.fileID)
      files[index].file_id = res.fileID
    },
    fail: console.error,
    complete (res) {
      upload_files(files, type, cb, index + 1)
    }
  })
}

/**
 * 查询用户信息
 */
function get_userinfo () {
  try {
    const data = JSON.parse(wx.getStorageSync('myself') || '{}')
    return data;
  } catch (ex) {
    console.log('get data from cache error, key=myself, ex=', ex)
  }
}