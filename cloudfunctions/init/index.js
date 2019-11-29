// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

const validUserOpenId = 'ozhLN4vRc529URuy7fZ_N0lT239Y'

const db = cloud.database();
const PWs = db.collection('PWs');
const _ = db.command;
const $ = db.command.aggregate;

// 云函数入口函数
exports.main = async (event, context) => {
  if (!validate(event.userInfo.openId)) {
    return {
      errCode: 1000,
      goodToGo: false,
      errMsg: '您被限制使用此小程序！'
    }
  }
  let res = {
    openId: event.userInfo.openId,
    ok: true,
    errCode: 0
  }
  const result = await PWs.where({
    _openid: event.userInfo.openId
  }).get();
  if (result.data[0]) {
    res._id = result.data[0]._id
  } else {
    res._id = 'empty'
  }
  return res;
}

function validate(openId) {
  return openId && openId === validUserOpenId ? true : false;
}
