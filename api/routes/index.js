const express = require('express')
const { body } = require('express-validator');
const controllers = require('../controllers')
const middlewares = require('../middlewares')
const router = express.Router()

// authentication routes
router.post('/login',
            body('email', 'Invalid email').exists().isEmail(),
            body('password', 'password does not exists').exists(),
            controllers.auth.login);

router.post('/register',
            body('user_name', 'user_name does not exists').exists(),
            body('email', 'Invalid email').exists().isEmail(),
            body('password', 'password does not exists').exists(),
            controllers.auth.register);

router.post('/refresh',
            body('refreshToken', 'refreshToken does not exists').exists(),
            controllers.auth.refresh);

router.delete('/logout',
              body('refreshToken', 'refreshToken does not exists').exists(),
              controllers.auth.logout);

// videos routes
router.post('/upload', middlewares.authenticateJWT, controllers.videos.upload);

router.get('/watch/:id/:filename', controllers.videos.watch)

router.get('/videos', controllers.videos.getVideos);

router.get('/videos/:user_id/', middlewares.authenticateJWT, controllers.videos.getUserVideos)

// stats routes
router.get('/views/:id', controllers.stats.views);
router.get('/likes/:id', controllers.stats.likes);
router.get('/dislikes/:id', controllers.stats.dislikes);

router.put('/like/:id', middlewares.authenticateJWT, controllers.stats.like);
router.put('/dislike/:id', middlewares.authenticateJWT, controllers.stats.dislike);


// dummy routes for testing
router.get('/', middlewares.authenticateJWT, controllers.auth.get_home_page)
router.get('/video', middlewares.authenticateJWT, (req, res) => {
  res.status(200).send("video #1");
})

module.exports = router
