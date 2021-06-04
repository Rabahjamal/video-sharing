const services = require('../services')
const { validationResult } = require('express-validator/check');

module.exports = {
  get_home_page(req, res) {
    res.status(200).send("video sharing home page");
  },

  register(req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() });
        return;
    }

    services.users.saveUserToDatabase(req.body, (err, result) => {
      if(err)
        res.status(400).send(err.message);
      else
        res.json({accessToken: result.accessToken, refreshToken: result.refreshToken});
    });
  },

  login(req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() });
        return;
    }

    services.users.authenticateUser(req.body, (err, result) => {
      if(err)
        res.status(401).send(err.message);
      else
        res.json({accessToken: result.accessToken, refreshToken: result.refreshToken});
    })
  },

  refresh(req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() });
        return;
    }

    services.users.refreshToken(req.body.refreshToken, (err, accessToken) => {
      if(err)
        res.status(403).send(err.message);
      else
        res.json({accessToken: accessToken})
    })
  },

  logout(req, res)
  {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() });
        return;
    }

    services.users.logoutUser(req.body.refreshToken, (err) => {
      if(err)
        res.status(404).send();
      else
        res.status(204).send();
    })
  }
}
