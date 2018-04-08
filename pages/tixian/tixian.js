// pages/index/page4.js
const app = getApp();
const api = require("../../utils/api.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tip:true,
    money:"",
    yuEr:{},
    allMoney:0.00
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getYuEr();
  },
  
  // 设置提现余额
  setMoney: function(e){
    this.setData({
      money:e.detail.value
    });
  },
  // 获取余额信息
  getYuEr: function(){
    let that = this;
    console.log(app.globalData.token)
    
    let options = {
      op: "member",
      token:app.globalData.token
    };
    if(app.globalData.token){
      api.request(options, function (res) {
        console.log(res);
        if (res.code == 0) {
          res.data.member.credit2 = parseFloat(res.data.member.credit2);
          res.data.member.credit3 = parseFloat(res.data.member.credit3);
          that.setData({
            yuEr:res.data,
          });
        }
      });
    }else{
      api.wxLogin(function(){
        that.getYuEr();
      });
    }
  },
  
  // 余额提现
  tiXian: function(){
    let that = this;
    console.log(that)
    console.log(this)
    let options = {
      op: "member/withdraw",
      type: 0,      
      token: app.globalData.token,
      credit2: that.data.money
    };
    if (app.globalData.token){
      if (parseInt(that.data.yuEr.member.credit2) <= 0) {
        wx.showModal({
          title: '提示',
          content: '您当前没有可提现金额！',
          showCancel: false
        })
        return false;
      }
      wx.showModal({
        title: '提示',
        content: '您将从账户余额提现'+that.data.money+'元',
        success: function (res) {
          if (res.confirm) {
            api.request(options, function (res) {
              console.log(res);
              if (res.code == 0) {
                api.toast(res.message);
                let restMoney = parseFloat(that.data.yuEr.member.credit2) - parseFloat(that.data.money);
                let allMoney = restMoney + that.data.yuEr.member.credit3;
                console.log(restMoney);
                console.log(that.data.yuEr.member.credit3);                
                console.log(allMoney);
                that.setData({
                  money: ""
                });
                that.getYuEr();
                return false;
              }
              api.loadFail(res.message);
            });
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }else{
      api.wxLogin(function(){
        that.tiXian();
      });
    }
  },
  // 全部提现
  allTiXian:function(){
    let that = this;
    let options = {
      op: "member/withdraw",
      type:1,
      token: app.globalData.token,
      credit2: that.data.yuEr.member.credit2
    };
    if (app.globalData.token) {
      if (parseInt(that.data.yuEr.member.credit2) <= 0) {
        wx.showModal({
          title: '提示',
          content: '您当前没有可提现金额！',
          showCancel: false
        })
        return false;
      }
      // 全部提现确认提示
      wx.showModal({
        title: '提示',
        content: '您当前可提现余额为' + that.data.yuEr.member.credit2+' 元，确定全部提现吗？',
        success: function (res) {
          if (res.confirm) {
            api.request(options, function (res) {
              console.log(res);
              if (res.code == 0) {
                api.toast(res.message);
                let restMoney = that.data.yuEr.member.credit2 - that.data.money;
                let allMoney = that.data.yuEr.member.credit3 - that.data.money;
                that.setData({
                  money:""
                });
                that.getYuEr();                
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
        that.tiXian();
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