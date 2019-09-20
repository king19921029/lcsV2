/**
 * 带参跳转
 * @params types 跳转类型
 * @params url 跳转地址
 * @params data 跳转携带的参数
 */
function router(types, url, data){
  if (data instanceof Object) {
    if (data instanceof Array) {
      routerTpye(types, url, "arrData", data)
      console.log("Array")
    } else {
      data = JSON.stringify(data)
      routerTpye(types, url, "objData", data)
      console.log("Object")
    }
  } else if (typeof data == "string") {
    routerTpye(types, url, "strData", data)
    console.log("String")
  }

}
/**
 * 获取带参类型
 * 
 * @params types{ 跳转类型
 *    1:navigateTo,
 *    2:redirectTo,
 *    3:switchTab,
 *    4:reLaunch
 * } 
 * @params url 跳转地址
 *  
 * @params dataType { 参数类型
 *    object
 *    array
 *    string      
 * }
 * @params data 跳转携带的参数
 */
function routerTpye(types, url, dataType, data){
  if (types == 1) {
    wx.navigateTo({
      url: url + "?" + dataType + "=" + data,
    })
  } else if (types == 2) {
    wx.redirectTo({
      url: url + "?" + dataType + "=" + data,
    })
  } else if (types == 3) {
    wx.switchTab({
      url: url
    })
  } else {
    wx.reLaunch({
      rl: url + "?" + dataType + "=" + data,
    })
  }
}
// 获取上页面
function getDataType(data){
  if (data.arrData) {
    return data.arrData.split(",")
  }
  if (data.objData) {
    return JSON.parse(data.objData)
  }
  if (data.strData) {
    return data.strData
  }
}
module.exports = {
  router: router,
  getDataType: getDataType,
}