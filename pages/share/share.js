//index.js
//获取应用实例
const app = getApp()
const api = require("../../utils/api.js");
Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    imgStatus:false,
    id:"",
    token:"",
    song:{
      detail:{},
      site:{}
    }
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function (option) {
    wx.showShareMenu({
      withShareTicket: true
    })
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true,
        token: app.globalData.token,
        id:option.id
      })
      this.getKouLing();
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true,
          token: app.globalData.token,
          id: option.id
        })
        this.getKouLing();
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true,
            token: app.globalData.token,
            id: option.id
          })
          this.getKouLing();
        }
      })
    }
  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  // 获取口令详情
  getKouLing: function () {
    let that = this;
    let options = {
      op: "media/detail",
      token: this.data.token,
      id: this.data.id
    }
    if (app.globalData.token) {
      api.request(options, function (res) {
        if (res.code == 0) {
          that.setData({
            song: res.data
          });
          return false;
        }
        api.loadFail(res.message);
      });
    } else {
      api.wxLogin(function () {
        that.getKouLing();
      });
    }
  },
  // 转发给朋友或群聊
  shareFriend:function(){
    this.onShareAppMessage();
  },
  onShareAppMessage: function () {
    let avatar = this.data.userInfo.avatarUrl;
    let nickName = this.data.userInfo.nickName;
    return {
      title: this.data.song.detail.title,
      path: '/pages/play/play?id=' + this.data.id,
      imageUrl: this.data.song.detail.thumb,
      success: function (res) {
        // 转发成功
        console.log(res);
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  // 生成朋友圈分享图片
  shareFriend: function(){
    wx.navigateTo({
      url: '../friend/friend',
    })
  },
  
  navigateBack: function () {
    wx.navigateBack();
  }
})
