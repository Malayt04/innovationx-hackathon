const express = require('express');
const { userDashboard, buyStock } = require('../controllers/userholdings');
const router = express.Router();

router.get('/:id',userDashboard);
router.post('/buystocks',buyStock)


module.exports = router;

