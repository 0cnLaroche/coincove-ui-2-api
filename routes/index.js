const express = require('express');
const path = require('path');
const fs = require('fs');
const {Item} = require('../model/item');
const logger = require('../logger');
const handlebars = require('handlebars');
const config = require('config');
const router = express.Router();
require('dotenv').config();

const WEBAPP_DISTRIBUTION = config.get('distribution');

/* GET item page. Insert meta tags (Open Graph) data */
router.get('/:id', async (req, res, next) => {
  console.log("items called");
  try {
    const filePath = path.join(WEBAPP_DISTRIBUTION, 'build', 'index.html');
    const item = await Item.findById(req.params.id); // Grab 3 random items to display image
    const images = [{url: item.imageUrl}];
    const meta = { // Build meta data object
      title: item.name,
      description: item.description,
      url: `${config.host.protocol}://${config.host.domain}/items/${req.params.id}`,
      type: "product",
      images,
      theme: {
        primary: config.theme.primary,
        secondary: config.theme.secondary,
        logo: config.theme.logo
      }
    }
    fs.readFile(filePath, 'utf8', (err, data) => {
      const template = handlebars.compile(data.toString());
      res.send(template(meta));
    });
  } catch (err) {
    logger.debug(`item id ${req.params.id} not found`);
    res.sendStatus(404);
  }
});

/* GET home page. Insert meta tags (Open Graph) data */

router.get('/', async (req, res, next) => {
  const filePath = path.join(WEBAPP_DISTRIBUTION, 'build', 'index.html');
  const items = await Item.aggregate().sample(3); // Grab 3 random items to display image
  const images = items.map(item => {return {url: item.imageUrl}});
  const meta = { // Build meta data object
    title: config.meta.title,
    description: config.meta.description,
    url: `${config.host.protocol}://${config.host.domain}`,
    type: "website",
    images,
    theme: {
      primary: config.theme.primary,
      secondary: config.theme.secondary,
      logo: config.theme.logo
    }
  }
  fs.readFile(filePath, 'utf8', (err, data) => {
    const template = handlebars.compile(data.toString());
    res.send(template(meta));
  })
});



module.exports = router;
