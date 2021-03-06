const mongoose = require('mongoose');
const Float = require('mongoose-float').loadType(mongoose);

var indikatorSchema = new mongoose.Schema({
    indikator: {
        type: String,
        required: 'This field is required.'
    },
    aspek: {
        type: Number
    },
    aspekWritten: {
        type: String
    },
    index: {
        type: Number
    },
    bobot: {
        type: Float
    },
    nilai: {
        type: Float
    },
    nilaiIndividu: {
        type: Number
    },
    jumlahParameter:{
        type: Number
    },
    catatan:{
        type: String
    },
    rekomendasi:{
        type: String
    },
    analisis:{
        type: String
    },
    terakhirIsi:{
        type:String
    },
    tanggalIsi:{
        type:Date
    }
});

mongoose.model('Indikator', indikatorSchema);