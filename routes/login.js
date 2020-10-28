var express = require('express');
const bcrypt = require("bcrypt");
var { generateAccessToken } = require('../jwt');
var { User } = require('../model/user');
var logger = require('../logger');
var router = express.Router();

/* POST login with email/password */
router.post("/", async (req, res) => {
    let { email, password } = req.body;
    let user = await User.findOne({email: email}).exec();
    if (!user) {
        return res.status(401).send();
    }
    let hash = user.password;
    bcrypt.compare(password, hash)
        .catch(e => {
            logger.error("Error while comparing password and hash: { " 
                + password + " : " + hash + "}")
            return res.status(401).send();
        })
        .then(isSame => {
            if (isSame) {
                const token = generateAccessToken({_id: user._id, isAdmin: user.isAdmin});
                logger.debug('%O', {_id: user._id, token: token, isAdmin: user.isAdmin})
                res.json({_id: user._id, token: token, isAdmin: user.isAdmin});
            } else {
                logger.debug("Incorrect password");
                res.sendStatus(401);
            }
        } )
})

module.exports = router;