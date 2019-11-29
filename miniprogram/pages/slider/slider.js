import {
  promisifyAll,
  promisify
} from 'miniprogram-api-promise';
const wxp = {}
// promisify all wx's api
promisifyAll(wx, wxp)

Page({
  data: {
      list: [
          {
              id: 'form',
              main: '表单',
              open: false,
              pages: {main: '第一个', passWord: '123', email: '邮箱账号', desc: '备注详情'}
          },
          {
              id: 'widget',
              main: '基础组件',
              open: false,
              pages: {main: '第一个', userName: '第二个', passWord: '123', email: '邮箱账号', desc: '备注详情'}
          },
          {
              id: 'feedback',
              main: '操作反馈',
              open: false,
              pages: {main: '第一个', passWord: '123', email: '邮箱账号', desc: '备注详情'}
          },
          {
              id: 'nav',
              main: '导航相关',
              open: false,
              pages: {main: '第一个', userName: '第二个', passWord: '123', email: '邮箱账号', desc: '备注详情'}
          },
          {
              id: 'search',
              main: '搜索相关',
              open: false,
              pages: {main: '第一个', userName: '第二个', passWord: '123', email: '邮箱账号', desc: '备注详情'}
          },
          {
              id: 'search',
              main: '搜索相关',
              open: false,
              pages: {main: '第一个', userName: '第二个', passWord: '123', email: '邮箱账号', desc: '备注详情'}
          },
          {
              id: 'search',
              main: '搜索相关',
              open: false,
              pages: {main: '第一个', userName: '第二个', passWord: '123', email: '邮箱账号', desc: '备注详情'}
          }
      ],
      slideButtons: [{
        text: '编辑',
      }, {
        type: 'warn',
        text: '删除',
      }],
      hasMore: true,
      loadingList: false,
  },
  kindToggle: function (e) {
      const id = e.currentTarget.dataset.id
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
      wx.cloud.callFunction({
        // 云函数名称
        name: 'init',
        // 传给云函数的参数
        data: {
          type: 'change',
          data: {
            openId: 'ozhLN4vRc529URuy7fZ_N0lT239Y',
            id: 'oren'
          }
        },
      })
      .then(res => {
        console.log(res) // 3
      })
      .catch(console.error)
  },

  onCopy(e) {
    if (e.currentTarget.dataset.password) {
      wxp.setClipboardData({
        data: e.currentTarget.dataset.password
        // 注意 这里passWord会变成 全小写password
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

  slideButtonTap(e) {
    const id = e.currentTarget.dataset.id;
    const index = e.detail.index;
    if (index === 0) {
      wxp.navigateTo({url: `../edit/edit?id=${id}`});
    } else if (index === 1) {
      this.deleteRecord(id);
    }
  },

  deleteRecord(id) {
    wxp.showModal({
      title: '删除记录',
      content: '确定删除此密码记录？'
    }).then(res=> {
      if (res.confirm) {
        console.log('用户点击确定')
      } else if (res.cancel) {
        console.log('用户点击取消')
      }
    })
  }
});
