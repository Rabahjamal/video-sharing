const db = require('../db')
const { exec } = require("child_process");

var cache = {};

module.exports = {
  // TODO: implement this function
  saveVideoToDatabase(videoFile, videoInfo, userData, callback){
      const videos_collection = db.getVideoCollection();
      const datetime = new Date();
      const videoObject = { url: videoFile.destination,
                            title: videoInfo.title,
                            description: videoInfo.description,
                            datetime: datetime.toString(),
                            views: 0,
                            likes: 0,
                            dislikes: 0,
                            user: userData};
      //console.log(videoObject);

     /// processing part
       var output_path = videoFile.destination;
       output_path = output_path.slice(0, -1);
       //console.log(output_path);
       const command = "./to_hls.sh \"" + videoFile.path + "\" \"" + output_path + "\"";
       exec(command, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                callback(new Error('Failed to process the input video!'));
            }
            else if (stderr) {
                console.log(`stderr: ${stderr}`);
                console.log("Processing is done!");
                videos_collection.insertOne(videoObject, (err, result) => {
                  if(err)
                    callback(err);
                  else {
                    callback(null);
                  }
                })
                return;
            }
            //console.log(`stdout: ${stdout}`);
      });
     ///


  },

  getVideoPath(videoId, callback) {

    if(videoId in cache) {
      console.log("Found the video path in the cache");
      callback(null, cache[videoId]);
    } else {
      console.log("Access the database to get the video path");
      const videos_collection = db.getVideoCollection();

      videos_collection.findOne({_id: db.constructObjectId(videoId)}, (err, result) => {
        if(err)
          callback(err);
        else if(!result) {
          callback(new Error("Video id is wrong!"))
        }
        else {
          cache[videoId] = result.url;
          callback(null, result.url);
        }
      })
    }

  },

  incrementViewsCount(videoId, callback) {
    const videos_collection = db.getVideoCollection();

    videos_collection.updateOne({_id: db.constructObjectId(videoId)}, {$inc: {views: 1}}, (err, result) => {
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

  getVideo(id, callback) {
    const videos_collection = db.getVideoCollection();

    videos_collection.findOne({_id: db.constructObjectId(id)}, (err, result) => {
      if(err)
        callback(err);
      else if(!result) {
        callback(new Error("Video id is wrong!"))
      }
      else {
        callback(null, result);
      }
    })
  },

  getAllVideos(callback) {
    const videos_collection = db.getVideoCollection();

    videos_collection.find({}).toArray((err, result) => {
      if(err) {
        callback(err);
      } else {
        callback(null, result);
      }
    });
  },

  getVideosByUserID(user_id, callback) {
    const videos_collection = db.getVideoCollection();

    /*users_collection.findOne({_id: db.constructObjectId(user_id)}, (err, result) => {
      if(err) {
        callback(err);
      } else {

        callback(null, result.videos)
      }
    });*/
    videos_collection.find({"user.id": user_id}).toArray((err, result) => {
      if(err) {
        callback(err);
      } else {
        console.log(result);
        callback(null, result);
      }
    });

  }


}
