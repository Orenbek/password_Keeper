//app.js
import { promisifyAll, promisify } from 'miniprogram-api-promise';
const wxp = {}
// promisify all wx's api
promisifyAll(wx, wxp)
const cloudEnvId = 'pwguard-env';

App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: cloudEnvId,
        traceUser: false,
      })
      this.globalData.initPromise = wx.cloud.callFunction({name: 'init'});
      this.globalData.initPromise.then(res => {
        if(!res.result.errCode) {
          this.globalData.newUser = res.result._id === 'empty' ? true : false;
          this.globalData._id = res.result._id;
        } else {
          wx.showToast({
            title: `程序初始化出错，errMsg: ${res.result.errMsg}`,
            icon: 'none',
            duration: 2000
          })
        }
      })
      .catch(err=>{
        wx.showToast({
          title: '程序初始化出错，请查看网络状况！',
          icon: 'none',
          duration: 2000
        })
      });
    }
  },
  globalData: {
    newUser: true,
  }
})
