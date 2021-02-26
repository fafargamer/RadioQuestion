const { response } = require('express');
const express = require('express');
var app = express.Router();
const mongoose = require('mongoose');

const Parameter = mongoose.model('Parameter');
const SubParameter = mongoose.model('SubParameter')
const FaktorSchema = mongoose.model('FaktorSchema')
const Indikator = mongoose.model('Indikator')
const Aspek = mongoose.model('Aspek')
const toPercent = require('decimal-to-percent');
const e = require('express');

mongoose.set('useFindAndModify', false);

//Get Aspeks
// app.get('/', (req,res) =>{
//     res.render('isiParameter')
// })

app.get('/', (req,res) =>{
    Aspek.find({}, (err,result) =>{
        if(err){
            res.send(err)
        }
        else{
            res.render('tabel/tabelAspek', {result:result})
        }
    })
})

//Get tambah Aspek
app.get('/addAspek', (req,res) =>{
    res.render('tambahForm/tambahAspek')
})

//Post Aspek
app.post('/addAspek', (req,res) =>{
    addAspek(req,res)
})

//Get Indikators
app.get('/:idAspek', (req,res) =>{
    getIndikators(req,res)
})

//Tambah Indikator (HTML)
app.get('/:idAspek/addIndikator', (req,res) =>{
    var idAspek = req.params.idAspek
    res.render('tambahForm/tambahIndikator', {idAspek: idAspek})
})

app.post('/addIndikator', (req,res) =>{
    addIndikator(req,res)
})


//Get parameters
app.get('/:idAspek/:idIndikator', (req,res) =>{
    getParameters(req, res)
})

//Tambah Parameter (HTML)
app.get('/:idAspek/:idIndikator/addParameter', (req,res) =>{
    var idAspek = req.params.idAspek
    var idIndikator = req.params.idIndikator
    res.render('tambahForm/tambahParameterFix', {idAspek: idAspek, idIndikator: idIndikator})
})

//Tambah parameter (Post)
app.post('/addParameter', (req, res) => {
    insertQuestion(req, res);
    // res.send('Parameter sudah ada')
});


//Tabel sub-parameter (HTML)
app.get('/:idAspek/:idIndikator/:idparams', (req,res) =>{
    getSubParameters(req, res)
})

//Tambah sub-parameter (HTML)
app.get('/:idAspek/:idIndikator/:idparams/addSubParameter', (req,res) =>{
    ParameterID = req.params.idparams
    idAspek = req.params.idAspek
    idIndikator = req.params.idIndikator
    res.render('tambahForm/tambahSubParameter', {parameterID: ParameterID, idAspek:idAspek, idIndikator:idIndikator})
})

//Tambah sub-parameter (Post)
app.post('/addSubParameter', (req,res) =>{
    addSubParameter(req, res)
})


//Get Faktor (HTML)
app.get(':idAspek/:idIndikator/:idparams/:idsubparameter/', (req,res) =>{
    getFaktors(req,res)
})





//////////////
//Aspek///////
//////////////

//Add Aspek
function addAspek(req,res) {
    var aspek = new Aspek()
    aspek.aspek = req.body.inputAspek
    aspek.index = req.body.inputNoAspek
    aspek.bobot = req.body.inputBobot
    aspek.nilai = 0.0
    aspek.jumlahIndikator = 0
    aspek.catatan = ""

    Aspek.findOne({index : req.body.inputNoAspek}, (errAs,resAs) =>{
        if(errAs){
            res.send(errAs)
        }
        else if(resAs){
            res.send('Aspek dengan index yang sama sudah ada')
        }
        else{
            aspek.save((err,doc) => {
                if(err){
                    res.send(err)
                }
                else{
                    console.log(doc)
                    res.redirect('/')
                }
            })
        }
    })
}


//////////////
//Indikator//
//////////////

//Get Indikators
function getIndikators(req,res) {
    var aspek = req.params.idAspek
    Indikator.find({aspek:aspek}, (errIndikator, resultIndikator) => {
        if(errIndikator){
            res.send(errIndikator)
        }
        else{
            res.render('tabel/tabelIndikator', {result:resultIndikator, idAspek:aspek})
        }
    })
}

//Add Indikator
function addIndikator(req,res) {
    var indikator = new Indikator();
    indikator.indikator = req.body.inputIndikator
    indikator.aspek = req.body.inputAspek
    indikator.index = req.body.inputNoIndikator
    indikator.bobot = req.body.inputBobot
    indikator.nilai = 0
    indikator.jumlahParameter = 0
    indikator.save((error,indikator) =>{
        if(error){
            res.send(error)
        }
        else{
            Aspek.findOneAndUpdate( {index:req.body.inputAspek}, 
                {$inc:{jumlahIndikator: 1}}, {upsert: true}, (errUpdAsp,resUpdAsp) =>{
                    if(errUpdAsp){
                        res.send(errUpdAsp)
                    }
                    else{
                        console.log(resUpdAsp)
                    }
                });
            res.redirect('/'+req.body.inputAspek)
        }
    })
}


//////////////
//Parameters//
//////////////
function getParameters(req, res) {
    var idAspek = req.params.idAspek
    var idIndikator = req.params.idIndikator
    Parameter.find({aspek: idAspek, indikator: idIndikator}, (err,result) => {
        if(err){
            res.send(err)
        }
        else{
            res.render('tabel/tabelParameter', {result: result, idAspek: idAspek, idIndikator: idIndikator})
        }
    })
}

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
    parameter.index = req.body.inputNoParameter
    parameter.jumlahSubParameter = 0;
    parameter.nilai = 0;
    parameter.IDPertanyaan = createID(req.body.inputAspek, req.body.inputIndikator, req.body.inputNoParameter)
    
    Parameter.findOne({IDPertanyaan: parameter.IDPertanyaan}, (errorFind, hasilFind) =>{
        if(errorFind){
            res.send(errorFind)
        }
        else if(hasilFind){
            res.send('Parameter dengan ID yang sama sudah ada')
        }else{
            parameter.save((err, doc) => {
                if (!err){
                    Indikator.findOneAndUpdate( {aspek:req.body.inputAspek, index:req.body.inputIndikator}, 
                        {$inc:{"jumlahParameter": 1}}, {upsert: true}, (errUpdInd,resUpdInd) =>{
                            if(errUpdInd){
                                res.send(errUpdInd)
                            }
                            else{
                                console.log(resUpdInd)
                            }
                        });
                    res.redirect('/'+ req.body.inputAspek + '/' + req.body.inputIndikator);
                }
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
        }

    })

}

function updateRecord(req, res) {
    parameter.findOneAndUpdate({ pertanyaan: parameter.pertanyaan, aspek: parameter.aspek, indikator:parameter.indikator }, req.body, { new: true }, (err, doc) => {
        if (!err) { res.redirect('employee/list'); }
        else {
            if (err.name == 'ValidationError') {
                handleValidationError(err, req.body);
                res.render('tambahPertanyaan')
                console.log('Pertanyaan di-update')
            }
            else
                console.log('Error during record update : ' + err);
        }
    });
}


//////////////
//Sub-Parameters//
//////////////

function getSubParameters(req, res) {
    var IDParameter = req.params.idparams;
    var idAspek = req.params.idAspek
    var idIndikator = req.params.idIndikator
    Parameter.findOne({IDPertanyaan: IDParameter}, (errorParameter,resultParameter) =>{
        if(errorParameter){
            res.send(errorParameter)
        }
        else{
            SubParameter.find({ IDParameter: IDParameter}, (err,result) =>{
                if(err){
                    res.send(err)
                }
                else if(!result){
                    res.send('SubParameter belum ada')
                }
                else{
                    console.log(result)
                    res.render('tabel/tabelSubParameter', {data:result, dataParameter:resultParameter, idAspek:idAspek, idIndikator:idIndikator})
                }
            })
        }
    })

}

function getSubParameter(req, res) {
    var IDParameter = req.params.idparams;
    Parameter.findOne({IDPertanyaan: IDParameter}, (errorParameter,resultParameter) =>{
        if(errorParameter){
            res.send(errorParameter)
        }
        else{
            SubParameter.find({ IDParameter: IDParameter}, (err,result) =>{
                if(err){
                    res.send(err)
                }
                else if(!result){
                    res.send('SubParameter belum ada')
                }
                else{
                    console.log(result)
                    res.render('tabelSubParameter', {data:result, dataParameter:resultParameter})
                }
            })
        }
    })

}

function addSubParameter(req, res) {
    var subParameter = new SubParameter();
    subParameter.subParameter = req.body.inputSubParameter
    subParameter.IDParameter = req.body.inputParameter
    subParameter.aspek = req.body.inputAspek
    subParameter.indikator = req.body.inputIndikator
    subParameter.IndexSubParameter = req.body.inputIndex
    subParameter.nilai = 0.0
    subParameter.jumlahFaktor = 0

    SubParameter.findOne({aspek: subParameter.aspek, indikator:subParameter.indikator, IDParameter: subParameter.IDParameter, IndexSubParameter: subParameter.IndexSubParameter}, (err,result) =>{
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
                    Parameter.findOneAndUpdate( {aspek:req.body.inputAspek, 
                                                indikator:req.body.inputIndikator, 
                                                IDPertanyaan:req.body.inputParameter}, 
                        {$inc:{'jumlahSubParameter': 1}}, 
                        {upsert: true}, 
                        (errUpdPar,resUpdPar) =>{
                            if(errUpdPar){
                                res.send(errUpdPar)
                            }
                            else{
                                console.log(resUpdPar)
                            }
                        });
                    console.log(doc)
                    res.redirect('/'+ subParameter.aspek +'/'+ subParameter.indikator + '/' + subParameter.IDParameter + '/')
                }
            })
        }

    })                                                               
}


//Get Sub-Faktor
function getFaktors(req,res) {
    var IDParameter = req.params.idparams;
    var IDSubParameter = req.params.idsubparameter
    FaktorSchema.find({IDParameter: IDParameter, IndexSubParameter: IDSubParameter}, (err,result) =>{
        if(err){
            res.send(err)
        }
        else{
            res.render('tabelFaktorSubP', {data:result})
        }
    })
}


function createID(aspekID, indikatorID, NoParameter){
    var id = ""
    s = "P" + aspekID.toString() + "-" + indikatorID.toString() + "-" + NoParameter.toString()
    return s
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