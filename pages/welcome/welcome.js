const app = getApp();
const api = require("../../utils/api.js");
// pages/index/admission.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getWxInfo();
  },
  // 获取用户微信账户信息
  getWxInfo: function () {
    wx.login({
      success: function (res) {
        if (res.code) {
          let options = {
            op: "auth/get.html",
            code: res.code
          }
          //发起网络请求
          api.request(options, function (res) {
            if(res.code == 0){
              app.globalData.openid = res.data.openid;
              return false;
            }
            api.toast(res.message);
          });
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    });
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '神秘唱星',
      path: '/pages/welcome/welcome',
      imageUrl: "../img/rc_bg.png",
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})