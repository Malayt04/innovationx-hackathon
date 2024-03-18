const express = require('express');
const { userDashboard, buyStock, dashboard } = require('../controllers/userholdings');
const router = express.Router();

router.get('/:id',userDashboard);
router.post('/:id/:creator',buyStock)
router.get('/:id/dashboard', dashboard)

module.exports = router;