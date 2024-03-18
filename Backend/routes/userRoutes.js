const express = require('express');
const { userDashboard, buyStock, dashboard } = require('../controllers/userholdings');
const router = express.Router();

router.get('/:id',userDashboard);
router.post('/:id/:creator',buyStock)
router.get('/userdashboard',(res, req)=>{
    res.render('userdashboard',{username: res.locals.username})
})
module.exports = router;