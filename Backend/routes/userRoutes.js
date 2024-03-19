const express = require('express');
const { buyStock, getUserBuy} = require('../controllers/userholdings');
const router = express.Router();

router.post('/buystocks',buyStock)
router.get('/userbuy', getUserBuy);

module.exports = router;

