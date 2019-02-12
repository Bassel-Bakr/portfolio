const db = require('../db');
const config = require('../config');
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const passport = require('passport');

/* use utf-8 encoding for post to support Arabic*/
router.post('*', (req, res, next) => {
  res.type('application/json; charset=utf-8');
  next();
});

/* logout user. */
router.get('/logout', (req, res) => {
  req.logOut();
  res.redirect('/');
});

/* register users. */
router.get('/register', (req, res) => res.render('register'));
router.post('/register', (req, res) => {
  const data = req.body;
  // verify data
  //
  const username = data.username;
  const password = data.password;
  const repeatedPassword = data.repeatedPassword;
  bcrypt.hash(password, config.saltRounds, (err, passwordHash) => {
    if (err) throw err;  // TODO: don't break the server for mere error
    db.createConnection((err, con) => {
      if (err) throw err;
      // insert into database
      con.query(
          `insert into users(name, pass) values('${username}', '${passwordHash}')`,
          (err, result) => {
            if (err) throw err;
            res.redirect('/');
          });
    });
  });
});

/* login users */
router.get(
    '/login', (req, res) => req.user ? res.redirect('/') : res.render('login'));

router.post(
    '/login',
    passport.authenticate(
        'local',
        {failureRedirect: '/auth/login', successReturnToOrRedirect: '/'}));

module.exports = router;
