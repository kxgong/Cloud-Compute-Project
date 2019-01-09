// pages/add/add.js
const db = wx.cloud.database()
const photos = db.collection('photos')
var cururentFilePath = 0
var fileSize
var fileDigest
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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  upload: function(event) {
    wx.chooseImage({
      count: 9,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        const tempFilePaths = res.tempFilePaths
        
        //因为微信小程序调度云函数是异步的，并不会等到第一个云函数执行完毕，微信会马上调用第二个云函数
        //以下代码有云函数嵌套调用情况，且输入参数与调度次序i有关，如果用for循环，第一个云函数的i序号是正确的
        //理想情况:
        //for(var i = 0; i < n; i++){
        //  云函数1（i）{云函数2（i）}
        // }
        //但是实际情况下第二个云函数的i是错误的，暂时没有找到更好的方法来解决这一问题，只好使用一下比较笨的方法


        // if (tempFilePaths.length > 0) {
        //   let randString = Math.floor(Math.random() * 1000000).toString() + '.png'
        //   wx.cloud.uploadFile({
        //     cloudPath: randString, // 上传至云端的路径
        //     filePath: tempFilePaths[0], // 小程序临时文件路径
        //     success: res => {
        //       //console.log(res.fileID)
        //       wx.getFileInfo({
        //         filePath: tempFilePaths[0],
        //         success(res2) {
        //           const uploadFileSize = res2.size
        //           const uploadFileDigest = res2.digest
        //           photos.add({
        //             data: {
        //               fileId: res.fileID, //云ID对应上传文件成功传回的res
        //               fileSize: uploadFileSize,
        //               fileDigest: uploadFileDigest
        //             }
        //           }).then(res => {
        //             console.log(res)
        //             wx.showToast({
        //               title: '上传成功',
        //               icon: 'success'
        //             })
        //             console.log(uploadFileSize)
        //             console.log(uploadFileDigest)
        //           }).catch(console.error)
        //         }
        //       })

        //     },
        //     fail: console.error
        //   })
        // }

        if (tempFilePaths.length > 0) {
          let randString = Math.floor(Math.random() * 1000000).toString() + '.png'
          //先获取要上传文件的MD5值
          wx.getFileInfo({
            filePath: tempFilePaths[0],
            success(res0) {
              console.log(res0)
              photos.where({
                fileDigest: res0.digest
              }).count().then(res1 => {
                console.log(res1)
                if (res1.total == 0) {
                  wx.cloud.uploadFile({
                    cloudPath: randString, // 上传至云端的路径
                    filePath: tempFilePaths[0], // 小程序临时文件路径
                    success: res2 => {
                      //console.log(res.fileID)
                      console.log(res0)
                      photos.add({
                        data: {
                          fileId: res2.fileID,  //云ID对应上传文件成功传回的res
                          fileSize: res0.size,
                          fileDigest: res0.digest
                        }
                      }).then(res3 => {
                        console.log(res3)
                        wx.showToast({
                          title: '上传成功',
                          icon: 'success'
                        })
                      }).catch(console.error)
                    },
                    fail: console.error
                  })
                }
                //如果云存储中有该文件，不存但是需要存下该文件的数据库信息
                else {
                  photos.where({
                    fileDigest: res0.digest
                  }).get().then(res4 => {
                    photos.add({
                      data: {
                        fileId: res4.data[0].fileId,
                        fileSize: res0.size,
                        fileDigest: res0.digest
                      }
                    }).then(res5 => {
                      wx.showToast({
                        title: '上传成功',
                        icon: 'success'
                      })
                    })
                  })
                }
              })
            }
          })
        }

        

      },
      fail: err => {
        console.log(err)
      }

    })

  }
})