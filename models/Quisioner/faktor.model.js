const mongoose = require('mongoose');

var faktorSchema = new mongoose.Schema({
    faktor: {
        type: String,
        required: 'This field is required.'
    },
    aspek:{
        type:Number
    },
    indikator:{
        type:Number
    },
    IDParameter:{
        type: Number
    },
    IndexSubParameter:{
        type: Number
    },
    Index:{
        type: Number,
        required: 'This field is required'
    },
    skor: {
        type: Number
    },
    catatan: {
        type: String
    },
    buktiPemenuhan:{
        type: []
    },
    catatanBukti:{
        type:String
    },
    urlBukti:{
        type:String
    }
});

mongoose.model('FaktorSchema', faktorSchema);