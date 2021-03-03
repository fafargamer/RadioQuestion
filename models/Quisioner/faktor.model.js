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
        type: String
    },
    IndexSubParameter:{
        type: Number
    },
    IDFaktor:{
        type: String,
        required: 'This field is required'
    },
    skor: {
        type: Number
    },
    buktiPemenuhan:{
        type: String
    }
});

mongoose.model('FaktorSchema', faktorSchema);