var jwt = require('jsonwebtoken');
const config = require('config');
var logger = require('./logger');

// Loading environment configurations
const SECRET = config.get('security.jwt.secret');
const EXPIRY = config.get('security.jwt.expiry');

/**
 * JSON Web Token authentication middleware
 */
const authenticateToken = (req, res, next) => {
    logger.debug("Entering authenticated route")
    const authHeader = req.headers["x-access-token"] || req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
        // NOT AUTHORIZED
        logger.debug("No token provided")
        return res.status(401).send({error: "Missing authentication token"});
    }
    jwt.verify(token, SECRET, (err , user) => {
        if (err) {
            logger.debug(`${err.message} for token ${token}`);
            // FORBIDDEN
            return res.status(403).send({error: err.message});
        }
        logger.debug("Autorization received")
        req.user = user;
        next();
    })
}

/**
 * Generate a new JWT access token from secret
 * @param {*} content of the JWT token 
 */
const generateAccessToken = (content) => {
    return jwt.sign(content, SECRET, 
        {expiresIn: EXPIRY || "30m"})
}

module.exports = {authenticateToken, generateAccessToken};