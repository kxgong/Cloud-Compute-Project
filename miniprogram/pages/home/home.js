// pages/home/home.js
const app=getApp()
const db = wx.cloud.database()
const userInfo = db.collection('userInfo')

Page({

  data: {
    authorizated: false
  },

  onLoad: function(options) {
    var that = this
    //查看userInfo表里有没有用户信息 如果没有需要用户授权
    //并且记录用户信息
    wx.cloud.callFunction({
      name: "getOpenId",
    }).then(res => {
      userInfo.where({
        _openid: res.result.openId
      }).count().then(resTotal => {
        //该用户未授权的情况
        if(resTotal.total == 0){
          that.setData({
            authorizated : false
          })
        }
        else {
          that.setData({
            authorizated : true
          })
        }
      })
    })
  },

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

  //授权按钮函数 
  //如果用户没有授权 则获取用户信息并且加入userInfo表里
  getUserInfo: function(event) {
    var that = this
    wx.cloud.callFunction({
      name: 'getOpenId',
      complete: res => {
        userInfo.where({
          _openid: res.result.openId
        }).count().then(res => {
          console.log(res)
          if (res.total == 0) {
            userInfo.add({
              data: event.detail.userInfo,
            }).then(res => {
              that.setData({
                authorizated: true
              })
            }).catch(err => {
              console.log(err)
            })
          } else {
            
          }
        })
      }
    })
  },



})