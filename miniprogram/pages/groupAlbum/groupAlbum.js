// pages/albumPhotos/albumPhotos.js
const db = wx.cloud.database()
const albums = db.collection('albums')
const photos = db.collection('photos')
const groupPhotos = db.collection('groupPhotos')
const groupAlbumUser = db.collection('groupAlbumUser')
const fileMD5 = db.collection('fileMD5')
const _ = db.command
var album_id
var userInfo
Page({

  /**
   * 页面的初始数据
   */
  data: {
    photos: [], //传到视图层的数据 ： 图片数组   

  },

  //下拉刷新
  onPullDownRefresh() {
    wx.showNavigationBarLoading()
    this.onLoad({
      data:{
        id: album_id
      }
    })
    setTimeout(() => {
      this.getData = '数据拿到了'
      wx.stopPullDownRefresh()
      wx.hideNavigationBarLoading()
    }, 3000)
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    var that = this
    //使用wx.getuserInfo获取用户信息，头像，昵称等
    wx.getUserInfo({
      success(res) {
        userInfo = res.userInfo

        //将用户加入到该相册中来
        wx.cloud.callFunction({
          name: 'getOpenId',
          complete: res => {

            groupAlbumUser.where({
              albumId: options.id,
              _openid: res.result.openId
            }).get().then(resGet => {
              if (resGet.data.length == 0) {
                groupAlbumUser.add({
                  data: {
                    albumId: options.id,
                    albumName: options.albumname,
                    fileId: options.albumfileid,
                    userInfo: userInfo.avatarUrl
                  }
                }).then(resUserAdd => {
                  console.log('用户添加成功 ' , resUserAdd)
                })
              }
            })
          }
        })

      }
    })

    

    wx.showLoading({
      title: '正在加载中',
    })

    album_id = options.id
    ///多次加载问题
    if (album_id == null) {
      album_id = options.data.id
    }

    //显示群相册用户 获取用户数组
    groupAlbumUser.where({
      albumId: album_id
    }).get().then(resGet => {
      this.setData({
        groupUser : resGet.data,
        albumName: resGet.data[0].albumName
      })

      console.log(resGet)
    })

    //获取该群相册内的图片
    groupPhotos.where({
      albumId: album_id
    }).count().then(resCount => {
      if (resCount.total != 0) {
        wx.cloud.callFunction({
          name: "batchQueryGroupAlbumPhotos",
          data: {
            albumId: album_id
          }
        }).then(res => {
          console.log(res)
          if (res.result != null) {
            this.setData({
              photos: res.result.data
            })
          }
        })
      }
    })
    wx.hideLoading()
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

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
                          fileId: res2.fileID,
                          fileDigest: res0.digest,
                          backup: 0
                        }
                      }).then(resFileMD5 => {})

                      //云存储里没有该上传照片
                      groupPhotos.add({
                        data: {
                          fileId: res2.fileID, //云ID对应上传文件成功传回的res
                          fileSize: res0.size,
                          fileDigest: res0.digest,
                          albumId: album_id, //添加相册ID的属性
                          userInfo: userInfo
                        }
                      }).then(res3 => {
                        wx.showToast({
                          title: '上传成功',
                          icon: 'success'
                        })
                      }).catch(console.error)

                      //更新相册封面  封面更新为最后上传的图片
                      console.log('length: ',tempFilePaths.length)
                      if (j == tempFilePaths.length - 1) {
                        console.log('yes', album_id)
                        groupAlbum.doc(album_id).update({
                          data: {
                            fileId: res2.fileId
                          }
                        }).then(res2 => {
                          console.log('相册封面更新成功')
                        })
                        //更新页面
                        setTimeout(() => {
                          console.log('调用渲染时的id', album_id)
                          //调用页面加载函数，渲染视图层
                          that.onLoad({
                            data: {
                              id: album_id
                            }
                          })
                        }, 1000);
                      }
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
                    groupPhotos.add({
                      data: {
                        fileId: res4.data[0].fileId,
                        fileSize: res0.size,
                        fileDigest: res0.digest,
                        albumId: album_id,
                        userInfo: userInfo
                      }
                    }).then(res5 => {
                      wx.showToast({
                        title: '上传成功',
                        icon: 'success'
                      })
                    })

                    //更新相册封面
                    console.log('length: ', tempFilePaths.length)
                    if (j == tempFilePaths.length - 1) {
                      console.log('yes', album_id)
                      albums.doc(album_id).update({
                        data: {
                          fileId: res4.data[0].fileId
                        }
                      }).then(res2 => {
                        console.log('相册封面更新成功')
                      })
                      //更新页面
                      setTimeout(() => {
                        console.log('调用渲染时的id', album_id)
                        //调用页面加载函数，渲染视图层
                        that.onLoad({
                          data: {
                            id: album_id
                          }
                        })
                      }, 1000);
                    }

                  })
                }
              })
            }
          })
          if (j == tempFilePaths.length - 1) {

          }
        }
      }
    })
  },

  //图片预览
  imagePreview: function(event) {
    var imageSrc = event.currentTarget.dataset.imagesrc
    wx.previewImage({
      urls: [imageSrc],
    })
  }
})