// load the things we need
var express = require('express');
var session = require('express-session')
var cookieParser   = require('cookie-parser')
var bodyParser = require('body-parser')
var flash = require('connect-flash')
var app = express();
require('./models/database.js');
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
const { response } = require('express');

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }
}))

app.use(flash());

// app.get('/', (req,res) =>{
//   res.redirect('/GCGData/')
// })


// use res.render to load up an ejs view file

// index page

app.listen(process.env.PORT || 3000, () => {
    console.log('Express server started at port : 3000');
});

app.get('/TestAdminLTE', (req,res) =>{
  res.render('admin/adminLTE')
})



app.use('/GCGData', parameterController);
app.use('/test', adminLTEController);