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


// use res.render to load up an ejs view file

// index page
app.get('/', function(req, res) {
    const data = {test : [ {question:'Apakah pertanyaan ini gabut?', 

                    choices:[ {ans:'ya', val: 1}, {ans:'tidak', val: 0 }, {ans:'mungkin', val: 0.5} ] },
                    {question:'Apakah anda mau ngerjain quiz ini?', 
                    choices:[ {ans:'ya', val: 1}, {ans:'tidak', val: 0 }, {ans:'mungkin', val: 0.5} ] },
                    {question:'Apakah pengangguran?', 
                    choices:[ {ans:'ya', val: 1}, {ans:'tidak', val: 0 }, {ans:'mungkin', val: 0.5} ] }

                 ] }
    const header = {headerAspek : "Aspek I", headerIndikator: "Indikator I"}
    res.render('parameterFill', {data:data, headerData:header});
    //res.send(data)
    console.log(data.test[0])
});

app.post('/submitJawaban', (req,res) =>{
    //res.send(req.body)\
    res.send(req.body)
    console.log(JSON.stringify(req.body.nilai))
})

app.listen(3000, () => {
    console.log('Express server started at port : 3000');
});

app.use('/Parameter', parameterController);