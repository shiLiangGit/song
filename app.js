//app.js

App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    this.getAuthor();
  },
  // 小程序获取个人信息权限验证
  getAuthor:function(){
    let that = this;
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          that.getUserInfo(that);
        } else {
          wx.authorize({
            scope: 'scope.userInfo',
            success() {
              // 确认授权后，获取个人信息
              that.getUserInfo(that);
            },
            fail() {
              // 拒绝授权，弹出提示窗口，手动授权
              wx.showModal({
                title: '提示',
                content: '小程序需要获取用户信息去权限，点击确认前往设置或退出程序？',
                showCancel: false,
                success: function (res) {
                  wx.openSetting({
                    success: (res) => {
                      that.getAuthor();
                    }
                  })
                }
              })
            }
          })
        }
      }
    })
  },
  // 获取微信个人信息
  getUserInfo:function(that){
    wx.getUserInfo({
      success: res => {
        // 可以将 res 发送给后台解码出 unionId
        that.globalData.userInfo = res.userInfo
        console.log(that.globalData.userInfo);
        // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
        // 所以此处加入 callback 以防止这种情况
        if (that.userInfoReadyCallback) {
          that.userInfoReadyCallback(res)
        }
      }
    })
  },
  globalData: {
    userInfo: null,
    openid:null,
    token:null,
    site:{
      give_money:0,
      logo:null,
      title:"",
      withdraw_fee:0
    },
    url:"https://cc.shyhzcgl.com/api/"
  }
})