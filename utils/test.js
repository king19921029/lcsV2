


/**
 * 个位数补0
 */
function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//格式化时间（当前时间,格式化字符串）
function pattern(date, fmt) {
  fmt = fmt || "yyyy-MM-dd hh:mm:ss";
  var o = {
    "M+": date.getMonth() + 1, //月份
    "d+": date.getDate(), //日
    "h+": date.getHours() % 12 == 0 ? 12 : date.getHours() % 12, //小时
    "H+": date.getHours(), //小时
    "m+": date.getMinutes(), //分
    "s+": date.getSeconds(), //秒
    "q+": Math.floor((date.getMonth() + 3) / 3), //季度
    "S": date.getMilliseconds() //毫秒
  };
  var week = {
    "0": "/u65e5",
    "1": "/u4e00",
    "2": "/u4e8c",
    "3": "/u4e09",
    "4": "/u56db",
    "5": "/u4e94",
    "6": "/u516d"
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  }
  if (/(E+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "/u661f/u671f" : "/u5468") : "") + week[date.getDay() + ""]);
  }
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    }
  }
  return fmt;
}

/**
 * 时间处理
 */
function timeSet(tim) {
  let t = tim.substr(tim.indexOf(" "))
  if (t.length > 6) {
    t = t.replace(/\:[0-9]{2}$/gi, "")
  }
  return t
}

/**
 * 判断目标是否是函数
 * @param {mixed} val
 * @returns {boolean}
 */
function isFunction(val) {
  return typeof val === 'function';
}

/**
 * 限频节流函数
 * @param fn
 * @param delay
 * @param ctx
 * @returns {Function}
 */
function throttle(fn, delay) {
  let isAvail = true
  let count = false
  let movement = null
  return function () {
    //此处this是调用次节流的page页面
    count = true
    let args = arguments
    if (isAvail) {
      fn.apply(this, args)
      isAvail = false
      count = false
      setTimeout(() => {
        isAvail = true
      }, delay)
    }
    //触发最后一次回调
    if (count) {
      clearTimeout(movement)
      movement = setTimeout(() => {
        fn.apply(this, args)
      }, 2 * delay)
    }
  }
}

//截取文字(文字,最多字数,后缀字符)
function stringStr(str, n, suffix) {
  var suffix = suffix || "";
  if (str.replace(/[\u4e00-\u9fa5]/g, "**").length <= n) {
    return str;
  } else {
    var len = 0;
    var tmpStr = "";
    for (let i = 0; i < str.length; i++) {//遍历字符串
      if (/[\u4e00-\u9fa5]/.test(str[i])) {//中文 长度为两字节
        len += 2;
      }
      else {
        len += 1;
      }
      if (len > n) {
        break;
      }
      else {
        tmpStr += str[i];
      }
    }
    return tmpStr + suffix;
  }
}
/**
 * 字符长度（中文）
 * @params str 输入字符串
 */
function strLen(str) {
  var len = 0;
  for (var i = 0; i < str.length; i++) {
    var c = str.charCodeAt(i);
    //单字节加1
    if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
      len++;
    }
    else {
      len += 2;
    }
  }
  return len;
}

//验证是否是数字
function isNumber(v) {
  let regex = /^[0-9]+.?[0-9]*$/;
  return regex.test(v);
}

/**
 * 接口请求方法
 * @param url {string} 请求url
 * @param method 请求方式
 * @param data 业务参数
 * @param success {function} 成功回调函数
 * @param fail {function} 失败回调函数
 * @param complete {function} 完成回调函数
 *
 */
function reqFun(params, callback) {
  if (!params) {
    return;
  }
  return new Promise((rep, rej) => {
    wx.request({
      url: params.url ? params.url : '',
      method: params.method ? params.method : 'POST',
      data: params.data ? params.data : reqParams({}),
      header: params.header ? params.header : { 'Content-Type': 'application/json' },
      success: (res) => {
        //console.log(res.data)
        if (res && res.data.code == 1) {
          rep(res.data)
        } else {
          console.log("请求地址------------：", params.url)
          console.log("请求参数------------：", params.data)
          callback()
        }
      },
      fail: (err) => {
        console.log('---接口请求失败，地址：', JSON.stringify(params.url || ''))
        console.log('---接口请求失败，业务参数：', JSON.stringify(params.data || {}))
        rej(err)
        callback();
      }
    });
  })
}

//通用请求（封装header）
function comReq(params) {
  if (!params) {
    return;
  }
  if (!params.header) { params.header = {}; }
  console.log("token--------", wx.getStorageSync('token'))
  Object.assign(params.header, {
    'token': wx.getStorageSync('token') || ""
  });
  //todo 封装其它header等
  //todo 失败后处理：提示错误并转到登录页
  //暂直接调用reqFun
  return reqFun(params, function (res) {
    if (res.code == 401) {
      wx.navigateTo({
        url: `/pages/login/login`
      })
    }
  })
}

/**
 *
 * 接口请求参数
 * @公共参数 cid 客户端来源标识 100:android 200：ios 300:wechat 400:百度小程序
 * @公共参数 ver 客户端版本号
 * @公共参数 uid 用户标识
 *
 * @业务参数 param
 */
function reqParams(param) {
  let commonParam = {
    cid: '300',
    ver: wx.getSystemInfoSync().version,
    uid: getLoginUserInfo().uid || ''
  }
  // console.log('业务参数=====', commonParam)
  return Object.assign({}, commonParam, { param: param });
}

function getWeek(dateStr) {
  let show_day = new Array('周日', '周一', '周二', '周三', '周四', '周五', '周六');
  let date = new Date(dateStr);
  return show_day[date.getDay()]
}

function hidePhoneNum(phoneNum) {
  return phoneNum.substring(0, 4) + "***" + phoneNum.substring(8)
}

function getDayAndWeek(dateStr) {
  let show_day = new Array('日', '一', '二', '三', '四', '五', '六');
  let date = new Date(dateStr);
  return (date.getMonth() + 1) + '月' + (date.getDate()) + '日 星期' + show_day[date.getDay()]
}

module.exports = {
  formatNumber,
  pattern,
  isFunction,
  throttle,
  stringStr,
  strLen,
  isNumber,
  reqFun,
  timeSet,
  getWeek,
  getDayAndWeek,
  hidePhoneNum,
  comReq,
  timeSet,
}