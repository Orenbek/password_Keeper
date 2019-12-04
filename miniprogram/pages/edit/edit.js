// pages/form/form.js
const {
  emailValidate
} = require('../../utils/utils.js')
const {
  Decrypt ,
  Encrypt
} = require('../../utils/crypto.js')
const generatePassword = require("../../utils/passwordGenerator.js");
import {
  promisifyAll,
  promisify
} from 'miniprogram-api-promise';
const wxp = {}
// promisify all wx's api
promisifyAll(wx, wxp)

const UPPERCASE_RE = 'A-Z';
const LOWERCASE_RE = 'a-z';
const NUMBER_RE = '0-9';
const SPECIAL_CHAR_RE = '\\!\\#\\$\\%\\&\\*\\,\\-\\.\\?\\@\\_\\~';
const uppercaseMinCount = 3;
const lowercaseMinCount = 3;
const numberMinCount = 2;
const specialMaxCount = 2;

const app = getApp();

Page({
  data: {
    errors: '',
    formData: {},
    rules: [{
      name: 'main',
      rules: [{
        required: true,
        message: '密码描述必填'
      }, {
        maxlength: 18,
        message: '密码描述最长长度为18'
      }],
    }, {
      name: 'username',
      rules: [{
        required: false,
      }, {
        maxlength: 18,
        message: '用户名最长长度为18'
      }],
    }, {
      name: 'password',
      rules: [{
        required: true,
        message: '密码必填'
      }, {
        maxlength: 18,
        message: '密码最长长度为18'
      },{
        minlength: 4,
        message: '密码最小长度为4'
      }],
    }, {
      name: 'email',
      rules: [{
        required: false,
      }, {
        maxlength: 18,
        message: '邮箱最长长度为18'
      }, {
        email: true,
        validator: emailValidate,
        message: '请输入有效的邮箱地址'
      }],
      // validator 这里只能引入一个外部函数 this在这里没有定义？ 先不管了。
    }, {
      name: 'desc',
      rules: [{
        required: false,
      }, {
        maxlength: 100,
        message: '备注最长长度为100'
      }],
    }],
    descLength: 0,
    id: 0,
    newRecord: true,
    PWLen: 6,
    PWtype: {
      UPPERCASE: false,
      LOWERCASE: false,
      NUMBER: true,
      SPECIAL_CHAR: false
    },
    checkboxItems: [
      { name: '大写字母', value: 'UPPERCASE', id: 0 },
      { name: '小写字母', value: 'LOWERCASE', id: 1 },
      { name: '数字', value: 'NUMBER',checked: true, id: 2 },
      { name: '符号', value: 'SPECIAL_CHAR', id: 3 },
    ],
    generatedPassword: '',
  },

  onLoad(options) {
    if (options.item) {
      let item = JSON.parse(options.item);
      this.setData({
        formData: item.detail,
        newRecord: false,
        id: item.id
      })
    }
    this.data._id = app.globalData._id;
  },

  async submitForm() {
    this.selectComponent('#form').validate(async (valid, errors) => {
      console.log('valid', valid, errors)
      if (!valid) {
        let err = '';
        for (let value of Object.values(errors)) {
          err += value['message'] + '\n'
        }
        this.setData({
          errors: err
        })
      } else {
        await this.uploadData(this.data.formData)
      }
    })
  },

  async uploadData(data) {
    let errors = ''
    try {
      if (this.data.newRecord) {
        let res = await wx.cloud.callFunction({
          name: 'adcs',
          data: {
            _id: this.data._id,
            type: 'add',
            param: {
                id: this.data.id,
                main: data.main,
                detail: {
                  desc: data.desc,
                  email: data.email,
                  main: data.main,
                  username: data.username,
                  password: Encrypt(data.password)
                }
            }
          }
        })
        if (!res.result.errCode) {
          wx.showToast({
            title: `新增账号密码成功！`,
            duration: 2000
          })
        } else {
          errors = res.result.errMsg;
        }
      } else {
        let res = await wx.cloud.callFunction({
          name: 'adcs',
          data: {
            _id: this.data._id,
            type: 'change',
            param: {
                id: this.data.id,
                main: data.main,
                detail: {
                  desc: data.desc,
                  email: data.email,
                  main: data.main,
                  username: data.username,
                  password: Encrypt(data.password)
                }
            }
          }
        })
        if (!res.result.errCode) {
          wx.showToast({
            title: `账号信息修改成功！`,
            duration: 2000
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
        errors
      })
    }
  },

  formInputChange(e) {
    const {
      field
    } = e.currentTarget.dataset
    if (field !== 'desc') {
      this.setData({
        [`formData.${field}`]: e.detail.value
      })
    } else {
      this.setData({
        [`formData.${field}`]: e.detail.value,
        descLength: e.detail.value.length
      })
    }
  },

  isStrongEnough(password) {
    const {UPPERCASE,LOWERCASE,NUMBER,SPECIAL_CHAR} = this.data.PWtype;
    if (UPPERCASE) {
      const uc = password.match(new RegExp(`([${UPPERCASE_RE}])`, 'g'));
      if (!uc || uc.length < uppercaseMinCount) {
        return false;
      }
    }
    if (LOWERCASE) {
      const lc = password.match(new RegExp(`([${LOWERCASE_RE}])`, 'g'));
      if (!lc || lc.length < lowercaseMinCount) {
        return false;
      }
    }
    if (NUMBER) {
      const n = password.match(new RegExp(`([${NUMBER_RE}])`, 'g'));
      if (!n || n.length < numberMinCount) {
        return false;
      }
    }
    if (SPECIAL_CHAR) {
      const sc = password.match(new RegExp(`([${SPECIAL_CHAR_RE}])`, 'g'));
      if (!sc || sc.length > specialMaxCount) {
        return false;
      }
    }
    return true;
  },

  customPassword() {
    let password = '';
    const {UPPERCASE,LOWERCASE,NUMBER,SPECIAL_CHAR} = this.data.PWtype;
    let regStr = '';
    regStr += UPPERCASE ? UPPERCASE_RE : '';
    regStr += LOWERCASE ? LOWERCASE_RE : '';
    regStr += NUMBER ? NUMBER_RE : '';
    regStr += SPECIAL_CHAR ? SPECIAL_CHAR_RE : '';
    const reg = new RegExp(`([${regStr}])`, 'g')
    while (!this.isStrongEnough(password)) {
      password = generatePassword(this.data.PWLen, false, reg);
    }
    this.setData({
      generatedPassword: password,
    })
  },

  checkboxChange: function (event) {
    if (event.detail.value.length === 0) {
      this.setData({
        checkboxItems: this.data.checkboxItems
      })
      return;
    }
    this.data.checkboxItems = this.data.checkboxItems.map(item => {
      item.checked = false;
      return item;
    })
    let PWtype = {
      UPPERCASE: false,
      LOWERCASE: false,
      NUMBER: false,
      SPECIAL_CHAR: false
    }
    for (let id of event.detail.value.values()) {
      this.data.checkboxItems[id].checked = true;
      PWtype[this.data.checkboxItems[id].value] = true;
    }
    this.setData({
      checkboxItems: this.data.checkboxItems,
      PWtype
    })
  },

  slideChange(e){
    this.setData({
      PWLen: e.detail.value
    })
  },

  onCopy() {
    wxp.setClipboardData({
      data: this.data.generatedPassword
    }).then(() => {
      wx.showToast({
        title: '复制成功',
        icon: 'none'
      })
    });
  },



})
