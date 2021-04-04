const mongodb = require('mongodb')

const url = 'mongodb://localhost:27017'

let db;
let users_collection;
let videos_collection;

mongodb.MongoClient.connect(url, { useNewUrlParser: true, poolSize: 10 }, (err, client) => {
    if(err)console.error(error)
    else {
      console.log("Connected successfully");
      db = client.db('video-sharing');
      users_collection = db.collection('users');
      videos_collection = db.collection('videos');
    }
  })

const getUserCollection = () => {
  //  console.log(users_collection)
    return users_collection;
}

const getVideoCollection = () => {
  return videos_collection;
}

const constructObjectId = (id) => {
  if(mongodb.ObjectID.isValid(id)) {
    return mongodb.ObjectID(id);
  } else {
    return null;
  }

}


module.exports = {
  getUserCollection,
  getVideoCollection,
  constructObjectId
}
