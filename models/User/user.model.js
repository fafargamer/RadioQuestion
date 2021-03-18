const mongoose = require('mongoose');
const Float = require('mongoose-float').loadType(mongoose);


var userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: 'This field is required.'
    },
    password: {
        type: String,
        required: 'Password required.'
    },
    typeUser: {
        type: String
    },
    aspekUser: {
        type: Number
    }
});

mongoose.model('User', userSchema);