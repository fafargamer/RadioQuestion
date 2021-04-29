const { response } = require('express');
const express = require('express');
var app = express.Router();
const mongoose = require('mongoose');

const Parameter = mongoose.model('Parameter');
const SubParameter = mongoose.model('SubParameter')
const FaktorSchema = mongoose.model('FaktorSchema')
const Indikator = mongoose.model('Indikator')
const Aspek = mongoose.model('Aspek')
const toPercent = require('decimal-to-percent');
const e = require('express');
const { reset } = require('nodemon');

const multer = require('multer')
const fs = require('fs')
const path = require('path');
mongoose.set('useFindAndModify', false);


app.get('/downloadBukti/:filename', isLoggedIn, (req,res) =>{
    const fileName = req.params.filename;
    const path = __dirname + './../files/buktiFaktor/';
  
    res.download(path + fileName, (err) => {
      if (err) {
        res.status(500).send({
          message: "File can not be downloaded: " + err,
        });
      }
    });
    // res.redirect('/all/')
    // res.send(req.params.filename)
  })

  app.get('/deleteBukti/:filename', isLoggedIn, (req,res) =>{
    const fileName = req.params.filename;
    const path = __dirname + './../files/buktiFaktor/';
  
    FaktorSchema.findOneAndUpdate({urlBukti:req.params.filename}, {urlBukti:''}, (errDel,resDel) =>{
        if(errDel) {
            res.send('Error in database deletion')
        }
        else {
            fs.unlinkSync(path+fileName)
            res.redirect('/all/')
        }
    })
    // res.redirect('/all/')
    // res.send(req.params.filename)
  })

  function isLoggedIn(req, res, next) {
    console.log('Loggin in....')
    if (req.isAuthenticated()) {
      return next();
    }
    else {
      res.redirect('/login');
    }
  }


module.exports = app;