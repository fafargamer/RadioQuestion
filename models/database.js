require("dotenv").config();

const mongoose = require('mongoose');



mongoose.connect(process.env.DB_CONNECT, { 
    useNewUrlParser: true,
    useUnifiedTopology: true, 
    
    }, 
    (err) => {
    if (!err) { console.log('MongoDB Connection Succeeded.') }
    else { console.log('Error in DB connection : ' + err) }
});

require('./Quisioner/Parameter.model.js');
require('./Quisioner/subParameter.model.js');
require('./Quisioner/faktor.model.js');
require('./Quisioner/Indikator.model.js');
require('./Quisioner/Aspek.model.js');