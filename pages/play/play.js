//index.js
//获取应用实例
const app = getApp();
const api = require("../../utils/api.js");
let innerAudioContext = "";
Page({
  data: {
    userInfo: {},
    name:"",
    avatar:"",
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    money:0,
    detail:{
      type: 0,
      title: "",
      url: "",
      thumb: "",
      avatarUrl: "",
      nickName: ""
    },
    site:{
      give_money:0
    },
    isPlay:false,
    round:false,
    token:""
  },
  onLoad: function (option) {
    console.log(app.globalData.userInfo);
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        token: app.globalData.token,
        id:option.id,
        site:{
          give_money: app.globalData.site.give_money,
        },
        hasUserInfo: true
      })
      console.log(this.data);
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true,
          token: app.globalData.token,
          site: {
            give_money: app.globalData.site.give_money,
          },
          id: option.id,
        })
        console.log(this.data);
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
            site: {
              give_money: app.globalData.site.give_money,
            },
            id: option.id,
          })
          console.log(this.data);
        }
      })
    }
    this.getKouLing();
  },
  getUserInfo:function (e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  // 获取口令详情
  getKouLing:function(){
    let that = this;
    let options = {
      op:"media/detail",
      token: this.data.token,
      id:this.data.id
    }
    if (app.globalData.token) {
      api.request(options, function (res) {
        console.log(res);
        if (res.code == 0) {
          that.setData({
            detail: res.data.detail,
            site:res.data.site
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
  // 再次转发
  onShareAppMessage: function () {
    let that = this;
    if (res.from === 'button') {
      return {
        title: '神秘唱星',
        path: '/pages/play/play?id=' + that.data.id,
        success: function (res) {
          // 转发成功
        },
        fail: function (res) {
          // 转发失败
        }
      }
    }else{
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
    
  },
  
  // 播放录音
  playAudio: function () {
    if (innerAudioContext == ""){
      innerAudioContext = wx.createInnerAudioContext();
    }
    console.log(innerAudioContext)
    innerAudioContext.src = this.data.detail.url;
    if (!this.data.isPlay) {
      console.log(this.data.isPlay);
        this.setData({
          isPlay: true
        });
        innerAudioContext.play();
        innerAudioContext.onPlay(() => {
          console.log('开始播放');
          this.setData({
            round: true
          });
        })
        // 录音播放自然完后回调
        innerAudioContext.onEnded((res) => {
          this.setData({
            isPlay: false,
            round: false
          });
        })
        innerAudioContext.onStop((res) => {
          console.log(innerAudioContext)
          this.setData({
            round: false,
            isPlay: false
          });
        });
      } else {
        // 停止播放录音
        innerAudioContext.stop();
        innerAudioContext.onStop((res) => {
          console.log(innerAudioContext)
          this.setData({
            round: false,
            isPlay: false
          });
        });
      }
      innerAudioContext.onError((res) => {
        console.log(res.errMsg)
        console.log(res.errCode)
      })
  },
  // 设置打赏金额
  setMoney:function(e){
    this.setData({
      site:{
        give_money: e.detail.value
      }
    });
  },
  // 小赏一个
  payMoney:function(){
    let that = this;
    let money = that.data.site.give_money;
    if(money < 1){
      api.toast("金额不能小于1元");
      return false;
    }
    if (money > 200) {
      api.toast("金额最高200元");
      return false;
    }
    let options = {
      op:"reward",
      token:this.data.token,
      credit2:money,
      media_id:this.data.id
    };
    console.log(options)
    
    if (app.globalData.token) {
      // 全部提现确认提示
      wx.showModal({
        title: '提示',
        content: '您将打赏，' + money + ' 元给好友'+that.data.detail.nickName+'？',
        success: function (res) {
          if (res.confirm) {
            api.request(options, function (res) {
              if (res.code == 0) {
                api.toast(res.message);
                return false;
              }
              api.loadFail(res.message);
            });
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    } else {
      api.wxLogin(function () {
        that.payMoney();
      });
    }
  }
})
