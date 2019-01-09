// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()


// 云函数入口函数
exports.main = async (event, context) => {
  const fileList = [event.fileID,]
  const result=await cloud.getTempFileURL({
    fileList,
  })
    return result.fileList
}