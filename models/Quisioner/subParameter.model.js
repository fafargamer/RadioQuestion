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
    nilaiPersen: {
        type:Number
    },
    buktiPemenuhan:{
        type: String
    },
    jumlahFaktor:{
        type: Number
    },
    terakhirIsi:{
        type:String
    },
    tanggalIsi:{
        type:Date
    }
});

mongoose.model('SubParameter', subParameterSchema);