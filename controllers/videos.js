const services = require('../services')
const fs = require('fs');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      const upload_dir = 'uploads/' + file.originalname + '-' + Date.now() + "/";
      fs.mkdir(upload_dir, (err) => {
          if (err) {
              return console.error(err);
          }
        });
        cb(null, upload_dir);
    },

    filename: function(req, file, cb) {
        console.log("File type: "+file.mimetype);
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

        // we will implement the validation latter
        if (req.fileValidationError) {
            return res.status(400).send(req.fileValidationError);
        }
        else if (err instanceof multer.MulterError) {
            return res.status(400).send(err);
        }
        else if (err) {
            return res.status(400).send(err.message);
        }
        else if (!req.file) {
            return res.status(400).send('Please make sure you selected a video file to upload.');
        }

        services.videos.saveVideoToDatabase(req.file, req.body, req.payload.email, (err, result) => {
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
  }

}
