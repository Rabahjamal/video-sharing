const services = require('../services')
const fs = require('fs');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      const upload_dir = 'uploads/' + file.originalname + '-' + Date.now() + "/";
      fs.mkdir(upload_dir, (err) => {
          if (err) {
              console.log("mkdir error: " + err.message);
              return console.error(err);
          }
          cb(null, upload_dir);
        });
    },

    filename: function(req, file, cb) {
      //  console.log("File type: "+file.mimetype);
        cb(null, file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    let supportedFormats = new Set(["video/ogg", "video/webm", "video/avi",
                                    "video/x-matroska", "video/h264", "video/mp4", "video/raw"]);
    if (supportedFormats.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('The video file format is not supported'), false);
    }
  }

module.exports = {

  upload(req, res) {
    const uploadFile = multer({ storage: storage, fileFilter: fileFilter }).single('video');

    uploadFile(req, res, function(err) {
      //console.log(req.body);

        // we will implement the validation latter
        if (req.fileValidationError) {
            return res.status(401).send(req.fileValidationError);
        }
        else if (err instanceof multer.MulterError) {
            return res.status(402).send(err);
        }
        else if (err) {
            console.log(err.message)
            return res.status(404).send(err.message);
        }
        else if (!req.file) {
            return res.status(405).send('Please make sure you selected a video file to upload.');
        }

        services.videos.saveVideoToDatabase(req.file, req.body, {id: req.payload.id, username: req.payload.user_name}, (err, result) => {
            if(err)
              res.status(400).send(err.message);
            else
              res.send(`Your video is uploaded and processed successfully`);
        })
    });
  },

  watch(req, res) {
    console.log(req.params.id);
    console.log(req.params.filename);
    console.log("----------------------------------------------------");
    if(req.params.filename == "master.m3u8") {
      services.videos.incrementViewsCount(req.params.id, (err) => {
        if(err) {
          res.status(400).send(err.message);
        }
      });
    }
    services.videos.getVideoPath(req.params.id, (err, path) => {
      if(err) {
        res.status(400).send(err.message);
      } else {
        fs.readFile(path + req.params.filename, (error, content) => {
          if (error) {
            res.status(400).send(error.message);
          }
          else {
            //res.send(content);
            res.set('Access-Control-Allow-Origin', '*');
            res.end(content, 'utf-8');
          }
        });

      }
    })
  },

  getVideo(req, res) {

    services.videos.getVideo(req.params.id, (err, result) => {
      if(err) {
        res.status(400).send(err.message);
      } else {

        if(result['likes']) {
            if(result['likes'].find(elm => elm == req.payload.id)) {
                result['liked'] = 1;
            } else {
                result['liked'] = 0;
            }
        } else {
            result['liked'] = 0;
        }

        if(result['dislikes']) {
            if(result['dislikes'].find(elm => elm == req.payload.id)) {
                result['disliked'] = 1;
            } else {
                result['disliked'] = 0;
            }
        } else {
            result['disliked'] = 0;
        }
        res.json(result);
      }
    });

  },

  getVideos(req, res) {
    services.videos.getAllVideos((err, result) => {
      if(err) {
        res.status(400).send(err.message);
      } else {
        result.forEach((item, i) => {
            if(item['likes']) {
                if(item['likes'].find(elm => elm == req.payload.id)) {
                    item['liked'] = 1;
                } else {
                    item['liked'] = 0;
                }
            } else {
                item['liked'] = 0;
            }

            if(item['dislikes']) {
                if(item['dislikes'].find(elm => elm == req.payload.id)) {
                    item['disliked'] = 1;
                } else {
                    item['disliked'] = 0;
                }
            } else {
                item['disliked'] = 0;
            }
        });
        res.json(result);
      }
    });
  },

  getVideosNoAuth(req, res) {
    services.videos.getAllVideos((err, result) => {
      if(err) {
        res.status(400).send(err.message);
      } else {
        res.json(result);
      }
    });
  },

  getUserVideos(req, res) {
    services.videos.getVideosByUserID(req.params.user_id, (err, result) => {
      if(err) {
        res.status(400).send(err.message);
      } else {
        res.json(result);
      }
    });
  }

}
