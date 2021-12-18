// load the things we need
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const request = require('superagent');
const cookieParser = require('cookie-parser')
const FormData = require('form-data');
const multer  = require('multer');

var app = express();

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(cookieParser())

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static('static'));

app.use('/js/libs', express.static(path.join(process.cwd(), 'node_modules/jquery/dist'), { maxAge: 31557600000 }))


//middlewares
const getAccessToken = (req, res, next) => {
    if(req.cookies.accessToken) {
        next();
    } else if(req.cookies.refreshToken) {
      request
      .post("0.0.0.0:3000/refresh")
      .send({refreshToken: req.cookies.refreshToken})
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .end((err, data) => {
        if(err) {
          res.status(500).send(err.message);
        } else {
          res.cookie("accessToken", data.body.accessToken, {httpOnly: true, maxAge: 3600000})  // expires in 3600 seconds
          next()
        }
      })
    } else {
        res.redirect('/');
    }
}

const isAuthenticated = (req) => {
    if(req.cookies.refreshToken) {
        return true;
    } else {
        return false;
    }
}

// index page
app.get('/', function(req, res) {
    if(isAuthenticated(req)) {
        res.redirect('/videos');
    } else {
        request
        .get("0.0.0.0:3000/videosNoAuth")
        .end((err, data) => {
          if(err) {
            res.status(500).send(err.message);
          } else {
            data.body.forEach((item, i) => {
              if(item['likes']) {
                item.num_of_likes = item['likes'].length
              } else {
                item.num_of_likes = 0;
              }

              if(item['dislikes']) {
                item.num_of_dislikes = item['dislikes'].length
              } else {
                item.num_of_dislikes = 0;
              }
              //item.num_of_likes = item['likes'].length
              //item.num_of_dislikes = item['dislikes'].length
            });
            res.render('index', {videos: data.body, libs: ['level-selector']})
          }
        })
    }
});

app.get('/upload', getAccessToken, (req, res) => {
    res.render('upload');
})

app.post('/upload', getAccessToken, multer().single('video'), (req, res) => {
    console.log("got the request");
    const fileRecievedFromClient = req.file; //File Object sent in 'fileFieldName' field in multipart/form-data
    console.log(fileRecievedFromClient)

    console.log(req.body.title);
    console.log(req.body.description);

    request
    .post("0.0.0.0:3000/upload")
    .attach('video', fileRecievedFromClient.buffer, fileRecievedFromClient.originalname)
    .field('title', req.body.title)
    .field('description', req.body.description)
    .set("Authorization", "Bearer " + req.cookies.accessToken)
    .end((err, data) => {
      if(err) {
        res.status(500).send(err.message);
      } else {
        //res.render('home');
        res.json({message: "file is uploaded successfully"})
      }
    })
})

app.get('/register', (req, res) => {
    if(isAuthenticated(req)) {
        res.redirect('/videos');
    } else {
        res.render('register');
    }
});

app.post('/register', (req, res) => {
  if(isAuthenticated(req)) {
      res.redirect('/');
  } else {

      request
      .post("0.0.0.0:3000/register")
      .send({user_name: req.body.user_name, email: req.body.email, password: req.body.password})
      .set("Accept", "application/json")
      .set("Content-Type", "application/json")
      .end((err, data) => {
        if(err) {
          res.status(500).send(err.message);
        } else {
          //console.log(data.body);
          res.cookie("accessToken", data.body.accessToken, {httpOnly: true})
          res.cookie("refreshToken", data.body.refreshToken, {httpOnly: true})
          res.redirect('/videos');
        }
      })
  }
});

app.get('/login', (req, res) => {
    if(isAuthenticated(req)) {
        res.redirect('/videos');
    } else {
        res.render('login');
    }
});

app.post('/login', (req, res) => {
    if(isAuthenticated(req)) {
        res.redirect('/');
    } else {
        request
        .post("0.0.0.0:3000/login")
        .send({email: req.body.email, password: req.body.password})
        .set("Accept", "application/json")
        .set("Content-Type", "application/json")
        .end((err, data) => {
          if(err) {
            res.status(500).send(err.message);
          } else {
            //console.log(data.body);
            res.cookie("accessToken", data.body.accessToken, {httpOnly: true, maxAge: 3600000})  // expires in 3600 seconds
            res.cookie("refreshToken", data.body.refreshToken, {httpOnly: true, maxAge: 86400000}) // expires in one day
            res.redirect('/videos');
          }
        })
    }


});

app.post('/logout', (req, res) => {
  if(isAuthenticated(req)) {
    request
    .delete("0.0.0.0:3000/logout")
    .send({refreshToken: req.cookies.refreshToken})
    .set("Accept", "application/json")
    .set("Content-Type", "application/json")
    .end((err, data) => {
      if(err) {
        res.status(500).send(err.message);
      } else {
        console.log("successfully logged out")
        //res.cookie("refreshToken", {httpOnly: true, maxAge: 0})
        res.clearCookie("refreshToken")
        res.clearCookie("accessToken")
        res.redirect('/');
      }
    });
  } else {
      res.redirect('/');
  }
});

app.get('/videos', getAccessToken, (req, res) => {

  request
  .get("0.0.0.0:3000/videos")
  .set("Authorization", "Bearer " + req.cookies.accessToken)
  .end((err, data) => {
    if(err) {
      res.status(500).send(err.message);
    } else {

      data.body.forEach((item, i) => {
        if(item['likes']) {
          item.num_of_likes = item['likes'].length
        } else {
          item.num_of_likes = 0;
        }

        if(item['dislikes']) {
          item.num_of_dislikes = item['dislikes'].length
        } else {
          item.num_of_dislikes = 0;
        }
      });
      console.log(data.body)
      res.render('videos', {videos: data.body, libs: ['level-selector']})
    }
  })
});

// profile routes
app.get('/profile/:id', getAccessToken, (req, res) => {
    request
    .get("0.0.0.0:3000/videos/"+req.params.id)
    .set("Authorization", "Bearer " + req.cookies.accessToken)
    .end((err, data) => {
      if(err) {
        res.status(500).send(err.message);
      } else {
        if(data.body.length == 0)
        {
          res.redirect('/videos');
        } else {
          data.body.forEach((item, i) => {
            if(item['likes']) {
              item.num_of_likes = item['likes'].length
            } else {
              item.num_of_likes = 0;
            }

            if(item['dislikes']) {
              item.num_of_dislikes = item['dislikes'].length
            } else {
              item.num_of_dislikes = 0;
            }
          });

          res.render('profile', { username: data.body[0].user.username,
                                  numberOfVideos: data.body.length,
                                  videos: data.body, libs: ['level-selector']});
        }
      }
    })

})

app.get('/video/:id', getAccessToken, (req, res) => {
  request
  .get("0.0.0.0:3000/video/"+req.params.id)
  .set("Authorization", "Bearer " + req.cookies.accessToken)
  .end((err, data) => {
    if(err) {
      res.status(500).send(err.message);
    } else {
        if(data.body['likes']) {
          data.body.num_of_likes = data.body['likes'].length
        } else {
          data.body.num_of_likes = 0;
        }

        if(data.body['dislikes']) {
          data.body.num_of_dislikes = data.body['dislikes'].length
        } else {
          data.body.num_of_dislikes = 0;
        }
        console.log(data.body);
        res.render('video', {video: data.body, libs: ['level-selector']});
    }
  })
})

app.put('/like/:id', getAccessToken, (req, res) => {
  console.log('--------------------------------'+req.params.id)
  request
  .put("0.0.0.0:3000/like/"+req.params.id)
  .set("Authorization", "Bearer " + req.cookies.accessToken)
  .end((err, data) => {
    if(err) {
      res.json({message: err.message});
    } else {
      res.json({message: "You liked this video"})
    }
  })
})

app.put('/dislike/:id', getAccessToken, (req, res) => {
  request
  .put("0.0.0.0:3000/dislike/"+req.params.id)
  .set("Authorization", "Bearer " + req.cookies.accessToken)
  .end((err, data) => {
    if(err) {
      res.json({message: err.message});
    } else {
      res.json({message: "You disliked this video"})
    }
  })
})

app.get('/videoStats/:id', (req, res) => {
  console.log('--------------------------------'+req.params.id)
  request
  .get("0.0.0.0:3000/likes/"+req.params.id)
  .end((err1, data1) => {
    if(err1) {
      res.json({message: err1.message});
    } else {
      console.log(data1.body)
      //res.json({Likes: data.body["Likes"]})
      request
      .get("0.0.0.0:3000/dislikes/"+req.params.id)
      .end((err2, data2) => {
        if(err2) {
          res.json({message: err2.message});
        } else {
          console.log(data2.body)
          res.json({Likes: data1.body["Likes"], Dislikes: data2.body["Dislikes"]})
        }
      })
    }
  })
})

/*app.get('/dislikes/:id', (req, res) => {
  request
  .get("0.0.0.0:3000/dislikes/"+req.params.id)
  .end((err, data) => {
    if(err) {
      res.json({error: err.message});
    } else {
      console.log(data.body)
      res.json({Dislikes: data.body["Dislikes"]})
    }
  })
})*/

app.listen(8080);
console.log('8080 is the magic port');
