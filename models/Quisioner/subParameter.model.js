const mongoose = require('mongoose');

var subParameterSchema = new mongoose.Schema({
    subParameter: {
        type: String,
        required: 'This field is required.'
    },
    aspek: {
        type: Number
    },
    indikator: {
        type: Number
    },
    IDParameter:{
        type: Number
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