var downLoadImage=require('../../uploadToAliyun/downloadFile.js')
Page({
  data: {
    community: '0',
    cur: 1,
    avatarUrl: './user-unlogin.png',
    ph: './user-test.png',
    li: './dianzan.png',
    ad: './add_button.png',
    sc: './shanchu-m.png',
    sh: './zhifeiji.png',
    upNum: 100,
    userInfo: {},
    logged: false,
    ans: [],
    takeSession: false,
    requestResult: ''
  },


  /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
  onPullDownRefresh: function () {
    var that = this
    var an = []
  console.log("in")
    wx.cloud.callFunction({
      name: 'getCommunityPhotos',
      data: {
        communityId: that.data.community,
        current: 1
      },
    }).then(res => {
      console.log(res.result.length)
      console.log('调用云函数获取社区数据成功')
      for (var i = 0; i < res.result.length; i++) {
        console.log(res.result[i].fileId)
        downLoadImage(res.result[i].fileId, function (r) {
          res.result[i].fileID = r
        },
          function (r) {
            console.log("下载失败！")
            wx.hideLoading()
          }
        )
      }

      // console.log(res.result)
      that.setData({
        ans: res.result,
        cur: res.result.length + 1
      })
      console.log(that.data.ans)
    }).catch(console.error)

  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    var that = this
    wx.cloud.callFunction({
      name: 'getCommunityPhotos',
      data: {
        communityId: that.data.community,
        current: that.data.cur
      },
    }).then(res => {
      console.log(res.result.length)
      if (res.result == -1)
        console.log("fuck")

      if (res.result != -1) {
        console.log('调用云函数获取社区数据成功')
        // console.log(res.result)
        that.setData({
          ans: that.data.ans.concat(res.result),
          cur: that.data.cur + res.result.length
        })

        console.log(that.data.ans)
      }
    }).catch(console.error)

  },

  onShow: function() {
    var that = this
    var an=[]
   
    wx.cloud.callFunction({
      name: 'getCommunityPhotos',
      data: {
        communityId: that.data.community,
        current: 1
      },
    }).then(res => {
      console.log(res.result.length)
      console.log('调用云函数获取社区数据成功')
      for (var i = 0; i < res.result.length;i++)
      {
        console.log(res.result[i].fileId)
        downLoadImage(res.result[i].fileId ,function(r)
        {
          res.result[i].fileID=r
        },
        function(r)
        {
          console.log("下载失败！")
          wx.hideLoading()
        }
        )
      }

      // console.log(res.result)
      that.setData({
        ans: res.result,
        cur: res.result.length + 1
      })
      console.log(that.data.ans)
    }).catch(console.error)


  },
  uploadFun: function(e) {
    var that = this

    wx.navigateTo({
      url: '../update/update?community=' + that.data.community + '&userInfo=' + JSON.stringify(that.data.userInfo)
    })
  },
  onLoad: function(e) {

    // console.log(e.community)
    this.setData({
      userInfo: JSON.parse(e.userInfo),
      avatarUrl: e.avatarUrl,
      community: e.community
    })




  },

  

  onShareAppMessage(res) {
    var that = this
    console.log(res.target.id)
    var url
    var flag = false
    console.log(that.data.ans[res.target.id].fileId)
    wx.cloud.callFunction({
        name: 'downLoadImage',
        data: {
          fileID: that.data.ans[res.target.id].fileId
        },
      })
      .then(res => {
        console.log(res.result[0].tempFileURL)

        url = res.result[0].tempFileURL
        flag = true
        console.log(url)
      return {
        title: '分享给你社区图片',
        // path:'/index/index/',
        imageUrl: url
      }
        //url=res.result[0].tempFilePath
      })
    
  
      return {

        title: '分享给你社区图片',
        // path:'/index/index/',
        imageUrl: url

      }
    
  },




  likeFun: function(e) {
    console.log(e.target.id)
    var index = "ans[" + e.target.id + "].like"
    var that = this
    this.setData({
        [index]: that.data.ans[e.target.id].like + 1
      }),



    console.log(e)
      // e.disabled=true
      console.log(this.data.ans[e.target.id].like)
  },

  dl: function(e) {
      var ind=e.target.id
      var r=this.data.ans
      r.splice(ind,1)
      console.log(r)
      // var chan="ans["+ind+"]"
      this.setData({
        ans:r
      })
  },

  imagePreview:function(e) {
    var imageSrc = e.currentTarget.dataset.imagesrc
    wx.previewImage({
      urls: [imageSrc],
    })
  }
})