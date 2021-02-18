// load the things we need
var express = require('express');
var app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');

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
    res.render('addQuestion', {data:data});
    //res.send(data)
    console.log(data.test[0])
});

app.post('/submitJawaban', (req,res) =>{
    console.log(req.body)
})

// about page
app.get('/about', function(req, res) {
    res.render('pages/about');
});

app.listen(8080);
console.log('8080 is the magic port');