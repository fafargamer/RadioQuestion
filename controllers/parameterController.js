const { response } = require('express');
const express = require('express');
var app = express.Router();
const mongoose = require('mongoose');
const Parameter = mongoose.model('Parameter');
const SubParameter = mongoose.model('SubParameter')

// about page
app.get('/addQuestion', function(req, res) {
    res.render('tambahPertanyaan');
});

app.post('/addQuestion', (req, res) => {
        insertQuestion(req, res);
        // res.send('Parameter sudah ada')
});

app.get('/testIDCreate', (req,res) =>{

    res.send(createID(12,3))
})

app.get('/:idparams', (req,res) =>{
    getParameter(req, res);
})

// app.get('/:idparams/AddSubParams', getParameterbyID, (req,res) =>{
//     console.log(req.body)
//     // getParameterbyID(req,res)
//     // var parseData = getParameterbyIDRes
//     // res.render('tambahSubParameter', {data: parseData})
// })

app.get('/:idparams/AddSubParams', (req,res) =>{
    // console.log(req.body)
    // getParameterbyID(req,res)
    // var parseData = getParameterbyIDRes
    var dataParams = req.params.idparams
    res.render('tambahSubParameter', {data: dataParams})
})

app.get('/:idparams/SubParams', (req,res) =>{
    getSubParameter(req, res)
})

app.post('/addSubParameter', (req,res) =>{
    addSubParameter(req, res)
})





function createID(aspekID, indikatorID){
    var id = ""
    s = "P" + aspekID.toString() + "-" + indikatorID.toString()
    return s
}

function getSubParameter(req, res) {
    var IDParameter = req.params.idparams;
    SubParameter.find({ IDParameter: IDParameter}, (err,result) =>{
        if(err){
            res.send(err)
        }
        else if(!result){
            res.send('SubParameter belum ada')
        }
        else{
            res.send(result)
        }
    })
}

function addSubParameter(req, res) {
    var subParameter = new SubParameter();
    subParameter.subParameter = req.body.inputSubParameter
    subParameter.IDParameter = req.body.idParameter
    subParameter.IndexSubParameter = req.body.inputIndex
    subParameter.nilai = 0
    subParameter.jumlahFaktor = 0

    SubParameter.findOne({IDParameter: subParameter.IDParameter, IndexSubParameter: subParameter.IndexSubParameter}, (err,result) =>{
        if(err){
            res.send(err)
        }
        else if(result){
            res.send("Sub-Parameter sudah ada")
        }
        else{
            subParameter.save((error,doc) =>{
                if(error){
                    res.send(error)
                }
                else{
                    Parameter.findOneAndUpdate({IDPertanyaan: subParameter.IDParameter}, {$inc: {'jumlahSubParameter': 1}}.exec()) // jumlahSubParameter
                    res.send(doc)
                }
            })
        }

    })                                                               
}


// var subParameterSchema = new mongoose.Schema({
//     subParameter: {
//         type: String,
//         required: 'This field is required.'
//     },
//     IDParameter:{
//         type: String
//     },
//     IndexSubParameter:{
//         type: Number
//     },
//     nilai: {
//         type: Number
//     },
//     buktiPemenuhan:{
//         type: String
//     },
// });

function getParameter(req, res) {
    var IDParameter = req.params.idparams;

    Parameter.findOne({IDPertanyaan: IDParameter }, (err,result) =>{
        if(err){
            res.send(err)
        }
        else{
            res.render('isiParameter.ejs', {dataParameter:result})
        }
    })
}

function getParameterbyID(req, res, next) {
    var IDParameter = req.params.idparams;

    Parameter.findOne({IDPertanyaan: IDParameter }, (err,result) =>{
        if(err){
            res.send(err)
        }
        else{
            // global.getParameterbyIDRes = result;
            // return getParameterbyIDRes
            return result
        }
    })
}

function insertQuestion(req, res) {
    var parameter = new Parameter();
    parameter.pertanyaan = req.body.inputParameter;
    parameter.aspek = req.body.inputAspek;
    parameter.indikator = req.body.inputIndikator;
    parameter.bobot = req.body.inputBobot;
    parameter.jumlahSubParameter = 0;
    parameter.nilai = 0;
    parameter.IDPertanyaan = createID(req.body.inputAspek, req.body.inputIndikator)
    
    // parameter.findOne({pertanyaan: parameter.pertanyaan, aspek: parameter.aspek, indikator:parameter.indikator}, (errorFind, hasilFind) =>{
    //     if(err){
    //         res.send(errorFind)
    //     }
    //     else if(hasilFind){
    //         updateRecord(req, res)
    //     }else{
            parameter.save((err, doc) => {
                if (!err)
                    res.send(doc);
                else {
                    if (err.name == 'ValidationError') {
                        handleValidationError(err, req.body);
                        res.render("/addQuestion", {
                            viewTitle: "Insert Employee",
                            parameter: req.body
                        });
                    }
                    else
                        console.log('Error during record insertion : ' + err);
                }
            });
        // }

    // })

}

function updateRecord(req, res) {
    parameter.findOneAndUpdate({ pertanyaan: parameter.pertanyaan, aspek: parameter.aspek, indikator:parameter.indikator }, req.body, { new: true }, (err, doc) => {
        if (!err) { res.redirect('employee/list'); }
        else {
            if (err.name == 'ValidationError') {
                handleValidationError(err, req.body);
                res.render('tambahPertanyaan')
                console.log('Pertanyaan di-update')
                // res.render("employee/addOrEdit", {
                //     viewTitle: 'Update Employee',
                //     employee: req.body
                // });
            }
            else
                console.log('Error during record update : ' + err);
        }
    });
}

module.exports = app;







// var parameterSchema = new mongoose.Schema({
//     pertanyaan: {
//         type: String,
//         required: 'This field is required.'
//     },
//     aspek: {
//         type: Number
//     },
//     indikator: {
//         type: Number
//     },
        // IDPertanyaan:{
        //     type: String
        // },
        // bobot: {
        //     type: Number
        // },
        // nilai: {
        //     type: Number
        // }
// });