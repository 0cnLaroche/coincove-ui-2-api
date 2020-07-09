var express = require('express');
const bcrypt = require("bcrypt");
var { authenticateToken, generateAccessToken } = require('../jwt');
var { User, validateUser } = require('../model/user');
var logger = require('../logger');
var router = express.Router();

/* GET users listing. */
router.get('/:id', authenticateToken, async (req, res) => {
  if ((req.user._id != req.param('id'))
  || req.user.isAdmin) {
    return res.status(401).send();
  }
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

/* POST new user */
router.post('/', async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  let user = await User.findOne({email: req.body.email});
  if(user) {
    return res.status(400).send("User already exist");
  }

  user = new User({
    fname: req.body.fname,
    lname: req.body.lname,
    email: req.body.email,
    password: req.body.password
  });
  user.password = await bcrypt.hash(user.password, 10);
  await user.save();

  const token = generateAccessToken({
    _id: user._id,
    email: user.email,
    isAdmin: user.isAdmin
  })
  res.json(token);
})

module.exports = router;
