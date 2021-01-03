const mongodb = require('mongodb')

const url = 'mongodb://localhost:27017'

let db;
let users_collection;

mongodb.MongoClient.connect(url, { useNewUrlParser: true, poolSize: 10 }, (err, client) => {
    if(err)console.error(error)
    else {
      console.log("Connected successfully");
      db = client.db('video-sharing');
      users_collection = db.collection('users');
    }
  })

const getUserCollection = () => {
  //  console.log(users_collection)
    return users_collection;
}


module.exports = {
  getUserCollection
}
