// pages/user/user.js
const db = wx.cloud.database()
const userInfo = db.collection('userInfo')
const photos = db.collection('photos')
const albums = db.collection('albums')
const groupAlbums = db.collection('groupAlbums')
const groupAlbumUser = db.collection('groupAlbumUser')
const groupPhotos = db.collection('groupPhotos')
const fileMD5 = db.collection('fileMD5')
const fileIdBackup = db.collection('fileIdBackup')
const _ = db.command
var albumName
var groupAlbumName
var openID
var _userInfo //用户上传到群相册数据库里

var downLoadImage = require('../../uploadToAliyun/downloadFile.js')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    hiddenPhotos: false,
    hiddenAlbums: true,
    hiddenGroupAlbums: true,
    management_photo: false,

    selectArr: [], //选择删除图片时标记数组

    show: false,
    showGroup: false, //群相册输入框
    username: '',
    password: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    wx.showLoading({
      title: '数据加载中...',
    })
    wx.cloud.callFunction({
      name: "getOpenId"
    }).then(res0 => {
      openID = res0.result.openId
      userInfo.where({
        _openid: res0.result.openId
      }).get().then(res => {
        _userInfo = res.data[0]
        photos.where({
          _openid: res.data[0]._openid,
          albumId: 'nonAlbum'
        }).count().then(resCount => {
          if (resCount.total != 0) {
            //获取用户信息成功后，取相册，图片数据库的数据 
            wx.cloud.callFunction({
              name: "batchQuery"
            }).then(res2 => {
              //获取PHOTOS表里的数据 个人照片数据
              var temparr = [];
              for (var i = 0; i < res2.result.data.length; i++) {
                //查询一fileId 如果查询的到就使用原来的fileId如果查询不到则使用
                temparr.push({
                  _id: res2.result.data[i]._id,
                  _openid: res2.result.data[i]._openid,
                  fileId: res2.result.data[i].fileId,
                  selected: false
                })
              }
              this.setData({
                //设置数据 可以在视图层用到相片数据
                userInfo: res.data[0],
                photos: temparr
              }, res => {
                wx.hideLoading()
              })
            })

          } else {
            //该用户没有个人照片数据 给渲染层传递用户信息数据
            this.setData({
              userInfo: res.data[0]
            })
          }
        })

        //调用云函数前获取相册时先从数据库中看是否有相册
        albums.where({
          _openid: res.data[0]._openid
        }).count().then(resAlbumCount => {
          if (resAlbumCount.total != 0) {
            //获取相册到时候要改成云函数
            wx.cloud.callFunction({
              name: "batchQueryAlbum"
            }).then(res => {
              this.setData({
                albums: res.result.data
              })
            })
          } else {
            //没有相册
          }
        })

        //获取群相册的数据
        groupAlbumUser.where({
          _openid: res.data[0]._openid
        }).get().then(resGet => {
          //console.log(resGet)
          this.setData({
            groupAlbums: resGet.data
          })
        })
      })

    })
  },

  //获取图片数据并且渲染
  updatePhotos: function (event) {
    wx.cloud.callFunction({
      name: "batchQuery"
    }).then(res2 => {
      //获取PHOTOS表里的数据 个人照片数据
      var temparr = [];
      for (var i = 0; i < res2.result.data.length; i++) {
        //查询一fileId 如果查询的到就使用原来的fileId如果查询不到则使用
        temparr.push({
          _id: res2.result.data[i]._id,
          _openid: res2.result.data[i]._openid,
          fileId: res2.result.data[i].fileId,
          selected: false
        })
      }
      this.setData({
        //设置数据 可以在视图层用到相片数据
        photos: temparr
      }, res => { })
    })
  },

  //获取新个人相册数据
  updateAlbum: function (event) {
    wx.cloud.callFunction({
      name: "batchQueryAlbum"
    }).then(res => {
      this.setData({
        albums: res.result.data
      })
    })
  },

  //获取更新群相册数据
  updateGroupAlbum: function (event) {
    var that = this
    console.log(this.data)
    groupAlbumUser.where({
      _openid: openID
    }).get().then(resGet => {
      //console.log(resGet)
      this.setData({
        groupAlbums: resGet.data
      })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.hideLoading()
    console.log(this.data)
    this.updatePhotos()
    this.updateAlbum()
    this.updateGroupAlbum()

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  //切换到个人图片
  tapPhotos: function (event) {
    this.setData({
      hiddenPhotos: false,
      hiddenAlbums: true,
      hiddenGroupAlbums: true,
    })
  },

  //切换到相册
  tapAlbums: function (event) {
    this.setData({
      hiddenPhotos: true,
      hiddenAlbums: false,
      hiddenGroupAlbums: true,
    })
  },

  //切换到群相册
  tapGroupAlbums: function (event) {
    this.setData({
      hiddenPhotos: true,
      hiddenAlbums: true,
      hiddenGroupAlbums: false,
    })
  },

  //添加照片
  addAlbum: function (event) {
    this.setData({
      show: true
    })
  },

  //创建新相册
  createAlbum: function (event) {
    var that = this
    albums.add({
      data: {
        albumName: albumName,
        fileId: 'defaultAlbum.png',
        photoCount: 0
      }
    }).then(res => {
      that.updateAlbum()
    })
  },

  //记录个人相册输入框的内容
  onChange(event) {
    albumName = event.detail
  },

  //记录群相册输入框的内容
  onChangeGroup(event) {
    groupAlbumName = event.detail
  },

  //关闭个人相册输入框
  onClose(event) {
    if (event.detail === 'confirm') {
      // 异步关闭弹窗
      this.createAlbum()
      setTimeout(() => {
        this.setData({
          show: false
        });
      }, 500);
    } else {
      this.setData({
        show: false,
        username: ''
      });
    }
  },

  //关闭群相册输入框
  onCloseGroup(event) {
    if (event.detail === 'confirm') {
      // 异步关闭弹窗
      this.createGroupAlbum()
      setTimeout(() => {
        this.setData({
          showGroup: false,
        });
      }, 500);
    } else {
      this.setData({
        showGroup: false,
        username: ''
      });
    }
  },

  // 管理商品
  management: function () {
    let that = this;
    that.setData({
      management_photo: true,
    })
  },
  finish_management: function () {
    let that = this;
    that.setData({
      management_photo: false,
    })
  },
  // 选择
  select: function (e) {
    let arr2 = [];
    if (this.data.management_photo == false) {
      return;
    } else {
      var arr = this.data.photos;
      var index = e.currentTarget.dataset.id;
      arr[index].selected = !arr[index].selected;

      for (let i = 0; i < arr.length; i++) {
        if (arr[i].selected) {
          arr2.push(arr[i])
        }
      };
      this.setData({
        photos: arr,
        middlearr: arr2 //计数
      })
    }
  },
  //删除
  deletePhoto: function (event) {
    //删除photos表中的记录
    var deleteArr = this.data.photos
    var newarr = []
    for (var i = 0; i < deleteArr.length; i++) {
      if (deleteArr[i].selected == true) {
        photos.doc(deleteArr[i]._id).remove({}).then(res => { })

      } else {
        newarr.push(deleteArr[i])
      }
    }
    this.setData({
      photos: newarr,
      management_photo: false
    })
  },

  //相册长按事件 删除对应相册
  //删除photos表里所有对应数据
  longPressAlbum: function (event) {
    var that = this
    wx.showModal({ //使用模态框提示用户进行操作
      title: '提示',
      content: '您将删除该相册',
      success: function (res) {
        if (res.confirm) { //判断用户是否点击了确定，执行删除相册操作
          var deletePos = event.currentTarget.dataset.id
          //删相册之前先把相册里的所有相片给删除了
          wx.cloud.callFunction({
            name: "batchDeleteAlbumPhotos",
            data: {
              albumId: that.data.albums[deletePos]._id
            }
          }).then(res => { })
          albums.doc(that.data.albums[deletePos]._id).remove().then(res => { })
          var newAlbumArr = [];
          for (var i = 0; i < that.data.albums.length; i++) {
            if (i != deletePos) {
              newAlbumArr.push(that.data.albums[i]);
            }
          }
          that.setData({
            albums: newAlbumArr
          })
        }
      }
    })
  },

  //群相册删除
  //在photoAlbumUser表里删除数据
  longPressGroupAlbum: function (event) {
    var that = this
    var deletePos = event.currentTarget.dataset.id
    wx.showModal({ //使用模态框提示用户进行操作
      title: '提示',
      content: '您将删除该群相册',
      success: function (res) {
        if (res.confirm) {
          groupAlbumUser.doc(that.data.groupAlbums[deletePos]._id).remove().then(res => {
            console.log('群相册删除成功')
            var newGroupAlbumArr = [];
            for (var i = 0; i < that.data.groupAlbums.length; i++) {
              if (i != deletePos) {
                newGroupAlbumArr.push(that.data.groupAlbums[i]);
              }
            }
            that.setData({
              groupAlbums: newGroupAlbumArr
            })
          })
        }
      }
    })
  },
  //添加照片
  addPhotos: function (event) {
    var that = this
    wx.chooseImage({
      count: 9,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        const tempFilePaths = res.tempFilePaths

        //处理异步问题：
        //因为微信小程序调度云函数是异步的，并不会等到第一个云函数执行完毕，微信会马上调用第二个云函数
        //以下代码有云函数嵌套调用情况，且输入参数与调度次序i有关，如果用for循环，第一个云函数的i序号是正确的
        //理想情况:
        //for(var i = 0; i < n; i++){
        //  云函数1（i）{云函数2（i）}
        // }
        //解决办法是定义const j = i  能保证数据的一致性

        for (var i = 0; i < tempFilePaths.length; i++) {
          const j = i;
          let randString = Math.floor(Math.random() * 1000000).toString() + '.png'
          //先获取要上传文件的MD5值
          wx.getFileInfo({
            filePath: tempFilePaths[j],
            success(res0) {
              fileMD5.where({
                fileDigest: res0.digest
              }).count().then(res1 => {
                //文件系统里没有存储过该文件
                if (res1.total == 0) {
                  wx.cloud.uploadFile({
                    cloudPath: randString, // 上传至云端的路径
                    filePath: tempFilePaths[j], // 小程序临时文件路径
                    success: res2 => {
                      //往fileMD5里添加记录
                      fileMD5.add({
                        data: {
                          fileId: res2.fileID,
                          fileDigest: res0.digest,
                          backup: 0
                        }
                      }).then(resFileMD5Add => {
                        console.log('MD5表添加成功')
                      })
                      //往photos表里添加记录
                      photos.add({
                        data: {
                          fileId: res2.fileID, //fileID对应上传文件成功传回的云ID
                          fileSize: res0.size,
                          fileDigest: res0.digest,
                          albumId: 'nonAlbum' //标记这张照片不在相册里
                        }
                      }).then(res3 => {
                        wx.showToast({
                          title: '上传成功',
                          icon: 'success'
                        })
                        if (j == tempFilePaths.length - 1) {
                          that.updatePhotos()
                        }
                        //更新页面数据

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
                    //在photos表中增加记录
                    photos.add({
                      data: {
                        fileId: res4.data[0].fileId,
                        fileSize: res0.size, //文件大小
                        fileDigest: res0.digest, //文件MD5值
                        albumId: 'nonAlbum'
                      }
                    }).then(res5 => {
                      wx.showToast({
                        title: '上传成功',
                        icon: 'success'
                      })
                      if (j == tempFilePaths.length - 1) {
                        that.updatePhotos()
                      }
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
  },

  //图片预览
  imagePreview: function (event) {
    var imageSrc = event.currentTarget.dataset.imagesrc
    console.log(event)
    wx.previewImage({
      urls: [imageSrc],
    })
  },

  //新建群相册
  addGroupAlbum: function (event) {
    this.setData({
      showGroup: true
    })
  },

  //创建群相册，往数据库里写数据
  //需要往groupAlbums里写新建相册的数据
  //需要往groupAlbumUser写用户映射数据 一个群相册对应多个用户
  createGroupAlbum: function (event) {
    var that = this
    if (groupAlbumName != null) {
      groupAlbums.add({
        data: {
          albumName: groupAlbumName,
          fileId: 'defaultAlbum.png',
          photoCount: 0
        }
      }).then(res => {
        //群相册用户映射表里添加记录
        groupAlbumUser.add({
          data: {
            albumName: groupAlbumName,
            fileId: 'defaultAlbum.png',
            albumId: res._id,
            userInfo: _userInfo.avatarUrl,
          }
        }).then(resAdd => {
          that.updateGroupAlbum()
        })
      })

    } else {
      console.log('群相册名字为空')
    }
  },

  //全选按钮的函数
  select_all: function (event) {
    var arr = this.data.photos;
    for (var i = 0; i < arr.length; i++) {
      arr[i].selected = true;
    }
    this.setData({
      photos: arr,
      select_all: true
    })
  },

  //取消全选
  select_none: function (event) {
    var arr = this.data.photos;
    for (var i = 0; i < arr.length; i++) {
      arr[i].selected = false;
    }
    this.setData({
      photos: arr,
      select_all: false
    })
  },

  //长按照片时间 可以找回备份
  longpressPhoto: function (event) {
    console.log(event.currentTarget.dataset.imagesrc)
    var that = this
    var originFileId = event.currentTarget.dataset.imagesrc
    var backupFileId
    var backupPos = event.currentTarget.dataset.id
    wx.showActionSheet({
      itemList: ['删除', '找回备份'],
      success: function (res) {
        console.log(res.tapIndex)
        if (res.tapIndex == 0) {
          that.setData({
            management_photo: true,
          })
        } else if (res.tapIndex == 1) {
          wx.showModal({
            title: '提示',
            content: '是否需要找回图片备份？',
            success: function (res) {
              if (res.confirm) {
                console.log('用户点击确定')
                //从fileBackup表里找到对应fileId的备份
                fileIdBackup.where({
                  orgin: originFileId
                }).get().then(resGet => {
                  console.log(resGet)
                  //拿到备份的文件ID 
                  if (resGet.data.length != 0) {
                    backupFileId = resGet.data[0].backup


                    downLoadImage(backupFileId, function (r) {
                      //
                      wx.cloud.uploadFile({
                        cloudPath: originFileId,
                        filePath: r,
                        success: resUpload => {
                          console.log("备份重新上传成功")
                        }
                      })
                    },
                      function (r) {
                        console.log("下载失败！")
                        wx.hideLoading()
                      }
                    )
                    console.log(backupFileId)
                    var arr = that.data.photos
                    console.log(backupPos)
                    console.log(arr)
                    //更新fileMD5表
                    fileMD5.where({
                      fileId: arr[backupPos].fileId
                    }).get().then(resGet => {
                      fileMD5.doc(resGet.data[0]._id).update({
                        data: {
                          fileId: backupFileId
                        }
                      }).then(resUpdate => {
                        arr[backupPos].fileId = backupFileId
                        //向渲染层传输新的数据
                        that.setData({
                          photos: arr
                        })
                        //更新photos表  
                        photos.doc(arr[backupPos]._id).update({
                          data: {
                            fileId: backupFileId
                          }
                        }).then(resUpdate => {
                          console.log('照片表更新成功')
                        })

                      })
                    })

                    //增加fileIdBackup表 增加备份
                    let randString = Math.floor(Math.random() * 1000000).toString() + '.png'
                    wx.cloud.downloadFile({
                      fileID: backupFileId,
                      success: res => {
                        wx.cloud.uploadFile({
                          cloudPath: randString, // 上传至云端的路径
                          filePath: res.tempFilePath, // 小程序临时文件路径
                          success: resUpload => {
                            //返回文件 ID
                            //并且修改fileIdBack表  映射备份
                            fileIdBackup.add({
                              data: {
                                orgin: backupFileId,
                                backup: resUpload.fileID
                              }
                            }).then(resAdd => {
                              console.log('backupadd')
                            })
                            console.log(resUpload.fileID)
                          },
                          fail: console.error
                        })
                      },
                      fail: console.error
                    })

                  }
                })
              } else {
                console.log('用户点击取消')
              }

            }
          })

        }
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })
  }


})