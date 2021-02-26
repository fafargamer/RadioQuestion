const mongoose = require('mongoose');
const Float = require('mongoose-float').loadType(mongoose);

var aspekSchema = new mongoose.Schema({
    aspek: {
        type: String,
        required: 'This field is required.'
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
    jumlahIndikator:{
        type: Number
    },
    catatan:{
        type: String
    }
});

mongoose.model('Aspek', aspekSchema);