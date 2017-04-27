const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const firebase = require('firebase');

// Initialize Firebase
const config = {
  apiKey: "AIzaSyCX9EG9O4CK2h89VQ-W5LhWPyFpYSZfWn4",
  authDomain: "albumz-8b195.firebaseapp.com",
  databaseURL: "https://albumz-8b195.firebaseio.com",
  projectId: "albumz-8b195",
  storageBucket: "albumz-8b195.appspot.com",
  messagingSenderId: "1006124177939"
};
firebase.initializeApp(config);
const fbRef = firebase.database().ref();

// Route Files
const routes = require('./routes/index');
const albums = require('./routes/albums');
const genres = require('./routes/genres');
const users = require('./routes/users');

// Init App
const app = express();

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Logger
app.use(logger('dev'));

// Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Handle Sessions
app.use(session({
  secret:'secret',
  saveUninitialized: true,
  resave: true
}));

// Validator
app.use(expressValidator({
  errorFormatter: (param, msg, value) => {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Connect Flash
app.use(flash());

// Global Vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.authdata = firebase.auth().currentUser;
  res.locals.page = req.url;
  next();
});

// Get User Info
app.get('*', (req, res, next) => {
  if(firebase.auth().currentUser !== null){
    const userRef = fbRef.child('users');
    userRef.orderByChild('uid').startAt(firebase.auth().currentUser.uid).endAt(firebase.auth().currentUser.uid).on('child_added', (snapshot) => {
      res.locals.user = snapshot.val();
    });
  }
  next();
});

// Routes
app.use('/', routes);
app.use('/albums', albums);
app.use('/genres', genres);
app.use('/users', users);

// Set Port
app.set('port', (process.env.PORT || 3000));

// Run Server
app.listen(app.get('port'), () => {
  console.log('Server started on port: ' + app.get('port'));
});
