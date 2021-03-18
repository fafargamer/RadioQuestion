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


app.get('/', (req,res) =>{
  Aspek.find({}, (err,result) =>{
      if(err){
          res.send(err)
      }
      else{
          res.render('admin/adminLTE')
      }
  })
})

  
  app.get('/index2/', isLoggedIn, (req,res) =>{
    res.render('admin/index2')
  })
  
  app.get('/index3/', (req,res) =>{
    res.render('admin/index3')
  })

  app.get('/login/', (req,res) =>{
    res.render('admin/login')
  })

  app.get('/register/', (req,res) =>{
    res.render('admin/register')
  })

  app.get('/error404/', (req,res) =>{
    res.render('admin/404')
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