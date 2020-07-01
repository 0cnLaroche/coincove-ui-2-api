var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var morganLogger = require('morgan');
var dotenv = require('dotenv');
var mongoose = require('mongoose');

var logger = require('./logger');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var itemsRouter = require('./routes/items');
var loginRouter = require('./routes/login');
var filesRouter = require('./routes/files');

/*
 * Load environment variables
 */
dotenv.config(); 

//CORS middleware
var cors = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
}

/* Create connection to datasource */
mongoose.connect(process.env.DATASOURCE, {useNewUrlParser: true, useUnifiedTopology: true});
var db = mongoose.connection;
db.once('open', () => {
    logger.info("Connected to datasource");
})

var app = express();

const contextPath = process.env.CONTEXT_PATH;

app.use(cors);
app.use(morganLogger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(process.env.WEBAPP_DISTRIBUTION, 'build')));

/*
 * Web App route
 */
app.use('/', indexRouter);

/*
 * API routes
 */
app.use(path.join(contextPath, '/users'), usersRouter);
app.use(path.join(contextPath, '/items'), itemsRouter);
app.use(path.join(contextPath, '/login'), loginRouter);
app.use(path.join(contextPath, '/files'), filesRouter);

logger

module.exports = app;
