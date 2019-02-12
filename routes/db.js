const db = require('../db');
const router = require('express').Router();

const dbConnection = db.createConnection();

router.get('/', (req, res) => {
  dbConnection.query('select * from users', (err, result) => {
    if (err)
      res.render('error', {error: err});
    else
      res.render('db', {users: result});
  });
});

module.exports = router;