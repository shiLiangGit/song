// pages/index/customer_service.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    qrCode:"../img/qrocde.jpg",
    tel:"13262927202"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(app.globalData.userInfo)
    console.log(app.globalData.site.wechat_code)
    if(app.globalData.userInfo){
      this.setData({
        qrcode: app.globalData.site.wechat_code,
        tel: app.globalData.site.tel
      });
    }
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