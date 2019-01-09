// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  //return db.collection('fileMD5').doc(event.id)
  await db.collection('fileMD5').doc(event.id).update({
    data: {
      backup: 1
    },
    success(res){
      return '更新成功'
    }
  })
}