require('dotenv').config({path: __dirname + '/.env'})

const express = require('express');
const logger = require('morgan');
const errorhandler = require('errorhandler');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const routes = require('./routes');

let app = express();

app.use(bodyParser.json());
app.use(cookieParser());
app.use(logger('dev'));
app.use(errorhandler());

app.use(routes)

app.listen(3000);
