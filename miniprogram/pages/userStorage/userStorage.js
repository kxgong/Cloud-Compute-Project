var wxCharts = require('../../utils/wxcharts.js');
var app = getApp();
var ringChart = null;
var totalFileSize = 0 //某个用户的文件总大小
const totalStorage = 500 * 1024 * 1024
//获取数据库实例
const db = wx.cloud.database()
const photos = db.collection('photos')
const userInfo = db.collection('userInfo')
var personalFileSize = 0
var albumFileSize = 0
Page({

  data: {
    userNickname: '',
    userUrl: '',
    userSpace: 0
  },
  touchHandler: function(e) {
    console.log(ringChart.getCurrentDataIndex(e));
  },
  updateData: function() {
    ringChart.updateData({
      title: {
        name: '80%'
      },
      subtitle: {
        color: '#ff0000'
      }
    });
  },

  onLoad: function(options) {
    console.log(options)
    userInfo.where({
      _openid: options.openId
    }).get().then(res => {
      this.setData({
        userinfo: res.data[0]
      })
    })
  },

  onReady: function(e) {
    //
    photos.count().then(res => {
      if (res.total == 0) {
        ringChart = new wxCharts({
          animation: true,
          canvasId: 'ringCanvas',
          type: 'ring',
          extra: {
            ringWidth: 25,
            pie: {
              offsetAngle: -45
            }
          },
          title: {
            name: '0' + '%',
            color: '#f7a35c',
            fontSize: 25
          },
          subtitle: {
            name: '已用空间',
            color: '#666666',
            fontSize: 15
          },
          series: [{
            name: '1',
            data: 0,
            color: '#111111',
            stroke: false
          }, {
            name: '2',
            data: 1,
            stroke: false
          }, {
            name: '3',
            data: 0,
            stroke: false
          }],
          disablePieStroke: true,
          width: 320,
          height: 200,
          dataLabel: false,
          legend: false,
          background: '#f5f5f5',
          padding: 0
        });
        ringChart.addEventListener('renderComplete', () => {
          console.log('renderComplete');
        });
        setTimeout(() => {
          ringChart.stopAnimation();
        }, 2000);
      } else {
        wx.cloud.callFunction({
          name: "QueryUserPhotos"
        }).then(res => {
          console.log(res)

          totalFileSize = 0
          personalFileSize = 0
          albumFileSize = 0
          for (let i = 0; i < res.result.data.length; i++) {
            totalFileSize += res.result.data[i].fileSize
            if (res.result.data[i].albumId == 'nonAlbum'){
              personalFileSize += res.result.data[i].fileSize
            }
            else{
              albumFileSize += res.result.data[i].fileSize
            }
          }
          this.setData({
            personalFileSize: (personalFileSize / 1024 / 1024).toFixed(1),
            albumFileSize: (albumFileSize / 1024 / 1024).toFixed(1)
          })
          var percentage = Math.floor(totalFileSize / totalStorage * 1000) / 10
          var userSpace = (totalFileSize / 1024 / 1024).toFixed(1)
          this.setData({
            userSpace: userSpace
          })
          percentage = String(percentage)
          console.log(percentage)
          var windowWidth = 320;
          try {
            var res = wx.getSystemInfoSync();
            windowWidth = res.windowWidth;
          } catch (e) {
            console.error('getSystemInfoSync failed!');
          }


          ringChart = new wxCharts({
            animation: true,
            canvasId: 'ringCanvas',
            type: 'ring',
            extra: {
              ringWidth: 25,
              pie: {
                offsetAngle: -45
              }
            },
            title: {
              name: percentage + '%',
              color: '#f7a35c',
              fontSize: 25
            },
            subtitle: {
              name: '已用空间',
              color: '#666666',
              fontSize: 15
            },
            series: [{
              name: '1',
              data: 0,
              color: '#111111',
              stroke: false
            }, {
              name: '2',
              data: totalStorage - totalFileSize,
              stroke: false
            }, {
              name: '3',
              data: totalFileSize,
              stroke: false
            }],
            disablePieStroke: true,
            width: windowWidth,
            height: 200,
            dataLabel: false,
            legend: false,
            background: '#f5f5f5',
            padding: 0
          });
          ringChart.addEventListener('renderComplete', () => {
            console.log('renderComplete');
          });
          setTimeout(() => {
            ringChart.stopAnimation();
          }, 1000);
        })
      }
    })

    
  }
});