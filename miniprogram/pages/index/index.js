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

const app = getApp()

Page({
  data: {
    list: [],
    totalList: [],
    slideButtons: [{
      text: '编辑',
    }, {
      type: 'warn',
      text: '删除',
    }],
    hasMore: true,
    loadingList: false,
    _id: '',
    errors: '',
    slice: 8
  },

  async onShow() {
    let errors = ''
    try {
      await app.globalData.initPromise;
      this.data._id = app.globalData._id;
      let res = await wx.cloud.callFunction({
        name: 'adcs',
        data: {
          _id: this.data._id,
          type: 'search'
        }
      })
      if (!res.result.errCode) {
        let totalList = res.result.data.passWords.map(item => {
          item.open = false;
          item.detail.password = Decrypt(item.detail.password);
          return item;
        });
        this.data.totalList = totalList;
        let list;
        let hasMore;
        if (totalList.length > this.data.slice) {
          list = totalList.slice(0,this.data.slice);
          hasMore = true;
        } else {
          list = totalList;
          hasMore = false;
        }
        this.setData({
          list,
          hasMore
        })
      } else {
        errors = res.result.errMsg;
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

  kindToggle: function (e) {
    const {
      id
    } = e.currentTarget.dataset.item
    const list = this.data.list;
    for (let i = 0, len = list.length; i < len; ++i) {
      if (list[i].id == id) {
        list[i].open = !list[i].open
      } else {
        list[i].open = false
      }
    }
    this.setData({
      list: list
    });
  },

  onCopy(e) {
    if (e.currentTarget.dataset.password) {
      wxp.setClipboardData({
        data: e.currentTarget.dataset.password
      }).then(() => {
        wx.showToast({
          title: '复制成功'
        })
      });
    } else {
      wx.showToast({
        title: '复制失败，密码不存在',
        icon: 'none',
        duration: 2000
      })
    }
  },

  async slideButtonTap(e) {
    let item = e.currentTarget.dataset.item;
    const index = e.detail.index;
    if (index === 0) {
      item = JSON.stringify(item);
      wxp.navigateTo({
        url: `../edit/edit?item=${item}`
      });
    } else if (index === 1) {
      await this.deleteRecord(item.id);
    }
  },

  async deleteRecord(id) {
    const result = await wxp.showModal({
      title: '删除记录',
      content: '确定删除此密码记录？'
    });
    if (result.confirm) {
      let errors = ''
      try {
        let res = await wx.cloud.callFunction({
          name: 'adcs',
          data: {
            _id: this.data._id,
            type: 'del',
            id: id
          }
        })
        if (!res.result.errCode) {
          let totalList = this.data.totalList.filter(item => {
            return item.id !== id
          });
          let list;
          let hasMore;
          if (totalList.length > this.data.list.length) {
            list = totalList.slice(0,this.data.list.length);
            hasMore = true;
          } else {
            list = totalList;
            hasMore = false;
          }
          this.data.totalList = totalList;
          this.setData({
            list,
            hasMore
          })
          wx.showToast({
            title: `账号信息删除成功！`,
            duration: 2000
          })
        } else {
          errors = res.result.errMsg;
        }
      } catch (err) {
        errors = err;
      }
      if (errors) {
        this.setData({
          errors
        })
      }
    }
  },

  addNew() {
    wxp.navigateTo({
      url: `../edit/edit`
    });
  },

  loadMore() {
    this.setData({
      loadingList: true
    });
    let hasMore;
    let curListSize = this.data.list.length;
    let list = this.data.list.concat(this.data.totalList.slice(curListSize, curListSize + this.data.slice));
    hasMore = list.length < this.data.totalList.length ? true : false;
    this.setData({
      list,
      hasMore,
      loadingList: false
    })
  }
});
