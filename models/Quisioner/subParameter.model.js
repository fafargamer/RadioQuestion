const mongoose = require('mongoose');

var subParameterSchema = new mongoose.Schema({
    subParameter: {
        type: String,
        required: 'This field is required.'
    },
    IDParameter:{
        type: String
    },
    IndexSubParameter:{
        type: Number
    },
    nilai: {
        type: Number
    },
    buktiPemenuhan:{
        type: String
    },
    jumlahFaktor:{
        type: Number
    }
});

mongoose.model('SubParameter', subParameterSchema);