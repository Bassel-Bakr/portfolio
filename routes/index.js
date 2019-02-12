const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => res.render('index', {user: req.user, logged: req.isAuthenticated()}));

module.exports = router;
