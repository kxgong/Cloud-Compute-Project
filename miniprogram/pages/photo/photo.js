// pages/photo/photo.js
const db = wx.cloud.database()
const photos = db.collection('photos')
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
    console.log(options)
    photos.doc(options.id).get({
      success: res => {
        this.setData({
          photo: res.data.fileId,
          id: options.id
        })
      }
    })
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
    let id = this.data.id
    return{
      title: '我发现一张好照片',
      path: 'pages/photo/photo?id='+id,
      imageUrl: 'https://developers.weixin.qq.com/miniprogram/dev/image/cat/0.jpg?t=18122020',
    }
  },

  //下载图片
  downloadPhoto: function(evevt) {
    wx.cloud.downloadFile({
      fileID: this.data.photo, // 文件 ID
      success: res => {
        // 返回临时文件路径
        console.log(res.tempFilePath)
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: res=>{
            wx.showToast({
              title: '保存成功',
              icon: 'success'
            })
          },
          fail: err =>{
            console.error(err)
          }
        })
      },
      fail: console.error
    })
  },

  //生成临时链接
  generateUrl:function(event){
    wx.cloud.getTempFileURL({
      fileList: [this.data.photo],
      success: res=>{
        wx.setClipboardData({
          data: res.fileList[0].tempFileURL,
          success: res2=>{
            console.log(res2)
          }
        })
      }
    })
  }
})