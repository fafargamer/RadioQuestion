const { response } = require('express');
const express = require('express');
const app = express();

const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User')
const bcrypt = require('bcrypt');
const salt = bcrypt.genSaltSync(10);
const LocalStrategy = require('passport-local').Strategy;






passport.use('local', new LocalStrategy(
        {passReqToCallback: true},
        function (req, username, password, done){
            password = password.toString();
            // password = bcrypt.hashSync(password, salt);
            // console.log('Password = ' + password)
            // console.log('Logggggiiiiinggg.......')
            User.findOne({username: username, password: password}, function(err, result){
                if(err) {
                    return done(null,false)
                }
                if(!result){
                    console.log('Not found')
                    return done(null,false)
                }
                else {
                    console.log('berhasil')
                    delete result.password
                    return done(null, result)
                }
            })
        })
      );    

passport.serializeUser(function(user, cb) {
        cb(null, user.username);
    });
    
passport.deserializeUser(function(username, cb) {
        User.findOne({username}, (err, user) => {
        if (err) { 
            return cb(err); 
            }
        cb(null, user);
        });
    });


module.exports = app;