// 云函数模板
// 部署：在 cloud-functions/login 文件夹右击选择 “上传并部署”

const cloud = require('wx-server-sdk')

const validUserOpenId = 'orB-25N7nDKY75KYk8UnOqVFd0GQ'

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database();
const PWs = db.collection('PWs');
const _ = db.command;
const $ = db.command.aggregate;
/**
 * 这个示例将经自动鉴权过的小程序用户 openid 返回给小程序端
 *
 * event 参数包含小程序端调用传入的 data
 *
 */
exports.main = async (event, context) => {

  // 我的openid "ozhLN4vRc529URuy7fZ_N0lT239Y" 同一个用户同一个小程序 openid是唯一的

  // 获取 WX Context (微信调用上下文)，包括 OPENID、APPID、及 UNIONID（需满足 UNIONID 获取条件）等信息
  if (!validate(event.userInfo.openId)) {
    return {
      errCode: 1000,
      ok: false,
      errMsg: '您被限制使用此小程序！'
    }
  }
  let res;
  if (event.mainPassWord) {
    if (event.newUser) {
      res = await PWs.add({
        data: {
          _openid: event.userInfo.openId,
          mainPassWord: event.mainPassWord,
          passWords: []
        }
      });
      res.ok = true;
      res.errCode = 0;
    } else {
      let result = await PWs.doc(event._id).get();
      if (result.data.mainPassWord === event.mainPassWord) {
        res = {
          ok: true,
          errCode: 0,
        }
      } else {
        res = {
          ok: false,
          errCode: 5000,
          errMsg: '主密码错误！'
        }
      }
    }
  } else {
    res = {
      ok: false,
      errCode: 5000,
      errMsg: '没有找到主密码！'
    }
  }
  return res;
}

function validate(openId) {
  return openId && openId === validUserOpenId ? true : false;
}
