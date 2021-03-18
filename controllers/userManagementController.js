const { response } = require('express');
const express = require('express');
var app = express.Router();

const mongoose = require('mongoose');
const User = mongoose.model('User')
const bcrypt = require('bcrypt');
const salt = bcrypt.genSaltSync(10);

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    else res.redirect('/login');
}

app.get('/', isLoggedIn, (req,res) => {
    if (req.user.typeUser == 'Admin') {
        GetAllUsers(req,res)
    }
    else {
        req.flash('errDeclined', 'Maaf Anda tidak berhak untuk mengakses fitur tersebut')
        res.render('admin/notFound', {message:req.flash('errDeclined')})
    }

})


app.get('/TambahUser/', isLoggedIn, (req,res) => {
    if (req.user.typeUser == 'Admin') {
        res.render('admin/user/tambahUser', {message:req.flash('addUserErr')})
    }
    else {
        req.flash('errDeclined', 'Maaf Anda tidak berhak untuk mengakses fitur tersebut')
        res.render('admin/notFound', {message:req.flash('errDeclined')})
    }
})

app.post('/TambahUser/', isLoggedIn, (req,res) =>{
    if (req.user.typeUser == 'Admin') {
        var postUser = AddUser(req,res)
        if(postUser){
            console.log(postUser)
            res.redirect('/userManagement/')
        }
    }
    else {
        req.flash('errDeclined', 'Maaf Anda tidak berhak untuk mengakses fitur tersebut')
        res.render('admin/notFound', {message:req.flash('errDeclined')})
    }
})

app.get('/hapusUser/:username', isLoggedIn, (req,res) => {
    if (req.user.typeUser == 'Admin') {
        deleteUser(req,res,req.params.username)
    }
    else {
        req.flash('errDeclined', 'Maaf Anda tidak berhak untuk mengakses fitur tersebut')
        res.render('admin/notFound', {message:req.flash('errDeclined')})
    }
})




function GetAllUsers(req,res) {
    resultUsers = User.find({}, (errDB,resultUser) =>{
        if(errDB) {
            req.flash('failDBUser', 'Gagal koneksi Database');
            res.render('admin/notFound', {message:req.flash('failDBUser')})
        }
        else{
            // console.log(resultUser)
            // console.log(resultUser.length)
            console.log(resultUser)
            res.render('admin/user/tabelUser', {result:resultUser})
        }
    })
}

function AddUser(req,res, callback) {

    var username = req.body.inputUsername
    var password = req.body.inputPassword
    var confirmPassword = req.body.inputConfPass
    var typeUser = req.body.inputRole
    var aspekUser = req.body.inputAspekUser


    if(password != confirmPassword) {
        req.flash('addUserErr', 'Password tidak sama')
        res.redirect('back')
    }
    else {
        password = password.toString()
        // console.log('passbefore = '+ password)
        // password = bcrypt.hashSync(password, salt);
        // console.log('pass after : ' + password)
        User.findOneAndUpdate( {username}, {username, password, typeUser, aspekUser}, {upsert: true}, (errUpdAsp,resUpdAsp) =>{
                if(errUpdAsp){
                    req.flash('addUserErr', errUpdAsp);
                    res.redirect('back')
                }
                else{
                    console.log(resUpdAsp)
                }
            });
        return req.body
    }


}

function deleteUser(req,res,username) {
    User.findOneAndDelete({username}, (errDelUser,resDelUser) =>{
        if(errDelUser){
            req.flash('delUserErr', errDelUser);
            res.render('admin/notFound', {message:req.flash('delUserErr')})
        }
        else {
            res.redirect('back')
        }
    })
}

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