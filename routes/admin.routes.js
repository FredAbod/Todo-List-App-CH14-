const express = require('express');
const { adminSignup, adminLogin, allUsers } = require('../controller/admin.Controller');
const { isAuthenticated } = require('../middleware/isAuthenticated');
const router = express.Router();


router.get('/allUsers', isAuthenticated, allUsers);
router.post('/signup', adminSignup);
router.post('/login', adminLogin);


module.exports = router;