// pages/login/login.js
const app = getApp()
import {
  promisifyAll,
  promisify
} from 'miniprogram-api-promise';
const {
  Decrypt ,
  Encrypt
} = require('../../utils/crypto.js')

const wxp = {}
// promisify all wx's api
promisifyAll(wx, wxp)

Page({

  data: {
    passWord: '',
    passWord2: '',
    newUser: false,
    errors: '',
    _id: '',
  },
  onLoad() {
    app.globalData.initPromise.then(() => {
      this.setData({
        newUser: app.globalData.newUser,
        _id: app.globalData._id
      });
    })
  },

  bindInput(e) {
    const {
      field
    } = e.currentTarget.dataset
    this.setData({
      [`${field}`]: e.detail.value
    })
  },

  async submit() {
    let errors = '';
    try {
      if (this.data.newUser) {
        if (this.data.passWord.length < 6 || this.data.passWord2.length < 6) {
          errors = '密码长度至少6位！'
        } else if (this.data.passWord !== this.data.passWord2) {
          errors = '两次输入密码不一致！'
        } else {
          let res = await wx.cloud.callFunction({
            name: 'login',
            data: {
              newUser: this.data.newUser,
              mainPassWord: Encrypt(this.data.passWord)
            }
          });
          if (!res.result.errCode) {
            app.globalData._id = res.result._id;
            app.globalData.newUser = res.result.newUser;
            wxp.redirectTo({
              url: '../index/index'
            })
          } else {
            errors = res.result.errMsg;
          }
        }
      } else {
        let res = await wx.cloud.callFunction({
          name: 'login',
          data: {
            _id: this.data._id,
            mainPassWord: Encrypt(this.data.passWord)
          }
        });
        if (!res.result.errCode) {
          app.globalData.newUser = res.result.newUser;
          wxp.redirectTo({
            url: '../index/index'
          })
        } else {
          errors = res.result.errMsg;
        }
      }
    } catch (err) {
      errors = err;
    }
    if (errors) {
      this.setData({
        errors,
        passWord: '',
        passWord2: ''
      })
    }
  }
})
