var express = require('express');
var dotenv = require('dotenv');
var router = express.Router();
dotenv.config();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(path.join(process.env.WEBAPP_DISTRIBUTION, 'build', index.html))
});

module.exports = router;
