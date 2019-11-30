const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const validUserOpenId = 'ozhLN4vRc529URuy7fZ_N0lT239Y'

const db = cloud.database();
const PWs = db.collection('PWs');
const _ = db.command;
const $ = db.command.aggregate;


exports.main = async (event, context) => {
  // 我的openid "ozhLN4vRc529URuy7fZ_N0lT239Y" 同一个用户同一个小程序 openid是唯一的

  if (!validateUser(event.userInfo.openId)) {
    return {
      errCode: 1000,
      errMsg: '您被限制使用此小程序！'
    }
  }
  let res;
  switch (event.type) {
    case 'add':
      res = add(event)
      break;
    case 'del':
      res = del(event)
      break;
    case 'change':
      res = await change(event)
      break;
    case 'search':
      res = await search(event)
      console.log(res, 'result is above ')
      break;
    default:
      console.log('Sorry, we are out of case.');
      res = {
        ok: false,
        errMsg: 'type 参数不存在',
        errCode: 2000
      }
  }
  return res;
}

function validateUser(openId) {
  return openId && openId === validUserOpenId ? true : false;
}

function validateData(data) {
  let errMsg = []
  if (!data['main']) {
    errMsg.push('密码描述不能为空')
  }
  if(!data.detail['main']) {
    errMsg.push('密码描述不能为空')
  }
  if (!data.detail['password']) {
    errMsg.push('密码不能为空')
  }
  return errMsg.length === 0 ? {
    ok: true,
    errMsg
  } : {
    ok: false,
    errMsg
  };
}

async function add(data) {
  const validate = validateData(data.param);
  let res;
  if (validate.ok && data._id) {
    try {
      const result = await PWs.doc(data._id).get();
      if (result.data.passWords && result.data.passWords.length !== 0) {
        const lastId = result.data.passWords[result.data.passWords.length-1].id;
        data.param.id = lastId + 1;
      } else {
        data.param.id = 1;
      }
      res = await PWs.doc(data._id).update({
        data: {
          passWords: _.push(data.param)
        }
      });
      res.ok = true;
      res.errCode = 0;
    } catch (e) {
      console.error('add 出现错误！', e)
      res = {
        ok: false,
        errMsg: "数据新增失败!",
        errCode: 3000
      }
    }
  } else if(validate.ok && data._id === 'empty') {
    try {
      data.param.id = 1;
      res = await PWs.add({
        data: {
          passWords: data.param
        }
      });
      res.ok = true;
      res.errCode = 0;
    } catch (e) {
      console.error('add 出现错误！', e)
      res = {
        ok: false,
        errMsg: "数据新增失败!",
        errCode: 3000
      }
    }
  } else {
    if (!data._id) {
      validate.errMsg.push('_id不能为空')
    }
    res = {
      ok: false,
      errMsg: validate.errMsg,
      errCode: 2000
    }
  }
  return res;
}

async function del(data) {
  let res;
  if (data.id && data._id) {
    try {
      let result = await PWs.doc(data._id).get();
      if (result.data.passWords.length > 0) {
        result.data.passWords = result.data.passWords.filter(item => item.id !== data.id);
        delete result.data._id;
        res = await PWs.doc(data._id).set({
          data: result.data
        })
        res.ok = true;
      }
    } catch (e) {
      console.error('delete 出现错误！', e)
      res = {
        ok: false,
        errMsg: "数据删除失败!",
        errCode: 3000
      }
    }
  } else {
    res = {
      ok: false,
      errMsg: '参数错误 _id 或 id 不存在',
      errCode: 2000
    }
  }
  return res;
}

async function change(data) {
  const validate = validateData(data.param);
  let res;
  if (validate.ok && data._id && data.param.id) {
    try {
      res = await PWs.where(_.and([{
          _id: data._id
        },
        {
          "passWords.id": data.param.id
        }
      ])).update({
        data: {
          $set: {
            "passWords.$": data.param
          }
        }
      });
      res.ok = true;
      res.errCode = 0;
    } catch (e) {
      console.error('change 出现错误！', e);
      res = {
        ok: false,
        errMsg: "数据修改失败!",
        errCode: 3000
      }
    }
  } else {
    if (!data._id || !data.param.id) {
      validate.errMsg.push(' _id 和 id 不能为空')
    }
    res = {
      ok: false,
      errMsg: validate.errMsg,
      errCode: 2000
    }
  }
  return res;
}

async function search(data) {
  let res;
  if (data._id) {
    try {
      res = await PWs.doc(data._id).get();
      let resArr = [];
      if (data.keyWord) {
        const passWords = res.data.passWords;
        const reg =  new RegExp(data.keyWord);
        for (let item of passWords.values()) {
          if (reg.test(item)) {
            resArr.push(item);
          }
        }
      }
      res = {
        data: data.keyWord ? resArr : res.data,
        ok: true,
        errCode: 0
      }
    } catch (e) {
      console.error('search 出现错误！', e)
      res = {
        ok: false,
        errMsg: '数据查找失败！',
        errCode: 3000
      }
    }
  } else {
    res = {
      ok: false,
      errMsg: '_id 参数不存在',
      errCode: 2000
    }
  }
  return res;
}

