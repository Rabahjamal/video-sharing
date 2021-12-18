const services = require('../services')


module.exports = {

  views(req, res) {
    services.stats.numOfViews(req.params.id, (err, result) => {
      if(err) {
          res.status(400).send(err.message);
      } else {
        res.json({views: result});
      }
    });
  },

  likes(req, res) {
    services.stats.numOfLikes(req.params.id, (err, result) => {
      if(err) {
          res.status(400).send(err.message);
      } else {
        res.json({Likes: result});
      }
    });
  },

  dislikes(req, res) {
    services.stats.numOfDislikes(req.params.id, (err, result) => {
      if(err) {
          res.status(400).send(err.message);
      } else {
        res.json({Dislikes: result});
      }
    });
  },

  like(req, res) {
    services.stats.likeVideo(req.params.id, req.payload.id, (err) => {
      if(err) {
          res.status(400).send(err.message);
      } else {
        res.status(201).send("You liked a video");
      }
    });
  },

  dislike(req, res) {
    services.stats.dislikeVideo(req.params.id, req.payload.id, (err) => {
      if(err) {
          res.status(400).send(err.message);
      } else {
        res.status(201).send("You disliked a video");
      }
    });
  }

}
