// pages/form/form.js
const { emailValidate } = require('../../utils/utils.js')

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
      }],
    }, {
      name: 'email',
      rules: [{
        required: false,
      }, {
        maxlength: 18,
        message: '邮箱最长长度为18'
      },{ email: true, validator: emailValidate, message: '请输入有效的邮箱地址' }],
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
    descLength: 0
  },


  submitForm() {
    console.log('from data', this.data.formData);
    this.selectComponent('#form').validate((valid, errors) => {
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
        wx.showToast({
          title: '校验通过'
        })
      }
    })
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

})
