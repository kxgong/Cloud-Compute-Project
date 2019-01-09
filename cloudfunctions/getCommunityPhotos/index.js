// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _=db.command
const MAX_LIMIT = 1 //每次请求1张图片


// 云函数入口函数
exports.main = async(event, context) => {
  //const wxContext = cloud.getWXContext()


  // 先取出对应社区的记录总数
  const countResult = await db.collection('CommunityPhotos').where({ communityId: _.eq(event.communityId) }).count()
  const total = countResult.total
  //return total


  if (event.current > total) {
    //console.log('超过数据库记录数');
    return -1
  } else {
    // 承载所有读操作的 promise 的数组
    const tasks = []
    for (let i = 0; i < 10; i++,event.current++) {
      if (event.current > total) {
        //console.log('超过数据库记录数');
        return tasks
        //break;
      }
      if(event.current==1){
       await db.collection('CommunityPhotos').where({ communityId: _.eq(event.communityId) }).orderBy('timestamp','desc').limit(MAX_LIMIT).get().then(res=>{ 
          tasks.push(res.data[0])
        })
      }
      else{
        await db.collection('CommunityPhotos').where({ communityId: _.eq(event.communityId) }).orderBy('timestamp', 'desc').skip(event.current-1).limit(MAX_LIMIT).get().then(res=>{
          tasks.push(res.data[0])
        })
      }
    }

    return tasks
    //console.log(tasks)
    // 等待所有
    // return (await Promise.all(tasks).then(res=>{
    //   data:tasks
    // }))

    // return (await Promise.all(tasks)).reduce((acc, cur) => ({
    //   data: acc.data.concat(cur.data),
    //   errMsg: acc.errMsg,
    // }))
  }

  // return {
  //   event,
  //   openid: wxContext.OPENID,
  //   appid: wxContext.APPID,
  //   unionid: wxContext.UNIONID,
  // }
}