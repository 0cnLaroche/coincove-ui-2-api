var express = require('express');
var multer = require('multer');
var fs = require('fs');
var dotenv = require('dotenv');
var { Image, validateImage } = require('../model/image');
var { authenticateToken } = require('../jwt');
var logger = require('../logger');
var router = express.Router();
var upload = multer();

dotenv.config();

const createFileUrl = (id, protocol) => {
    var base = `${protocol}://${process.env.HOST}`
    var url = new URL(base);
    url.pathname = `${process.env.API_CONTEXT_PATH}/files/picture/${id}`;
    if (process.env.NODE_ENV === 'development') {
        url.port = process.env.PORT;
    }
    console.log(url);
    return url;
}

router.get('/picture/:id', (req, res) => {
    console.log("reveived request for image")
    Image.findById(req.params.id, (err, img) => {
        if (err) {
            logger.error(error);
            res.status(500).send("something when wrong, did not find image");
        }
        res.set('Content-type', img.contentType);
        res.send(img.file);
    })
});

router.post('/picture', authenticateToken, upload.single('picture'), (req, res) => {
    var img = {
        contentType: req.file.mimetype,
        fileName: req.file.originalname,
        file: req.file.buffer
    }
    const { error } = validateImage(img);
    if (error) {
        logger.error('Validation error on picture: ' + error.details[0].message);
        return res.status(400).send(error.details[0].message);
    }
    img = new Image(img);
    img.save((err, img) => {
        logger.info("Image save with id " + img._id);
        img.url = createFileUrl(img._id, req.protocol);
        return res.status(201).send(img);
    });
})

module.exports = router;