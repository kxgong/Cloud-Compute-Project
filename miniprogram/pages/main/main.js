// miniprogram/pages/main/main.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    name:'',
    community:0,
    src: ['./1.1.png', './2.1.png', './3.1.png', './4.1.png', './5.1.png','./6.1.png'],
    //logged: false,
    //takeSession: false,
    //requestResult: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              //console.log('用户昵称：',res.userInfo)
              this.setData({
                name: res.userInfo.nickName,
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo,
              })
            }
          })
        }
      }
    })

    // if (!this.logged && e.detail.userInfo) {
    //   this.setData({
    //     logged: true,
    //     avatarUrl: e.detail.userInfo.avatarUrl,
    //     userInfo: e.detail.userInfo
    //   })
    // }
  },

  // onClick(e){
  //   //console.log('',this.userInfo.nickname)
  //   this.setData({
  //     name:'456'
  //   })
  // },

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
  communityFun: function (e) {
    var that=this
    wx.navigateTo({
      url: '../index/index?avatarUrl=' + that.data.userInfo.avatarUrl + "&userInfo=" + JSON.stringify(that.data.userInfo) + "&community=" + e.target.id
    })
  },
})