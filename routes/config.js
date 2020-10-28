const express = require('express');
const config = require('config');
const router = express.Router();

/**
 * Provide configurations to web app
 */
router.get('/', (req, res) => {
    let appConfigs = config.util.toObject();
    delete appConfigs.security;
    if(appConfigs.security) {
        throw new Error('Security has not been removed, secrets could be exposed');
    } else {
        res.json(appConfigs);
    }
});

module.exports = router;