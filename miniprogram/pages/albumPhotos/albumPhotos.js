// pages/albumPhotos/albumPhotos.js
const db = wx.cloud.database()
const albums = db.collection('albums')
const photos = db.collection('photos')
const fileMD5 = db.collection('fileMD5')
const _ = db.command
var album_id
Page({

  /**
   * 页面的初始数据
   */
  data: {
    photos: []    //传到视图层的数据 ： 图片数组   
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.showLoading({
      title: '正在加载中',
    })
    album_id = options.id
    if(album_id == null){
      album_id = options.data.id
    }
    console.log(options)
    photos.where({
      albumId: album_id
    }).count().then(resCount => {
      if(resCount.total != 0){
        wx.cloud.callFunction({
          name: "batchQueryAlbumPhotos",
          data: {
            albumId: album_id
          }
        }).then(res => {
          console.log(res)
          if (res.result != null) {
            this.setData({
              photos: res.result.data
            })
            wx.hideLoading()
          }
        })
      }
    })
  },

  //更新照片
  updatePhotos:function(event) {
    wx.cloud.callFunction({
      name: "batchQueryAlbumPhotos",
      data: {
        albumId: album_id
      }
    }).then(res => {
      console.log(res)
      if (res.result != null) {
        this.setData({
          photos: res.result.data
        })
        wx.hideLoading()
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
 
  },


  //添加相册图片
  addAlbumPhotos: function(event) {
    var that = this
    wx.chooseImage({
      count: 9,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        const tempFilePaths = res.tempFilePaths //可能是个路径数组！

        for (var i = 0; i < tempFilePaths.length; i++) {
          const j = i
          let randString = Math.floor(Math.random() * 1000000).toString() + '.png'
          //先获取要上传文件的MD5值
          wx.getFileInfo({
            filePath: tempFilePaths[j],
            success(res0) {
              console.log(res0)
              //获取MD5值之后查询数据库照片表中有没有相同的图片，有的话不重复存
              fileMD5.where({
                fileDigest: res0.digest
              }).count().then(res1 => {
                console.log(res1)
                if (res1.total == 0) {
                  wx.cloud.uploadFile({
                    cloudPath: randString, // 上传至云端的路径
                    filePath: tempFilePaths[j], // 小程序临时文件路径
                    success: res2 => {
                      //往fileMD5表里添加新记录
                      fileMD5.add({
                        data: {
                          fileMD5: res2.fileID,
                          fileDigest: res0.digest,
                          backup: 0
                        }
                      }).then(resFileMD5 => {

                      })
                      
                      //云存储里没有该上传照片
                      photos.add({
                        data: {
                          fileId: res2.fileID, //云ID对应上传文件成功传回的res
                          fileSize: res0.size,
                          fileDigest: res0.digest,
                          albumId: album_id //添加相册ID的属性
                        }
                      }).then(res3 => {
                        console.log('photosadd1:',res3)
                        albums.doc(album_id).update({
                          data: {
                            photoCount: _.inc(1)
                          }
                        }).then(resAdd => {
                          wx.showToast({
                            title: '上传成功',
                            icon: 'success'
                          })
                        })
                        //更新相册封面  封面更新为最后上传的图片
                        if (j == tempFilePaths.length - 1) {
                          albums.doc(album_id).update({
                            data: {
                              fileId: res2.fileID
                            }
                          }).then(res2 => {
                            console.log('相册封面更新成功')
                            that.updatePhotos()
                          })
                        }
                        
                      }).catch(console.error)
                    },
                    fail: console.error
                  })
                }
                //如果云存储中有该文件，不存但是需要存下该文件的数据库信息
                else {
                  fileMD5.where({
                    fileDigest: res0.digest
                  }).get().then(res4 => {
                    
                    //photos增加记录
                    photos.add({
                      data: {
                        fileId: res4.data[0].fileId,
                        fileSize: res0.size,
                        fileDigest: res0.digest,
                        albumId: album_id
                      }
                    }).then(res5 => {
                      console.log('云存储有：', res5)
                      albums.doc(album_id).update({
                        data: {
                          photoCount: _.inc(1)
                        }
                      }).then(resAdd => {
                        wx.showToast({
                          title: '上传成功',
                          icon: 'success'
                        })
                      })
                      //更新相册封面
                      if (j == tempFilePaths.length - 1) {
                        albums.doc(album_id).update({
                          data: {
                            fileId: res4.data[0].fileId
                          }
                        }).then(res2 => {
                          console.log('相册封面更新成功')
                        })
                        that.updatePhotos()
                      }
                    })
                  })
                }
              })
            }
          })
          

        }
      }
    })
  },

  //图片预览
  imagePreview: function (event) {
    var imageSrc = event.currentTarget.dataset.imagesrc
    wx.previewImage({
      urls: [imageSrc],
    })
  }
})