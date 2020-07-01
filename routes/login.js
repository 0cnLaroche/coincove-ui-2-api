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
    let user;
    let hash;
    await User.findOne({
        email: email
    }, (err, obj) => {
        user = {
            _id: obj._id,
            isAdmin: obj.isAdmin
        };
        hash = obj.password;
    });
    let isSame = await bcrypt.compare(password, hash)
        .catch(e => console.log(password + " " + hash));

    if (!isSame) {
        return res.status(401).send("Wrong email or password");
    }
    const token = generateAccessToken(user);
    res.json({_id: user._id, token: token});
})

module.exports = router;