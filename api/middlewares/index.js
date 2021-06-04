const jwt = require('jsonwebtoken')
require('dotenv').config({path: __dirname + '/.env'})

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
            if (err) {
                return res.sendStatus(403);
            }

            req.payload = payload;
            console.log("0: ")
            console.log(req.payload)
            next();
        });
    } else {
        res.sendStatus(401);
    }

};

module.exports = {
  authenticateJWT
}
