const { response } = require('express');
const express = require('express');
var adminLTE = express.Router();
const mongoose = require('mongoose');

const Parameter = mongoose.model('Parameter');
const SubParameter = mongoose.model('SubParameter')
const FaktorSchema = mongoose.model('FaktorSchema')
const Indikator = mongoose.model('Indikator')
const Aspek = mongoose.model('Aspek')
const toPercent = require('decimal-to-percent');
const e = require('express');
const { reset } = require('nodemon');


adminLTE.get('/index1', (req,res) =>{
    res.render('admin/index')
  })

  
  adminLTE.get('/index2', (req,res) =>{
    res.render('admin/index2')
  })
  
  adminLTE.get('/index3', (req,res) =>{
    res.render('admin/index3')
  })

  adminLTE.get('/test', (req,res) =>{
    res.render('admin/adminLTE')
  })

module.exports = adminLTE;