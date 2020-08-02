var express = require('express');
var { Item, validateItem } = require('../model/item');
var { authenticateToken } = require('../jwt');
var logger = require('../logger');
var router = express.Router();

/* GET items listing. */
router.get('/', async (req, res, next) => {
  const items = await Item.find({inventory: {$gt: 0}});
  res.send(items);
});

/* GET items listing. */
router.get('/:id', async (req, res, next) => {
  const item = await Item.findById(req.params.id);
  res.send(item);
});

/* POST item */
router.post('/', authenticateToken, (req, res) => {
  if (!req.user.isAdmin) {
    logger.debug("User need admin access to add items", req.user);
    return res.status(401).send("User need admin access to add items")
  }
  const { error } = validateItem(req.body);
  if (error) {
    logger.error("Validation error on Item ", req.body);
    return res.status(400).send(error.details[0].message);
  }
  const item = new Item(req.body);
  item.save((err, item) => {
    logger.debug("Item saved", item)
    return res.status(201).send(item);
  });
})

/* PUT item */
router.put('/:id', authenticateToken, (req, res) => {
  if (!req.user.isAdmin) {
    logger.debug("User need admin access to add items", req.user);
    return res.status(401).send("User need admin access to add items")
  }
  const { error } = validateItem(req.body);
  if (error) {
    logger.error("Validation error on Item ", req.body);
    return res.status(400).send(error.details[0].message);
  }
  Item.updateOne({_id: req.params.id}, req.body, {runValidator:true}, (err, item) => {
    if (err) {
      logger.error(err);
      return res.status(500).send("Error while saving entity");
    }
    logger.debug("Item saved", item)
    return res.status(201).send(item);
  });
})

module.exports = router;