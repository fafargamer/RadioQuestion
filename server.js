// load the things we need
var express = require('express');
var bodyParser = require('body-parser')
var app = express();
require('./models/database.js');

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));

// parse application/json
app.use(bodyParser.json())

const parameterController = require('./controllers/parameterController.js');
const { response } = require('express');


// use res.render to load up an ejs view file

// index page

app.listen(3000, () => {
    console.log('Express server started at port : 3000');
});

app.use('/', parameterController);