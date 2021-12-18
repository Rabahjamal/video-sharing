const db = require('../db')



const checkIfUserLikesThisVideo = (videoId, userId, callback) => {
  const videos_collection = db.getVideoCollection();
  videos_collection.findOne({_id: db.constructObjectId(videoId), likes: userId}, (err, result) => {
    if(err) {
      callback(err);
    } else if(result) {
      callback(null, result);
    } else {
      callback(null);
    }
  });
}

const checkIfUserDislikesThisVideo = (videoId, userId, callback) => {
  const videos_collection = db.getVideoCollection();
  videos_collection.findOne({_id: db.constructObjectId(videoId), dislikes: userId}, (err, result) => {
    if(err) {
      callback(err);
    } else if(result) {
      callback(null, result);
    } else {
      callback(null);
    }
  });
}

module.exports = {

  likeVideo(videoId, userId, callback) {
    const videos_collection = db.getVideoCollection();
    checkIfUserLikesThisVideo(videoId, userId, (err, res) => {
      if(err || res) {
          callback(new Error("Failed to like"));
      } else {
          checkIfUserDislikesThisVideo(videoId, userId, (err, res2) => {
            if(err) {
                callback(err);
            } else if(res2) {
                videos_collection.updateOne({_id: db.constructObjectId(videoId)}, {$pull: {dislikes: userId}}, (err, result) => {
                  if(err) {
                    callback(err);
                  } else {
                      videos_collection.updateOne({_id: db.constructObjectId(videoId)}, {$push: {likes: userId}}, (err, result) => {
                        if(err) {
                          callback(err);
                        } else if(!result) {
                          callback(new Error("Video id is wrong!"));
                        }
                        else {
                          callback(null);
                        }
                    })
                  }
                })
            } else {
                videos_collection.updateOne({_id: db.constructObjectId(videoId)}, {$push: {likes: userId}}, (err, result) => {
                  if(err) {
                    callback(err);
                  } else if(!result) {
                    callback(new Error("Video id is wrong!"));
                  }
                  else {
                    callback(null);
                  }
              })
            }
          })
      }
    })
  },

  dislikeVideo(videoId, userId, callback) {
    const videos_collection = db.getVideoCollection();
    checkIfUserDislikesThisVideo(videoId, userId, (err, res) => {
      if(err || res) {
          callback(new Error("Failed to dislike"));
      } else {
        checkIfUserLikesThisVideo(videoId, userId, (err, res2) => {
          if(err) {
              callback(err);
          } else if(res2) {
              videos_collection.updateOne({_id: db.constructObjectId(videoId)}, {$pull: {likes: userId}}, (err, result) => {
                if(err) {
                  callback(err);
                } else {
                    videos_collection.updateOne({_id: db.constructObjectId(videoId)}, {$push: {dislikes: userId}}, (err, result) => {
                      if(err) {
                        callback(err);
                      } else if(!result) {
                        callback(new Error("Video id is wrong!"));
                      }
                      else {
                        callback(null);
                      }
                  })
                }
              })
          } else {
              videos_collection.updateOne({_id: db.constructObjectId(videoId)}, {$push: {dislikes: userId}}, (err, result) => {
                if(err) {
                  callback(err);
                } else if(!result) {
                  callback(new Error("Video id is wrong!"));
                }
                else {
                  callback(null);
                }
            })
          }
        })
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
        if(result.likes)
            callback(null, result.likes.length);
        else
            callback(null, 0);
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
        if(result.dislikes)
            callback(null, result.dislikes.length);
        else
            callback(null, 0);
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
