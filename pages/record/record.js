//index.js
//获取应用实例
const app = getApp()
const util = require("../../utils/util.js");
const api = require("../../utils/api.js");
Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    register: false,
    page:1,
    logo:"",
    name:"",
    tel:"",
    hasGet:false,
    userData:{
      total_credit2:0,
      money:300,
      list: [],
      is_register:0,
      show_redbag:0      
    },
    redBag:0  
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onShow:function(){
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true,
        logo:app.globalData.site.logo
      })
      this.getUserData();
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true,
          logo: app.globalData.site.logo
        })
        this.getUserData();
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true,
            logo: app.globalData.site.logo
          })
          this.getUserData();
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
  // 显示注册弹窗
  getCash:function(){
    if (this.data.userData.is_register == 0){
      if (this.data.register) {
        this.setData({
          register: false
        });
      } else {
        this.setData({
          register: true
        });
      }
    }else{
      wx.navigateTo({
        url: '../tixian/tixian',
      })
    }
  },
  // 设置用户名
  setName:function(e){
    this.setData({
      name:e.detail.value
    });
  },
  // 设置密码
  setTel: function (e) {
    this.setData({
      tel: e.detail.value
    });
  },
  // 注册账号
  toRegister: function () {
    let that = this;
    if (!util.trimBlank(this.data.name)) {
      api.loadFail("姓名不能为空！");
      return false;
    }
    if (!util.phone(this.data.tel)) {
      api.loadFail("手机号格式有误！");
      return false;
    }
    let options = {
      op: "member/register",
      token:app.globalData.token,
      realname:this.data.name,
      mobile:this.data.tel
    };
    if (app.globalData.token) {
      api.request(options, function (res) {
        console.log(res);
        if (res.code == 0) {
          api.toast(res.message);
          that.setData({
            register: false
          });
          wx.navigateTo({
            url: '../tixian/tixian',
          })
          return false;
        }
        api.loadFail(res.message);
      });
    } else {
      api.wxLogin(function () {
        that.toRegister();
      });
    }
   
  },
  // 获取个人中心数据
  getUserData: function(){
    let that = this;
    let options = {
      op:"reward/receive",
      token:app.globalData.token,
      page: that.data.page
    };
    console.log(app.globalData.token)
    if (app.globalData.token){
      api.request(options, function (res) {
        that.setData({
          userData: res.data
        });
      });
    }else{
      api.wxLogin(function(){
        that.getUserData();
      });
    }
  },
  // 请求上一页数据
  getUpData: function(type){
    let that = this;
    let page = that.data.page;
    console.log(that.data.page);
    if(page <= 1){
      api.loadFail("已是第一页");
      return false;
    }
    page --;
    let options = {
      op: "reward/receive",
      token: app.globalData.token,
      page: page
    };
    if (app.globalData.token) {
      api.request(options, function (res) {
        if (res.code == 0) {
          that.setData({
            page: page,
            userData: res.data
          });
          return false;
        }
        api.loadFail(res.message);
      });
    } else {
      api.wxLogin(function () {
        that.getUpData();
      });
    }
    
  },
  // 获取下一页数据
  getDownData: function (type) {
    let that = this;
    let page = that.data.page;
    console.log(that.data.page);
    page ++;
    let options = {
      op: "reward/receive",
      token: app.globalData.token,
      page:page
    };
    if (app.globalData.token) {
      api.request(options, function (res) {
        if (res.code == 0) {
          if(res.data.list.length <= 0){
            api.loadFail("没有更多了");
          }else{
            that.setData({
              page: page,
              userData: res.data
            });
          }
          return false;
        }
        api.loadFail(res.message);
      });
    } else {
      api.wxLogin(function () {
        that.getDownData();
      });
    }
  },
  // 隐藏提示框
  hideTip: function () {
    this.setData({
      userData: {
        show_redbag:0
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
  },
  // 拆红包
  getBag: function(){
    let that = this;
    let options = {
      op: "rebate",
      token: app.globalData.token
    };
    if (app.globalData.token) {
      api.request(options, function (res) {
        if (res.code == 0) {
          that.setData({
            hasGet:true,
            redBag:res.data
          });
          // 获得红包提示
          wx.showModal({
            title: '提示',
            showCancel:false,
            content: '恭喜您获得'+res.data+'元红包，已自动添加进您的账户余额',
            success: function (res) {
              console.log("成功领取红包！");
            }
          })
          return false;
        }
        api.loadFail(res.message);
      });
    } else {
      api.wxLogin(function () {
        that.getBag();
      });
    }
  }
})
