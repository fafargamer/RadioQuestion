// load the things we need
var express = require('express');
var session = require('express-session')
var cookieParser   = require('cookie-parser')
var bodyParser = require('body-parser')
var flash = require('connect-flash')
const passport = require('passport');
var app = express();

require('./models/Mongoosedatabase.js');
require("dotenv").config();

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));



// parse application/json
app.use(bodyParser.json())

const parameterController = require('./controllers/CGCDataController.js');
const adminLTEController = require('./controllers/adminLTEController.js');
const userManagementController = require('./controllers/userManagementController.js');


require('./config/passport.js')



const { response } = require('express');

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60 * 60 * 1000 }
}))


app.use(passport.initialize());
app.use(passport.session());
app.use(flash());



// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });

// // error handlers
// // production error handler
// // no stacktraces leaked to user
// app.use(function (err, req, res, next) {
//   res.status(err.status || 500);
//   if (err.status == 404) res.render('admin/404', {
//     message: err.message,
//     error: {}
//   });
//   if (err.status == 504) res.render('admin/404', {
//     message: err.message,
//     error: {}
//   });
//   else res.redirect('/');
// });

// app.get('/', (req,res) =>{
//   res.redirect('/GCGData/')
// })


// use res.render to load up an ejs view file

// index page

app.listen(process.env.PORT || 3000, () => {
    console.log('Express server started at port : 3000');
});



app.get('/login', (req,res) => {
  res.render('admin/login', {message:req.flash('loginMessage')})
})

app.post('/login', passport.authenticate('local',{failureRedirect: '/login'}), (req, res) => {
    res.redirect(req.session.returnTo || '/');
    delete req.session.returnTo;
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

function isLoggedIn(req, res, next) {
  console.log('Loggin in....')
  if (req.isAuthenticated()) {

    req.session.returnTo = req.originalUrl; 
    return next();
  }
  else {
    res.redirect('/login');
  }
}
// app.post('/login', (req,res) => {
//   console.log(req.body)
// })

app.get('/', (req,res) =>{
  // console.log(req.body)
  res.render('admin/homePage')
})


app.use('/GCGData', parameterController);
app.use('/LTE', adminLTEController);
app.use('/UserManagement', userManagementController);