var jwt = require('jsonwebtoken');
var dotenv = require('dotenv');
var logger = require('./logger');


// Loading Environement varibles
dotenv.config();

/*
 * JSON Web Token authentication middleware
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["x-access-token"] || req.headers['authorization'];
    logger.debug(req.headers);
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
        // NOT AUTHORIZED
        return res.sendStatus(401);
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err , user) => {
        if (err) {
            logger.error(err);
            // FORBIDDEN
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    })
}

const generateAccessToken = (content) => {
    return jwt.sign(content, process.env.ACCESS_TOKEN_SECRET, 
        {expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "30m"})
}

module.exports = {authenticateToken, generateAccessToken};