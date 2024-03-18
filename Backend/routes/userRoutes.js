const express = require('express');
const { userDashboard, buyStock } = require('../controllers/userholdings');
const router = express.Router();

router.get('/:id',userDashboard);
router.post('/:id/:creator',buyStock)

module.exports = router;