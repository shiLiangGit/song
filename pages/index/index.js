//index.js
//获取应用实例
const app = getApp();
const api = require("../../utils/api.js");
let time = "";
let innerAudioContext = "";

Page({
  data: {
    userInfo: {},
    openid:null,
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    audioPath:"",
    videoPath:"",
    audioTime:180,
    duration:3*60*1000,
    videoTime:30,
    audioStatus:true,
    videoStatus: true,
    isPlay:true,
    isLuZhi:false,
    picture:"",
    filePath:"",
    songName:"",
    thumbVideo:"",
    logo:"",
    round:false,
    ctx: {},
    recorderManager: {},
    type:-1,
    thumb:"",
    fileUrl:"",
    token:""
  },

  onLoad: function () {
    console.log(app.globalData.userInfo)
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
      this.wxLogin();
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        this.wxLogin();
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
          this.wxLogin();
        }
      })
    }
    this.setData({
      ctx: wx.createCameraContext("myVideo"),
      recorderManager:wx.getRecorderManager()
    })
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  // 微信登录
  wxLogin: function(){
    let that = this;
    let options = {
      op:"auth/login",
      openid:app.globalData.openid,
      userInfo: JSON.stringify(that.data.userInfo)
    }
    api.request(options,function(res){
      if(res.code == 0){
        app.globalData.token = res.data.token;
        app.globalData.site = res.data.site;
        that.setData({
          logo: res.data.site.logo,
          token:res.data.token
        });
        console.log(that.data)
        return false;
      }
      api.loadFail(res.message);
    });
  },
  // 设置歌曲名称
  setSong: function(e){
    this.data.songName = e.detail.value;
  },
  // 录音功能权限检测
  startAudio: function(){
    let that = this;
    clearInterval(time);
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.record']) {
          that.audioRecord(that);
        }else{
          wx.authorize({
            scope: 'scope.record',
            success() {
              // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
              that.audioRecord(that);
            },
            fail() {
              // 拒绝授权，弹出提示窗口，手动授权
              wx.showModal({
                title: '提示',
                content: '小程序想要使用录音功能，点击确认前往设置？',
                showCancel: false,
                success: function (res) {
                  wx.openSetting({
                    success: (res) => {
                      that.audioRecord(that);
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
  // 录音开始和停止
  audioRecord:function(that){
    const options = {
      duration: that.data.duration,
      sampleRate: 44100,
      numberOfChannels: 1,
      encodeBitRate: 192000,
      format: 'aac',
      frameSize: 50
    }
    console.log(options)
    let audioTime = that.data.audioTime;
    // 开始录音
    if (that.data.audioStatus) {
      that.data.recorderManager.start(options);
      that.data.recorderManager.onStart(() => {
        console.log('recorder start');
        that.setData({
          audioStatus: false,
          isLuZhi: false,
          videoPath: "",
          videoTime: 30,
          type:2,
          videoStatus: true
        });
        time = setInterval(function () {
          audioTime--;
          if (audioTime <= 1) {
            clearInterval(time);
            that.data.recorderManager.onStop((res) => {
              console.log('recorder stop', res)
              const { tempFilePath } = res;
              that.uploadFile(tempFilePathres,"file");
              that.setData({
                audioPath: tempFilePath,
                filePath: tempFilePath,
                audioTime: 180,
                audioStatus: true,
                type: 0
              });
              console.log(that.data.audioTime)
            })
          }
          that.setData({
            audioTime: audioTime
          });
        }, 1000);
        that.data.ctx.stopRecord();
      })
    } else {
      // 停止录音
      that.data.recorderManager.stop();
      console.log(time)
      that.data.recorderManager.onStop((res) => {
        console.log('recorder stop', res)
        const { tempFilePath } = res;
        that.uploadFile(tempFilePath,"file");
        that.setData({
          audioPath: tempFilePath,
          filePath: tempFilePath,
          audioTime: 180,
          audioStatus: true,
          type:0
        });
        console.log(that.data.audioTime)

      })
    }
    //错误回调
    that.data.recorderManager.onError((res) => {
      console.log(res);
    })
  },
  // 试听按钮
  playAudio:function(){
    if (innerAudioContext == ""){
      innerAudioContext = wx.createInnerAudioContext();
    }
    innerAudioContext.src = this.data.audioPath;
    if(this.data.audioPath != ""){
      console.log(this.data.isPlay);
      // 播放录音
      if (!this.data.audioStatus) {
        api.loadFail("请先停止录音操作");
        return false;
      }
      if(this.data.isPlay){
          this.setData({
            isPlay: false
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
              isPlay: true,
              round: false
            });
          })
      }else{
        // 停止播放录音
        innerAudioContext.stop();
        console.log(innerAudioContext)
        innerAudioContext.onStop((res) => {
          console.log(111111)
          
          this.setData({
            round: false,
            isPlay: true
          });
        });
      }
      innerAudioContext.onError((res) => {
        console.log(res.errMsg)
        console.log(res.errCode)
      })
    }else{
      if (this.data.audioStatus) {
        api.loadFail("请您先去录音"); 
      }else{
        api.loadFail("请先停止录音操作");
      }
    }
  },
  // 录音文件封面
  uploadImg: function(){
    var that = this;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        console.log(res)
        var tempFilePaths = res.tempFilePaths[0];
        console.log(tempFilePaths)
        that.uploadFile(tempFilePaths,"img");
        that.setData({
          picture: tempFilePaths,
        });
        
      }
    })
  },
  // 视频录像
  startVideo: function (){
    let that = this;
    clearInterval(time);
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.camera']) {
          that.videoRecord(that);
        } else {
          wx.authorize({
            scope: 'scope.camera',
            success() {
              // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
              that.videoRecord(that);
            },
            fail() {
              // 拒绝授权，弹出提示窗口，手动授权
              wx.showModal({
                title: '提示',
                content: '小程序想要使用录像功能，点击确认前往设置？',
                showCancel: false,
                success: function (res) {
                  wx.openSetting({
                    success: (res) => {
                      that.videoRecord(that);
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
  // 录像开始和停止
  videoRecord: function(){
    let that = this;
    that.setData({
      isLuZhi:true
    });
    if (that.data.videoStatus) {
      console.log(11111)
      that.data.ctx.startRecord({
        success: (res) => {
          that.setData({
            videoStatus: false,
            isLuZhi: true,
            audioPath: "",
            picture: "",
            songName: "",
            type: 3,            
            audioStatus: true
          })
          console.log(5555)
          that.data.recorderManager.stop();
          setTimeout(function () {
            let videoTime = that.data.videoTime;
            time = setInterval(function () {
              videoTime--;
              if (videoTime <= 0) {
                clearInterval(time);
              }
              that.setData({
                videoTime: videoTime
              });
            }, 1000);
          }, 1000);
          that.setData({
            audioTime: 180
          });
          console.log(that.data.videoTime);
        },
        fail: () => {
          api.loadFail("调用录像失败！");
        },
        timeoutCallback: (res) => {
          console.log(res)
          that.uploadFile(res.tempVideoPath,"file");
          that.uploadFile(res.tempThumbPath,"img");
          that.setData({
            videoPath: res.tempVideoPath,
            thumbVideo: res.tempThumbPath,
            audioPath: "0",
            videoTime: 30,
            videoStatus: true,
            isLuZhi: false,
            type: 1,
            filePath: res.tempVideoPath,
          })
          clearInterval(time);
        }
      })
    } else {
      that.data.ctx.stopRecord({
        success: (res) => {
          that.uploadFile(res.tempVideoPath,"file");
          that.uploadFile(res.tempThumbPath,"img");
          that.setData({
            videoPath: res.tempVideoPath,
            thumbVideo: res.tempThumbPath,
            videoTime: 30,
            videoStatus: true,
            isLuZhi: false,
            type: 1,
            filePath: res.tempVideoPath,
          })
          console.log(that.data)
        },
        fail: (res) => {
          console.log(res)
          // api.loadFail(res);
        }
      })
    }
  },
  // 生成唱唱口令
  createSong:function(){
    // wx.navigateTo({
    //   url: '../share/share?id=5',
    // })
    let that = this;
    let options = {
      op:"media/push",
      token: app.globalData.token,
      type:this.data.type
    };
    // type含义： -1没有录音或录像; 0 录音完成; 1 录像完成; 2 未停止录音; 3 未停止录像;
    if (this.data.type == -1){
      api.loadFail("请先录音或录像");
      return false;
    }
    if (this.data.type == 2) {
      api.loadFail("请先停止录音");
      return false;
    }
    if (this.data.type == 3) {
      api.loadFail("请先停止录像");
      return false;
    }
    if (this.data.type == 0){
      if (this.data.picture == "") {
        api.loadFail("请上传录音封面");
        return false;
      }
      if (this.data.songName == "") {
        api.loadFail("请填写录音名称");
        return false;
      }
      options.title = this.data.songName;
      options.thumb = this.data.thumb;
      options.url = this.data.fileUrl;
    }
    if(this.data.type == 1){
      options.thumb = this.data.thumb;
      options.url = this.data.fileUrl;
    }
    console.log(options)
    if(app.globalData.token){
      api.request(options, function (res) {
        if (res.code == 0) {
          api.toast(res.message);
          that.setData({
            type: -1,
            videoPath: "",
            isLuZhi: false,
          });
          wx.navigateTo({
            url: '../share/share?id=' + res.data.id,
          })
          return false;
        } else if (res.code == -1) {
          api.wxLogin(function () {
            that.createSong();
          });
        } else {
          api.loadFail(res.message);
        }
      });
    }else{
      api.wxLogin(function () {
        that.createSong();
      });
    }
  },
  // 文件上传接口封装
  uploadFile: function (filePath,type) {
    let that = this;
    let newPath = filePath;
    let newType = type;
    console.log(app.globalData.url)
    if(app.globalData.token){
      const uploadFile =  wx.uploadFile({
        url: app.globalData.url+"upload/file", //仅为示例，非真实的接口地址
        filePath: newPath,
        name: 'file',
        formData: {
          token: app.globalData.token
        },
        success: function (res) {
          let resData = JSON.parse(res.data);
          if (resData.code == 0){
            wx.hideLoading();
            let path = resData.data.url;            
            if (newType == "img") {
              that.setData({
                thumb: path
              });
            } else if (newType == "file") {
              that.setData({
                fileUrl: path
              });
            }
            console.log(path);
          } else if (resData.code == -1){
            api.wxLogin(function () {
              that.uploadFile(newPath,newType);
            });
          }else{
            api.loadFail(resData.message);
          }
          
        }
      });
      uploadFile.onProgressUpdate((res) => {
        let percent = ((res.totalBytesSent / res.totalBytesExpectedToSend)*100).toFixed(1) + '%';
        wx.showLoading({
          title: '已上传' + percent,
          mask:true
        })
      })
    }else{
      api.wxLogin(function(){
        that.uploadFile(newPath, newType);
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
