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
        .get("0.0.0.0:3000/videos")
        .end((err, data) => {
          if(err) {
            res.status(500).send(err.message);
          } else {
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

app.get('/videos', getAccessToken, (req, res) => {

  request
  .get("0.0.0.0:3000/videos")
  .end((err, data) => {
    if(err) {
      res.status(500).send(err.message);
    } else {
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
          console.log(data.body)
          console.log(data.body[0].user.username)
          console.log(data.body.length)
          //res.render('videos', {videos: data.body, libs: ['level-selector']})

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
      console.log(data.body)
      //res.render('videos', {videos: data.body, libs: ['level-selector']})

      res.render('video', {video: data.body, libs: ['level-selector']});
    }
  })
})

app.listen(8080);
console.log('8080 is the magic port');
