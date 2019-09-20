const baseUrl = 'https://api-dev.licaishi365.com';
// 获取header
function getHeader(method) { 
  console.log(method)
  if (method == "POST"){
    return {
      "content-type": "application/x-www-form-urlencoded",
      "device-type": "xiaochengxu-maya",
      "version": "0",
      "uuid": "xiaochengxu",
      'x-authorization': wx.getStorageSync('token') || ""
    }
  }else{
    return {
      'content-type': 'application/json',
      "device-type": "xiaochengxu-maya",
      "version": "0",
      "uuid": "xiaochengxu",
      'x-authorization': wx.getStorageSync('token') || ""
    }
  }
}
//错误toast
function showErrToast(e) { 
  wx.showToast({
    title: e,
    icon: 'none',
    duration: 1000
  })
}
//promise对象
function getPromise(url, data, method) {
  // getHeader(method)
  console.log(getHeader(method))
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${baseUrl}${url}`,
      header: getHeader(method),
      method: method,
      data: data,
      success: function (res) {
        if (res.data.code === 0) {
          resolve(res.data.data)
        } else {
          reject(res.data.message)
        }
      },
      fail: function (err) {
        reject(err)
      }
    })
  }).catch(function (e) {
    console.log(e)
  })
}
const http = { 
  get: function (url, data) {
    return getPromise(url, data, 'GET')
  },
  post: function (url, data) {
    return getPromise(url, data, 'POST')
  },
  put: function (url, data) {
    return getPromise(url, data, 'PUT')
  },
  delete: function (url, data) {
    return getPromise(url, data, 'DELETE')
  }
}
export default http