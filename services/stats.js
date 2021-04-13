const db = require('../db')

module.exports = {

  likeVideo(videoId, callback) {
    const videos_collection = db.getVideoCollection();

    videos_collection.updateOne({_id: db.constructObjectId(videoId)}, {$inc: {likes: 1}}, (err, result) => {
      if(err) {
        callback(err);
      } else if(!result) {
        callback(new Error("Video id is wrong!"));
      }
      else {
        callback(null);
      }
    })
  },

  dislikeVideo(videoId, callback) {
    const videos_collection = db.getVideoCollection();

    videos_collection.updateOne({_id: db.constructObjectId(videoId)}, {$inc: {dislikes: 1}}, (err, result) => {
      if(err) {
        callback(err);
      } else if(!result) {
        callback(new Error("Video id is wrong!"));
      }
      else {
        callback(null);
      }
    })
  },

  numOfLikes(videoId, callback) {
    const videos_collection = db.getVideoCollection();

    videos_collection.findOne({_id: db.constructObjectId(videoId)}, (err, result) => {
      if(err)
        callback(err);
      else if(!result) {
        callback(new Error("The video id is not correct!"))
      }
      else {
        callback(null, result.likes);
      }
    })
  },

  numOfDislikes(videoId, callback) {
    const videos_collection = db.getVideoCollection();

    videos_collection.findOne({_id: db.constructObjectId(videoId)}, (err, result) => {
      if(err)
        callback(err);
      else if(!result) {
        callback(new Error("The video id is not correct!"))
      }
      else {
        callback(null, result.dislikes);
      }
    })
  },

  numOfViews(videoId, callback) {
    const videos_collection = db.getVideoCollection();

    videos_collection.findOne({_id: db.constructObjectId(videoId)}, (err, result) => {
      if(err)
        callback(err);
      else if(!result) {
        callback(new Error("The video id is not correct!"))
      }
      else {
        callback(null, result.views);
      }
    })
  }


}
