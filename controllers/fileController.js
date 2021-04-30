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

  app.post('/PostCatatan', isLoggedIn, (req,res,next) =>{
    // Index = req.body.Index
    // catatan = req.body.catatan
    // console.log('request header' + JSON.stringify(req.body))
    IndexSubParameter = req.body.idSubParameter
    IDParameter = req.body.idParameter
    aspek = req.body.inputAspek
    indikator = req.body.inputIndikator
    Index = req.body.inputIndex
    catatanBukti = req.body.inputCatatan
    console.log(Index)
    console.log(catatanBukti)
    // inputFile = req.body.inputBuktiFaktor
    // console.log(req.files.inputBuktiFaktor.name)
    
    upload(req, res, err => {
        if (err) throw err
        // console.log(aspek)
        if(req.file) {
            console.log(req.body.catatan)
            console.log(req.file.filename)
            FaktorSchema.findOneAndUpdate({aspek:req.body.inputAspek, 
                indikator:req.body.inputIndikator, 
                IDParameter:req.body.idParameter, 
                IndexSubParameter:req.body.idSubParameter, 
                Index:req.body.inputIndex}, 
                {urlBukti:req.file.filename, catatanBukti:req.body.catatan}, (err, result) =>{
                if(err){
                    res.send(err)
                }
                else{
                    // console.log(catatanBukti)
                    console.log("Catatan terupdate")
                }
            })
            const delfileName = req.body.oldUrlBukti;
            const delpath = __dirname + './../files/buktiFaktor/';
            if(delfileName){
                fs.unlinkSync(delpath+delfileName)
            }
        }
        else {
            FaktorSchema.findOneAndUpdate({aspek:req.body.inputAspek, 
                indikator:req.body.inputIndikator, 
                IDParameter:req.body.idParameter, 
                IndexSubParameter:req.body.idSubParameter, 
                Index:req.body.inputIndex}, 
                {catatanBukti:req.body.catatan}, (err, result) =>{
                if(err){
                    res.send(err)
                }
                else{
                    console.log(catatanBukti)
                    console.log("Catatan terupdate")
                }
            })
        }
         //script lain misal redirect atau alert :D 
        res.redirect('/all/')
     });
        
    // res.redirect('/all/')
  })


  //set storage engine
const storage = multer.diskStorage({
  destination : path.join(__dirname + './../files/buktiFaktor/'),
  filename: function(req, file, cb){
      cb(null, req.body.namaFaktor + '-' + Date.now() +
      path.extname(file.originalname));
  }
});

//init upload
const upload = multer({
  storage : storage
}).single('inputBuktiFaktor');


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