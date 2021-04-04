const db = require('../db')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const checkIfEmailExists = (user, users_collection, callback) => {
    users_collection.findOne({email: user.email}, (err, result) => {
      if(err)
        callback(err);
      else if(result)
        callback(new Error('Email already Exists!'))
      else
        callback(null);
    });
}

const checkUserCredentials = (userCredentials, users_collection, callback) => {
    users_collection.findOne({email: userCredentials.email}, (err, user) => {
      if(err || !user || !bcrypt.compareSync(userCredentials.password, user.password)) {
        callback(new Error('Credentials are invalid'));
      }
      else {
        callback(null, user);
      }
    })
}

const findRefreshToken = (token, users_collection, callback) => {
  users_collection.findOne({refreshToken: token}, (err, result) => {
    if(err || !result)
      callback(new Error('Refresh token does not exist in our database'));
    else
      callback(null);
  })
}

const findUserByRefreshToken = (token, users_collection, callback) => {
  users_collection.findOne({refreshToken: token}, (err, user) => {
    if(err || !user) {
      callback(new Error('Failed to find the refresh token in our database'));
    }
    else
      callback(null, user);
  })
}

const generateAccessToken = (user) => {
    const payload = {email: user.email, username: user.username};
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      algorithm: "HS256",
      expiresIn: 120
    })

    return accessToken;
}

const generateRefreshToken = (user) => {
    const payload = {email: user.email, username: user.username};
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
      algorithm: "HS256",
      expiresIn: 86400
    })

    return refreshToken;
}

const verfiyRefreshToken = (token, callback) => {
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
    jwt.verify(token, refreshTokenSecret, (err, payload) => {
      if(err)
        callback(err);
      else
        callback(null, payload);
    })
}


module.exports = {

  saveUserToDatabase(user, callback)
  {
      var users_collection = db.getUserCollection();
      checkIfEmailExists(user, users_collection, (err) => {
        if(err) {
          callback(err);
        }
        else {  // Email is unique
          // hash the password
          const salt = bcrypt.genSaltSync(10);
          const hash = bcrypt.hashSync(user.password, salt);
          user.password = hash;

          // generate refresh token for this user
          const refreshToken = generateRefreshToken(user);
          user.refreshToken = refreshToken;

          // insert user object to database
          users_collection.insertOne(user, (err, result) => {
            if(err)
              callback(err);
            else {
              const accessToken = generateAccessToken(user);
              callback(null, {accessToken: accessToken, refreshToken: refreshToken});
            }
          })
        }
      })
  },

  authenticateUser(userCredentials, callback)
  {
      const users_collection = db.getUserCollection();
      checkUserCredentials(userCredentials, users_collection, (err, user) => {
        if(err) {
          callback(err);
        }
        else {
          const refreshToken = generateRefreshToken(user);
          users_collection.updateOne({email: user.email}, {$set: {refreshToken: refreshToken}}, (err, result) => {
            if(err)
              callback(err)
            else {
              const accessToken = generateAccessToken(user);
              callback(null, {accessToken: accessToken, refreshToken: refreshToken});
            }
          })
        }
      })
  },

  refreshToken(token, callback)
  {
    const users_collection = db.getUserCollection();
    findRefreshToken(token, users_collection, (err) => {
      if(err) {
        callback(err);
      }
      else {
        verfiyRefreshToken(token, (err, payload) => {
          if(err)
            callback(err);
          else {
              const accessToken = generateAccessToken(payload);
              callback(null, accessToken);
          }
        })
      }
    })
  },

  logoutUser(token, callback)
  {
    const users_collection = db.getUserCollection();
    findUserByRefreshToken(token, users_collection, (err, user) => {
      if(err) {
        callback(err);
      }
      else {
        users_collection.updateOne({email: user.email}, {$set: {refreshToken: ""}}, (err, result) => {
          if(err) {
            callback(err);
          }
          else
            callback(null);
        })
      }
    })
  }
}
