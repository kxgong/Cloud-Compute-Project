// pages/administrator/administrator.js
const db = wx.cloud.database()
const photos = db.collection('photos')
const groupPhotos = db.collection('groupPhotos')
const fileMD5 = db.collection('fileMD5')
const fileIdBackup = db.collection('fileIdBackup') 
const _ = db.command

var uploadImage = require('../../uploadToAliyun/uploadFile.js');//地址换成你自己存放文件的位置
var util = require('../../uploadToAliyun/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  //获取fileMD5表里所有数据
  //对每个fileMD5值进行统计
  //
  manageSpace: function(event) {
    var files = []
    wx.cloud.callFunction({
      name: "batchQueryFileMD5"
    }).then(resQuery => {
      files = resQuery.result.data
      console.log(files)
      for (var i = 0; i < files.length; i++) {
        const j = i
        photos.where({
          fileDigest: files[j].fileDigest
        }).count().then(resCount1 => {
          groupPhotos.where({
            fileDigest: files[j].fileDigest
          }).count().then(resCount2 => {
            console.log(resCount1.total + resCount2.total)
            //执行删除该文件操作
            if (resCount1.total + resCount2.total == 0) {
              console.fileMD5[j].fileId
              wx.cloud.deleteFile({
                fileList: [files[j].fileId], // 文件 ID
                success: resDeleteFile => {
                  console.log('success')
                  console.log(resDeleteFile)
                  fileMD5.doc(files[j]._id).remove().then(resFileMD5 => {
                    console.log("文件删除成功")
                  })
                },
                fail: console.error
              })
            }
          })
        })
      }
    })
  },

  //创建备份
  deletePhotos: function(event) {
    var files = []
    wx.cloud.callFunction({
      name: "batchQueryFileMD5"
    }).then(resQuery => {

      files = resQuery.result.data
      console.log(files)
      for(var i = 0; i < files.length; i++){
        const j = i
        let randString = Math.floor(Math.random() * 1000000).toString() + '.png'
        if(files[j].backup == 0){
          wx.cloud.downloadFile({
            fileID: files[j].fileId,
            success: res => {
              console.log(res)
              var nowTime = util.formatTime(new Date())
              uploadImage(res.tempFilePath, 'images/' + 'images/' + nowTime + '/',
                function (res2) {
                  console.log("ssss" + res2)
                  res2 = res2.slice(0, 48) + '/' + res2.slice(48)
                  //console.log("======上传成功图片地址为：", res2);
                  //做你具体的业务逻辑操作
                  console.log(files[j]._id+"  abcd")
                  wx.cloud.callFunction({
                    name: "updateBackup",
                    data:{
                      id : files[j]._id
                    }
                  }).then(resBackup => {
                      console.log(resBackup.result)
                  })

                  fileIdBackup.add({
                    data: {
                      orgin: files[j].fileId,
                      backup: res2
                     }
                   }).then(resAdd => {
                     console.log('backupadd')
                   })
                   console.log(res2)
                  },
                  function(res2){
                    console.log("上传失败")
                  })
              //  wx.cloud.uploadFile({
              //    cloudPath: randString, // 上传至云端的路径
              //   filePath: res.tempFilePath, // 小程序临时文件路径
              //   success: resUpload => {
              //     //返回文件 ID
              //     //成功后修改fileMD5表的记录
              //     //并且修改fileIdBack表  映射备份  
              //
              //   },
              //   fail: console.error
              // })
            },
            fail: console.error
          })
        }
      }
    })
  }

})