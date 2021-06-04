require('dotenv').config({path: __dirname + '/.env'})

const express = require('express');
const logger = require('morgan');
const errorhandler = require('errorhandler');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
//const cors = require("cors")
const routes = require('./routes');

let app = express();

app.use(bodyParser.json());
app.use(cookieParser());
app.use(logger('dev'));
app.use(errorhandler());

// const whitelist = ["http://localhost:3001"]
// const corsOptions = {
//   origin: function (origin, callback) {
//     if (!origin || whitelist.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error("Not allowed by CORS"))
//     }
//   },
//   credentials: true,
// }
// app.use(cors(corsOptions))

app.use(routes)

app.listen(3000);
