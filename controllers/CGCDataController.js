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

//Hapus Aspek
app.get('/hapusAspek/:idAspek', (req,res) => {
    aspekT = req.params.idAspek
    deleteAspek(aspekT)
    res.redirect('/')
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

//Hapus Indikator dan lainnya
app.get('/:idAspek/hapusIndikator/:idIndikator', (req,res) => {
    indikatorT = req.params.idIndikator
    aspekT = req.params.idAspek
    deleteIndikator(indikatorT, aspekT)
    res.redirect('/'+req.params.idAspek)
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

//Delete Parameter dan lainnya
app.get('/:idAspek/:idIndikator/hapusParameter/:idParameter', (req,res) => {
    parameterT = req.params.idParameter
    indikatorT = req.params.idIndikator
    aspekT = req.params.idAspek
    deleteParameter(parameterT, indikatorT, aspekT)
    res.redirect('/'+req.params.idAspek+'/'+req.params.idIndikator)
})



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

//Delete Sub-Parameter dan lainnya
app.get('/:idAspek/:idIndikator/:idParameter/hapusSubParameter/:idSubParameter/', (req,res) => {
    parameterT = req.params.idParameter
    subParameterT = req.params.idSubParameter

    deleteSubParameter(parameterT,subParameterT)
    res.redirect('/'+req.params.idAspek+'/'+req.params.idIndikator+'/'+req.params.idParameter+'/')
})



//Get Faktor (HTML)
app.get('/:idAspek/:idIndikator/:idparams/:idsubparameter/', (req,res) =>{
    idAspek = req.params.idAspek
    idIndikator = req.params.idIndikator
    idparams = req.params.idparams
    idsubparameter = req.params.idsubparameter

    getFaktors(req, res, idAspek, idIndikator, idparams, idsubparameter)

    // console.log(dataSubFaktor)
    // res.send(dataSubFaktor)
})

//Get Faktor Tambah (HTML)
app.get('/:idAspek/:idIndikator/:idParams/:idSubParams/addFaktor/', (req,res) =>{
    aspek = req.params.idAspek
    indikator = req.params.idIndikator
    IDParameter = req.params.idParams
    IndexSubParameter = req.params.idSubParams
    SubParameter.findOne({aspek, indikator, IDParameter, IndexSubParameter}, (error, result) =>{
        if(error){
            res.send(error)
        }
        else if(!result){
            res.send('Sub-Parameter tidak ada')
        }
        else{
            console.log(result)
            res.render('tambahForm/tambahSubFaktor', {aspek, indikator, IDParameter, result:result})
        }
    })
})

//Add Faktor
app.post('/addFaktor', (req,res) => {
    idSubParameter = req.body.idSubParameter
    idParameter = req.body.idParameter
    aspek = req.body.inputAspek
    indikator = req.body.inputIndikator
    Faktor = req.body.inputFaktor
    IndexFaktor = req.body.inputIndex

    
    addFaktors(req,res, Faktor, aspek, indikator, idParameter, idSubParameter, IndexFaktor)
})

//Delete Sub-Parameter dan lainnya
app.get('/:idAspek/:idIndikator/:idParameter/:idSubParameter/hapusFaktor/:idFaktor/', (req,res) => {
    parameterT = req.params.idParameter
    subParameterT = req.params.idSubParameter
    aspekT = req.params.idAspek
    indikatorT = req.params.idIndikator
    IDFaktor = req.params.idFaktor

    deleteFaktor(aspekT, indikatorT, parameterT,subParameterT, IDFaktor)
    res.redirect('/'+req.params.idAspek+'/'+req.params.idIndikator+'/'+req.params.idParameter+'/'+req.params.idSubParameter+'/')
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

//Delete Aspek and everything
function deleteAspek(aspekT){
    aspek = aspekT
    FaktorSchema.deleteMany({aspek}, (err,res) =>{
        if(err){
            console.log('Gagal menghapus Sub-Faktor')
        }
        else{
            console.log('Sub-Faktor dihapus')
        }
        
    })
    SubParameter.deleteMany({aspek}, (err,res) =>{
        if(err){
            console.log('Gagal menghapus Sub-Parameter')
        }
        else{
            console.log('Sub-Parameter dihapus')
        }
        
    })
    Parameter.deleteMany({aspek}, (err,res) =>{
        if(err){
            console.log('Gagal menghapus Parameter')
        }
        else{
            console.log('Parameter dihapus')
        }
        
    })
    Indikator.deleteMany({aspek}, (err,res) =>{
        if(err){
            console.log('Gagal menghapus Indikator')
        }
        else{
            console.log('Indikator dihapus')
        }
        
    })
    Aspek.deleteMany({index:aspek}, (err,res) =>{
        if(err){
            console.log('Gagal menghapus Sub-Faktor')
        }
        else{
            console.log('Sub-Faktor dihapus')
            console.log(res)
        }
        
    })

}


//////////////
//Indikator//
//////////////

//Get Indikators
function getIndikators(req,res) {
    var aspek = req.params.idAspek
    Aspek.findOne({index:aspek}, (errAsp,resAsp) =>{
        if(errAsp){
            res.send(errAsp)
        }
        else if(!resAsp){
            res.send('Aspek belum ada')
        }
        else{
            Indikator.find({aspek:aspek}, (errIndikator, resultIndikator) => {
                if(errIndikator){
                    res.send(errIndikator)
                }
                else{
                    res.render('tabel/tabelIndikator', {result:resultIndikator, idAspek:aspek, resAsp})
                }
            })
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

//Delete Indikator
function deleteIndikator(indikatorT, aspekT){
    indikator = indikatorT
    aspek = aspekT
    FaktorSchema.deleteMany({indikator}, (err,res) =>{
        if(err){
            console.log('Gagal menghapus Sub-Faktor')
        }
        else{
            console.log('Sub-Faktor dihapus')
        }
        
    })
    SubParameter.deleteMany({indikator}, (err,res) =>{
        if(err){
            console.log('Gagal menghapus Sub-Parameter')
        }
        else{
            console.log('Sub-Parameter dihapus')
        }
        
    })
    Parameter.deleteMany({indikator}, (err,res) =>{
        if(err){
            console.log('Gagal menghapus Parameter')
        }
        else{
            console.log('Parameter dihapus')
        }
        
    })
    Indikator.deleteOne({aspek, index:indikator}, (err,res) =>{
        if(err){
            console.log('Gagal menghapus Indikator')
        }
        else{
            console.log('Indikator dihapus')
        }
        
    })
    Aspek.findOneAndUpdate({index:aspek},{$inc:{jumlahIndikator: -1}}, {upsert: true} , (err,res) =>{
        if(err){
            console.log('Gagal menghapus Entry Entry di Aspek')
        }
        else{
            console.log('Entry di Aspek dihapus')
        }
        
    })

}


//////////////
//Parameters//
//////////////
function getParameters(req, res) {
    var idAspek = req.params.idAspek
    var idIndikator = req.params.idIndikator
    Indikator.findOne({aspek:idAspek, index:idIndikator}, (errInd,resInd) => {
        if(errInd){
            res.send(errInd)
        }
        else if(!resInd){
            res.send('Indikator belum ada')
        }
        else{
        }
        Parameter.find({aspek: idAspek, indikator: idIndikator}, (err,result) => {
            if(err){
                res.send(err)
            }
            else{
                res.render('tabel/tabelParameter', {result: result, idAspek: idAspek, idIndikator: idIndikator, resInd:resInd})
            }
        })
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

//Delete Parameter
function deleteParameter(parameterT, indikatorT, aspekT){
    IDParameter = parameterT
    indikator = indikatorT
    aspek = aspekT
    FaktorSchema.deleteMany({IDParameter}, (err,res) =>{
        if(err){
            console.log('Gagal menghapus Sub-Faktor')
        }
        else{
            console.log('Sub-Faktor dihapus')
        }
        
    })
    SubParameter.deleteMany({IDParameter}, (err,res) =>{
        if(err){
            console.log('Gagal menghapus Sub-Parameter')
        }
        else{
            console.log('Sub-Parameter dihapus')
        }
        
    })
    Parameter.deleteOne({IDPertanyaan: IDParameter}, (err,res) =>{
        if(err){
            console.log('Gagal menghapus Parameter')
        }
        else{
            console.log('Parameter dihapus')
        }
        
    })
    Indikator.findOneAndUpdate({index:indikator, aspek},{$inc:{jumlahParameter: -1}}, {upsert: true} , (err,res) =>{
        if(err){
            console.log('Gagal menghapus Entry Entry di Indikator')
        }
        else{
            console.log('Entry di Indikator dihapus')
        }
        
    })
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
                    res.render('tabel/tabelSubParameter', {data:result, dataParameter:resultParameter, idAspek:idAspek, idIndikator:idIndikator, header:result[0]})
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

//Delete Sub-Parameter
function deleteSubParameter(parameterT, subParameterT){
    IDParameter = parameterT
    IndexSubParameter = subParameterT
    FaktorSchema.deleteMany({IDParameter, IndexSubParameter}, (err,res) =>{
        if(err){
            console.log('Gagal menghapus Sub-Faktor')
        }
        else{
            console.log('Sub-Faktor dihapus')
        }
        
    })
    SubParameter.deleteOne({IDParameter, IndexSubParameter}, (err,res) =>{
        if(err){
            console.log('Gagal menghapus Sub-Parameter')
        }
        else{
            console.log('Sub-Parameter dihapus')
        }
        
    })

    Parameter.findOneAndUpdate({IDPertanyaan:IDParameter},{$inc:{jumlahSubParameter: -1}}, {upsert: true} , (err,res) =>{
        if(err){
            console.log('Gagal menghapus Entry Entry di Parameter')
        }
        else{
            console.log('Entry di Parameter dihapus')
        }
        
    })
}


//Get Sub-Faktor
function getFaktors(req, res, aspekT, indikatorT, IDParameterT, IndexSubParameterT) {
    aspek = aspekT
    indikator = indikatorT
    IDParameter = IDParameterT
    IndexSubParameter = IndexSubParameterT
    SubParameter.findOne({aspek, indikator, IDParameter, IndexSubParameter}, (errorSub,resultSub) => {
        if(errorSub){
            res.send(errorSub)
        }
        else if(!resultSub){
            res.send('Sub-parameter tidak ditemukan')
        }
        else{
            FaktorSchema.find({aspek, indikator, IDParameter, IndexSubParameter}, (err,result) =>{
                if(err){
                    res.send(err)
                }
                else{
                console.log(result)
                res.render('tabel/tabelFaktorSubP', {
                    result:result, 
                    idAspek:aspekT, 
                    idIndikator:indikatorT, 
                    idParameter:IDParameterT, 
                    subParameter: resultSub})
                }
            })
        }
    })

}

function addFaktors(req,res, FaktorT, aspekT, indikatorT, IDParameterT, IndexSubParameterT, IndexFaktor){
    faktor = FaktorT
    aspek = aspekT
    indikator = indikatorT
    IDParameter = IDParameterT
    IndexSubParameter = IndexSubParameterT
    skor = 0
    buktiPemenuhan = ''
    
    IDFaktor = createFaktorID(IDParameter, IndexSubParameter, IndexFaktor)

    FaktorSchema.findOneAndUpdate(
        {IDFaktor}, 
        {faktor, aspek, indikator, IDParameter, IndexSubParameter, IDFaktor, skor, buktiPemenuhan}, 
        {upsert:true}
        ,(err, result) =>{
            if(err){
                res.send(err)
            }
            else{
                console.log(result)
                SubParameter.findOneAndUpdate(
                    {IDParameter, IndexSubParameter},
                    {$inc: {'jumlahFaktor':1}},
                    {upsert:true},
                    (error,resultS) =>{
                        if(error)
                        {
                            res.send(error)
                        }
                        else{
                            console.log(resultS)
                        }
                    })
                res.redirect('/'+ aspek +'/'+ indikator + '/' + IDParameter + '/' + IndexSubParameter + '/')
            }
        })

}

//Delete Sub-Parameter
function deleteFaktor(aspekT, indikatorT, parameterT, subParameterT, idFaktor){
    aspek = aspekT
    indikator = indikatorT
    IDParameter = parameterT
    IndexSubParameter = subParameterT
    IDFaktor = idFaktor

    FaktorSchema.deleteOne({aspek, indikator, IDParameter, IndexSubParameter, IDFaktor}, (err,res) =>{
        if(err){
            console.log('Gagal menghapus Faktor')
        }
        else{
            console.log(res)
            console.log('Faktor dihapus')
        }
        
    })

    SubParameter.findOneAndUpdate({aspek, indikator, IDParameter, IndexSubParameter},{$inc:{jumlahFaktor: -1}}, {upsert: true} , (err,res) =>{
        if(err){
            console.log('Gagal menghapus Entry Entry di Sub-Parameter')
        }
        else{
            console.log('Entry di Sub-Parameter dihapus')
        }
        
    })
}


function createID(aspekID, indikatorID, NoParameter){
    var id = ""
    s = "P" + aspekID.toString() + "-" + indikatorID.toString() + "-" + NoParameter.toString()
    return s
}

function createFaktorID(parameterID, SubParameterID, IndexFaktor){
    var id = ""
    s = "SF" + '-' + parameterID.toString() + "-" + SubParameterID.toString() + "-" + IndexFaktor.toString()
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