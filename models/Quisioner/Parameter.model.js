const mongoose = require('mongoose');

var parameterSchema = new mongoose.Schema({
    pertanyaan: {
        type: String,
        required: 'This field is required.'
    },
    aspek: {
        type: Number
    },
    indikator: {
        type: Number
    },
    index: {
        type: Number
    },
    IDPertanyaan:{
        type: String
    },
    bobot: {
        type: Number
    },
    nilai: {
        type: Number
    },
    jumlahSubParameter:{
        type: Number
    },
    catatan:{
        type: String
    }
});

mongoose.model('Parameter', parameterSchema);