//index.js
import {
  promisifyAll,
  promisify
} from 'miniprogram-api-promise';
const wxp = {}
// promisify all wx's api
promisifyAll(wx, wxp)

const app = getApp()

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    showTopTips: false,
    slideButtons: [{
      text: '编辑',
    }, {
      type: 'warn',
      text: '删除',
    }],
    pwList: [{
      id: 0,
      main: '第一个',
      userName: 'google',
      passWord: '123',
      showDetail: false,
    }, {
      id: 1,
      main: '第二个',
      userName: 'baidu',
      passWord: '234',
      showDetail: false,
    }, {
      id: 2,
      main: '第三个',
      userName: 'bing',
      passWord: '345',
      showDetail: false,
    }, ]
  },

  onLoad() {
    if (!wx.cloud) {
      return
    }

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    });
  },

  onGetUserInfo(e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  onGetOpenid() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        wx.navigateTo({
          url: '../userConsole/userConsole',
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },

  // 上传图片
  doUpload() {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]

        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath

            wx.navigateTo({
              url: '../storageConsole/storageConsole'
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  },

  slideButtonTap(e) {
    console.log(e);
  },

  onclick() {
    console.log('onclick');
    wxp.setClipboardData({
      data: 'hhhhhhhhhhh'
    }).then(res => {
      console.log('1',res)
      return wxp.getClipboardData()
    }).then(res => {
      console.log('2',res)
      wx.showToast({
        title: '复制成功'
      })
    })
  },

})
