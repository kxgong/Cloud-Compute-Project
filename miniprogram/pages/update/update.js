// pages/update/update.js
const db = wx.cloud.database()
const photos = db.collection('CommunityPhotos')
const to = db.collection('PhotosToCommunity')
const fileMD5 = db.collection('fileMD5Community')

var uploadImage = require('../../uploadToAliyun/uploadFile.js');//地址换成你自己存放文件的位置
var util = require('../../uploadToAliyun/util.js');

var community = "0"
var up = "./logo.png"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    comment: "",
    updateUrl: "./logo.png",
    focus: false,
    choosen: false,
    inputValue: '',
    addUrl: "./add_icon.png",
    userInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    community = options.community
    this.setData(
      {
        userInfo: JSON.parse(options.userInfo),

      }
    )
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

  bindKeyInput: function (e) {
    this.setData({
      inputValue: e.detail.value
    })
  },


  onClick: function (e) {

    let randString = Math.floor(Math.random() * 1000000).toString() + '.png'
    if (!this.data.choosen) {
      wx.showToast({

        title: '请选择图片',
        icon: 'none'
      })

    } else {
      console.log("up:" + up)
      var that = this
      wx.getFileInfo({
        filePath: up,
        success: res0 => {
          console.log("in")
          console.log(res0.size)

          //获取MD5值之后查询数据库照片表中有没有相同的图片，有的话不重复存
          fileMD5.where({
            fileDigest: res0.digest
          }).count().then(res1 => {
            console.log(res1)

            if (res1.total == 0) {
              var nowTime = util.formatTime(new Date())

              uploadImage(up, 'images/' + 'images/' + nowTime + '/',

                function (res2) {

                  console.log("ssss" + res2)
                  res2 = res2.slice(0, 48) + '/' + res2.slice(48)
                  console.log("======上传成功图片地址为：", res2);
                  //做你具体的业务逻辑操作
                  {
                    //往fileMD5表里添加新记录
                    fileMD5.add({
                      data: {
                        isali: 1,
                        fileId: res2,
                        fileDigest: res0.digest,

                      }
                    }).then(resFileMD5 => { })


                    var time = Date.parse(new Date())
                    //云存储里没有该上传照片
                    photos.add({
                      data: {
                        fileId: res2, //云ID对应上传文件成功传回的res
                        fileDigest: res0.digest,
                        comment: that.data.comment,
                        timestamp: time / 1000,
                        communityId: community,
                        // albumId: album_id, //添加相册ID的属性
                        userInfo: that.data.userInfo
                      }
                    }).then(res3 => {

                      wx.showToast({
                        title: '上传成功',
                        icon: 'success'
                      })

                      wx.navigateBack({

                      })
                    }).catch(console.error)
                  }
                  wx.hideLoading();
                }, function (result) {
                  console.log("======上传失败======", result);
                  //做你具体的业务逻辑操作

                  wx.hideLoading()
                })
            }
            else {
              fileMD5.where({
                fileDigest: res0.digest
              }).get().then(res4 => {

                var time = Date.parse(new Date())
                photos.add({
                  data: {
                    fileId: res4.data[0].fileId,
                    fileDigest: res0.digest,
                    comment: that.data.comment,
                    timestamp: time / 1000,
                    communityId: community,
                    userInfo: that.data.userInfo
                  }
                }).then(res5 => {
                  console.log('云存储有：', res5)
                  wx.showToast({
                    title: '上传成功',
                    icon: 'success'

                  })
                  wx.navigateBack({

                  })
                })
              })
            }
          })
        }
      })
    }
  },

  bindinput: function (e) {
    this.setData({
      comment: e.detail.value
    })
  },
  bindReplaceInput: function (e) {
    var value = e.detail.value
    var pos = e.detail.cursor
    var left
    if (pos !== -1) {
      // 光标在中间
      left = e.detail.value.slice(0, pos)
      // 计算光标的位置
      pos = left.replace(/11/g, '2').length
    }

    // 直接返回对象，可以对输入进行过滤处理，同时可以控制光标的位置
    return {
      value: value.replace(/11/g, '2'),
      cursor: pos
    }

    // 或者直接返回字符串,光标在最后边
    // return value.replace(/11/g,'2'),
  },
  bindHideKeyboard: function (e) {
    if (e.detail.value === '123') {
      // 收起键盘
      wx.hideKeyboard()
    }
  },

  updateFun: function (e) {
    var that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths

        up = tempFilePaths[0]

        that.setData(
          {
            updateUrl: tempFilePaths,
            choosen: true
          }
        )

      }
    })
  }
})