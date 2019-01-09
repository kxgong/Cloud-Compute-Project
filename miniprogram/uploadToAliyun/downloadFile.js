const env = require('config.js'); //配置文件，在这文件里配置你的OSS keyId和KeySecret,timeout:87600;

const base64 = require('base64.js');//Base64,hmac,sha1,crypto相关算法
require('hmac.js');
require('sha1.js');
const Crypto = require('crypto.js');

/*
 *上传文件到阿里云oss
 *@param - filePath :图片的本地资源路径
 *@param - dir:表示要传到哪个目录下
 *@param - successc:成功回调
 *@param - failc:失败回调
 */
const downloadImage = function (u, successc, failc) {
  // if (!filePath || filePath.length < 9) {
  //   wx.showModal({
  //     title: '图片错误',
  //     content: '请重试',
  //     showCancel: false,
  //   })
  //   return;
  // }

  console.log('接收图片.....');
  //图片名字 可以自行定义，     这里是采用当前的时间戳 + 150内的随机数来给图片命名的
  const aliyunFileKey = "/images/images/2019-01-04/154658401975862.png";

  const aliyunServerURL = env.uploadImageUrl;
  //OSS地址，需要https
  console.log(env.uploadImageUrl);
  const accessid = env.OSSAccessKeyId;
  const policyBase64 = getPolicyBase64();
  const signature = getSignature(policyBase64);//获取签名

  wx.downloadFile({
     url:u,//开发者服务器 url
    // filePath: filePath,//要上传文件资源的路径
    // name: 'file',//必须填file
    
    header: {
      'Host':aliyunServerURL,
      // 'policy': policyBase64,
      // 'OSSAccessKeyId': accessid,
      // 'key': aliyunFileKey,
      'Authorization': "OSS " + env.OSSAccessKeyId + ":" +signature,
       'signature': signature,

    },
    success: function (res) {
      console.log("OSS " + env.OSSAccessKeyId + ":" + signature)
      console.log(res)
    },
    fail: function (err) {
      err.wxaddinfo = aliyunServerURL;
      failc(err);
    },
  })
}

const getPolicyBase64 = function () {
  let date = new Date();
  date.setHours(date.getHours() + env.timeout);
  let srcT = date.toISOString();
  const policyText = {
    "expiration": srcT, //设置该Policy的失效时间，超过这个失效时间之后，就没有办法通过这个policy上传文件了 
    "conditions": [
      ["content-length-range", 0, 5 * 1024 * 1024] // 设置上传文件的大小限制,5mb
    ]
  };

  const policyBase64 = base64.encode(JSON.stringify(policyText));
  return policyBase64;
}

const getSignature = function (policyBase64) {
  const accesskey = env.AccessKeySecret;
  const bytes = Crypto.HMAC(Crypto.SHA1, policyBase64, accesskey, {
    asBytes: true
  });
  const signature = Crypto.util.bytesToBase64(bytes);0.
  return signature;
}

module.exports = downloadImage;
