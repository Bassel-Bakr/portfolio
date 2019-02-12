// local config
const config = require('./config');
// make absolute paths
const path = require('path');
// log http requess
const logger = require('morgan');
// framework
const express = require('express');
// flash messages for passport
const flash = require('connect-flash');
// session management
const session = require('express-session');
// human readable http errors
const createError = require('http-errors');
// handle cookies
const cookieParser = require('cookie-parser');
// compile SASS to CSS
const sassMiddleware = require('node-sass-middleware');
// ensure auth paths are not compromised
const connectEnsureLogin = require('connect-ensure-login');
// mysql store for session data
const MySqlStore = require('express-mysql-session')(session);

// auth handler
const passport = require('passport');
// auth strategy
const LocalStrategy = require('passport-local').Strategy;
// passwords hasher
const bcrypt = require('bcrypt');
// database instance
const db = require('./db').createConnection(err => {
  if (err) throw err;
});

// app instance
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// hook logger first
app.use(logger('dev'));

// serve static files from given directory
app.use(express.static(path.join(__dirname, 'public')));

// sass to css middleware
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true,  // true = .sass and false = .scss
  sourceMap: true
}));

// setup session, cookies and auth with passport
app.use(flash());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(cookieParser(config.sessionSecret));

app.use(session({
  key: 'sid',
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: new MySqlStore({
    host: config.databaseHost,
    user: config.databaseUser,
    password: config.databasePassword,
    database: config.databaseName,
  })
}));

passport.use(new LocalStrategy((username, password, done) => {
  // query user
  db.query(`select * from users where name = '${username}'`, (err, res) => {
    // console.log(username, password, res[0]);
    if (err)
      done(err);
    else if (res.length == 0)
      done(null, false, {message: 'User doesn\'t exist!'});
    else  // verify password
      bcrypt.compare(password, res[0].pass, (err, match) => {
        if (err)
          done(err);
        else if (match)
          done(null, res[0]);
        else
          done(null, false, {message: 'Incorrect password!'});
      });
  });
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(
    (id, done) => db.query(
        `select name from users where id = ${id}`,
        (err, res) => done(err, res[0].name)));

app.use(passport.initialize());
app.use(passport.session());

/* setup routes */
const dbRouter = require('./routes/db');
const authRouter = require('./routes/auth');
const indexRouter = require('./routes/index');

app.use('/', indexRouter);
app.use('/db', dbRouter);
app.use('/auth', authRouter);

// catch 404 and forward to error handler
app.use((req, res) => next(createError(404)));

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// bind to given port
app.listen(process.env.PORT || 5000);