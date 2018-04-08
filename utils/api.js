// http请求基地址
const app = getApp();
const http = app.globalData.url; 
// http网络接口请求
var request = function (params, callback) {
  wx.showLoading({
    title: '加载中',
    mask: true
  })
  wx.request({
    url: http + params.op,
    data: params,
    method: "POST",
    dataType: 'json',
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    success: function (res) {
      wx.hideLoading();
      return callback(res.data);
    },
    fail: function (res) {
      wx.hideLoading();
      loadFail(res.msg);
    }
  })
};
// 登录微信
var wxLogin = function(callback) {
  let that = this;
  wx.login({
    success: function (res) {
      if (res.code) {
        let options = {
          code: res.code
        }
        //发起网络请求
        wx.request({
          url: http + "auth/get",
          data: options,
          method: "POST",
          dataType: 'json',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {
            if (res.data.code == 0) {
              console.log(res.data.data)
              app.globalData.openid = res.data.data.openid;
              let params = {
                op: "auth/login",
                openid: res.data.data.openid,
                userInfo: JSON.stringify(app.globalData.userInfo)
              }
              that.request(params, function (res) {
                if (res.code == 0) {
                  console.log(res)
                  app.globalData.token = res.data.token;
                  app.globalData.site = res.data.site;
                  return callback();
                }
                that.loadFail(res.message);
              });
              
            } else {
              that.loadFail(res.message);
            }
          },
          fail: function (res) {
            loadFail(res.message);
          }
        })
      } else {
        console.log('获取用户登录态失败！' + res.errMsg)
      }
    }
  });
  
};
var toast = function(title){
  wx.showToast({
    title: title || "成功",
    icon:"success",
    duration: 2000
  })
};
// 加载等待loading
var loading = function (content) {
  wx.showLoading({
    title: content,
    mask: true
  })
};
// load失败
var loadFail = function (title) {
  wx.showToast({
    title: title || "网络错误",
    image: "../img/err.png",
    duration: 2000
  })
};
// 导出对外接口属性或方法
module.exports.http = http;
module.exports.request = request;
module.exports.alert = alert;
module.exports.loading = loading;
module.exports.loadFail = loadFail;
module.exports.toast = toast;
module.exports.wxLogin = wxLogin;
