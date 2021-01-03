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
              controllers.auth.logout)

// dummy routes for testing
router.get('/', middlewares.authenticateJWT, controllers.auth.get_home_page)
router.get('/video', middlewares.authenticateJWT, (req, res) => {
  res.status(200).send("video #1");
})

module.exports = router
