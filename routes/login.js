var express = require('express');
const bcrypt = require("bcrypt");
var { generateAccessToken } = require('../jwt');
var { User } = require('../model/user');
var logger = require('../logger');
var router = express.Router();
var mockedToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjb2luY292ZS11aS0yIiwibmFtZSI6IlNhbXVlbCBMYXJvY2hlIiwicm9sZSI6ImFkbWluIiwiZW1haWwiOiJzYW11ZWxsYXJvY2hlQGxpdmUuY2EiLCJpYXQiOjE1MTYyMzkwMjJ9.hlUVKoHw1dFJq0keEhPeWQ-dkXFYf2n4FcK4e2Y6qEg";

/* POST login with email/password */
router.post("/", async (req,res) => {
    let { email, password } = req.body;
    let user = await User.findOne({email: email}).exec();
    let hash = user.password;
    bcrypt.compare(password, hash)
        .catch(e => {
            logger.error(password + " : " + hash)
            return res.status(401).send("Wrong email or password");
        })
        .then(isSame => {
            if (isSame) {
                const token = generateAccessToken({_id: user._id, isAdmin: user.isAdmin});
                logger.debug('%O', {_id: user._id, token: token, isAdmin: user.isAdmin})
                res.json({_id: user._id, token: token, isAdmin: user.isAdmin});
            }
        } )
})

module.exports = router;