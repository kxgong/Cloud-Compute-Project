// pages/albums/albums.js
const app = getApp()
const db = wx.cloud.database()
const albums = db.collection('albums')
const photos = db.collection('photos')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    src:'cloud://cloudconputing-708659.636c-cloudconputing-708659/',
    task : [],
    windowsH : 0,
    photo: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    photos.get().then(res =>{
      //0console.log(res)
      this.setData({
        photo : res.data
      })
    })

    wx.getSystemInfo({
      success: function(res) {
        // this.setData({
        //   windowsH : res.windowsH
        // })
        console.log('windosH: ',res.windowsH)
      },
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

  // 长按事件
  longpress(e) {
    const imgIndex = e.currentTarget.dataset.index
    const recordId = e.currentTarget.dataset.id
    console.log('idx: ', imgIndex)
    console.log('recordId ', recordId)
    // 展示操作菜单
    wx.showActionSheet({
      itemList: ['删除照片'],
      success: res => {
        if (res.tapIndex === 0) {
          //this.deleteFile(imgIndex)
          this.deleteRecord(recordId)
        }
      }
    })

  },

  // 删除照片
  async deleteFile(fileid) {
    //const fileId = fileid
    // 删除文件
    wx.cloud.deleteFile({
      fileList: [fileid],
      success: res => {
        // handle success
        console.log(res.fileList)
      },
      fail: console.error
    })
  },
  
  //删除数据库中的记录
  deleteRecord(id){
    photos.doc(id).remove().then(res => {
      console.log(res);
    })
  }

})