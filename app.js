const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morganLogger = require('morgan');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const logger = require('./logger');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const itemsRouter = require('./routes/items');
const loginRouter = require('./routes/login');
const filesRouter = require('./routes/files');
const ordersRouter = require('./routes/orders');


/*
 * Load environment variables
 */
dotenv.config(); 

//CORS middleware
const cors = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
}

/* Create connection to datasource */
mongoose.connect(process.env.DATASOURCE, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.once('open', () => {
    logger.info("Connected to datasource");
})

const app = express();

const apiContextPath = process.env.API_CONTEXT_PATH;

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
app.use(path.join(apiContextPath, '/users'), usersRouter);
app.use(path.join(apiContextPath, '/items'), itemsRouter);
app.use(path.join(apiContextPath, '/login'), loginRouter);
app.use(path.join(apiContextPath, '/files'), filesRouter);
app.use(path.join(apiContextPath, '/orders'), ordersRouter);

/*
 * RedirectApp redirects all request to HTTPS
 */
const redirectApp = express();

redirectApp.all('*', (req, res) => {
    res.redirect(301, `https://${req.headers.host}${req.url}`);
})

exports.app = app;
exports.redirectApp = redirectApp;
