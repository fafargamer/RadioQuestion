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
const { reset } = require('nodemon');

mongoose.set('useFindAndModify', false);

//Get Aspeks
// app.get('/', (req,res) =>{
//     res.render('isiParameter')
// })

app.get('/', isLoggedIn, (req,res) =>{
    Aspek.find({}, (err,result) =>{
        if(err){
            res.send(err)
        }
        else{
            res.render('admin/GCG/tabelAspek', {result:result})
        }
    })
})

//Get tambah Aspek
app.get('/addAspek', isLoggedIn, (req,res) =>{
    if (req.user.typeUser == 'Admin' || req.user.typeUser == 'Super-user') {
        res.render('admin/GCG/tambah/tambahAspek')
    }
    else {
        req.flash('errDeclined', 'Maaf Anda tidak berhak untuk mengakses fitur tersebut')
        res.render('admin/notFound', {message:req.flash('errDeclined')})
    }
})

//Post Aspek
app.post('/addAspek', isLoggedIn, (req,res) =>{
    
    if (req.user.typeUser == 'Admin' || req.user.typeUser == 'Super-user') {
        addAspek(req,res)
    }
    else {
        req.flash('errDeclined', 'Maaf Anda tidak berhak untuk mengakses fitur tersebut')
        res.render('admin/notFound', {message:req.flash('errDeclined')})
    }
})

//Hapus Aspek
app.get('/hapusAspek/:idAspek', isLoggedIn, (req,res) => {

    if (req.user.typeUser == 'Admin' || req.user.typeUser == 'Super-user') {
        aspekT = req.params.idAspek
        deleteAspek(aspekT)
        res.redirect('/GCGData')
    }
    else {
        req.flash('errDeclined', 'Maaf Anda tidak berhak untuk mengakses fitur tersebut')
        res.render('admin/notFound', {message:req.flash('errDeclined')})
    }


})



//Get Indikators
app.get('/:idAspek', isLoggedIn, (req,res) =>{
    if (req.user.typeUser == 'Admin' || req.user.typeUser == 'Super-user') {
        getIndikators(req,res)
    }
    else if(req.user.aspekUser == req.params.idAspek){
        getIndikators(req,res)
    }
    else {
        req.flash('errDeclined', 'Maaf Anda tidak berhak untuk mengakses fitur tersebut')
        res.render('admin/notFound', {message:req.flash('errDeclined')})
    }
})

//Tambah Indikator (HTML)
app.get('/:idAspek/addIndikator', isLoggedIn, (req,res) =>{
    if (req.user.typeUser == 'Admin' || req.user.typeUser == 'Super-user') {
        var idAspek = req.params.idAspek
        res.render('admin/GCG/tambah/tambahIndikator', {idAspek: idAspek, errMsg: req.flash('infoFailAddI')})
    }
    else if(req.user.aspekUser == req.params.idAspek){
        var idAspek = req.params.idAspek
        res.render('admin/GCG/tambah/tambahIndikator', {idAspek: idAspek, errMsg: req.flash('infoFailAddI')})
    }
    else {
        req.flash('errDeclined', 'Maaf Anda tidak berhak untuk mengakses fitur tersebut')
        res.render('admin/notFound', {message:req.flash('errDeclined')})
    }
})

app.post('/addIndikator', isLoggedIn, (req,res) =>{
    if (req.user.typeUser == 'Admin' || req.user.typeUser == 'Super-user') {
        addIndikator(req,res)
    }
    else if(req.user.aspekUser == req.body.inputAspek){
        addIndikator(req,res)
    }
    else {
        req.flash('errDeclined', 'Maaf Anda tidak berhak untuk mengakses fitur tersebut')
        res.render('admin/notFound', {message:req.flash('errDeclined')})
    }
    
})

//Hapus Indikator dan lainnya
app.get('/:idAspek/hapusIndikator/:idIndikator', isLoggedIn, (req,res) => {
    indikatorT = req.params.idIndikator
    aspekT = req.params.idAspek

    if (req.user.typeUser == 'Admin' || req.user.typeUser == 'Super-user') {
        deleteIndikator(indikatorT, aspekT)
        res.redirect('/GCGData/'+req.params.idAspek)
    }
    else if(req.user.aspekUser == req.params.idAspek){
        deleteIndikator(indikatorT, aspekT)
        res.redirect('/GCGData/'+req.params.idAspek)
    }
    else {
        req.flash('errDeclined', 'Maaf Anda tidak berhak untuk mengakses fitur tersebut')
        res.render('admin/notFound', {message:req.flash('errDeclined')})
    }
})


//Get parameters
app.get('/:idAspek/:idIndikator', isLoggedIn, (req,res) =>{
    if (req.user.typeUser == 'Admin' || req.user.typeUser == 'Super-user') {
        getParameters(req, res)
    }
    else if(req.user.aspekUser == req.params.idAspek){
        getParameters(req, res)
    }
    else {
        req.flash('errDeclined', 'Maaf Anda tidak berhak untuk mengakses fitur tersebut')
        res.render('admin/notFound', {message:req.flash('errDeclined')})
    }
})

//Tambah Parameter (HTML)
app.get('/:idAspek/:idIndikator/addParameter', isLoggedIn, (req,res) =>{
    var idAspek = req.params.idAspek
    var idIndikator = req.params.idIndikator

    if (req.user.typeUser == 'Admin' || req.user.typeUser == 'Super-user') {
        res.render('admin/GCG/tambah/tambahParameter', {idAspek: idAspek, idIndikator: idIndikator, errMsg: req.flash('infoFailAddP')})
    }
    else if(req.user.aspekUser == req.params.idAspek){
        res.render('admin/GCG/tambah/tambahParameter', {idAspek: idAspek, idIndikator: idIndikator, errMsg: req.flash('infoFailAddP')})
    }
    else {
        req.flash('errDeclined', 'Maaf Anda tidak berhak untuk mengakses fitur tersebut')
        res.render('admin/notFound', {message:req.flash('errDeclined')})
    }
})

//Tambah parameter (Post)
app.post('/addParameter', isLoggedIn, (req, res) => {
    if (req.user.typeUser == 'Admin' || req.user.typeUser == 'Super-user') {
        insertQuestion(req, res);
    }
    else if(req.user.aspekUser == req.body.inputAspek){
        insertQuestion(req, res);
    }
    else {
        req.flash('errDeclined', 'Maaf Anda tidak berhak untuk mengakses fitur tersebut')
        res.render('admin/notFound', {message:req.flash('errDeclined')})
    }
    // res.send('Parameter sudah ada')
});

//Delete Parameter dan lainnya
app.get('/:idAspek/:idIndikator/hapusParameter/:idParameter', isLoggedIn, (req,res) => {
    parameterT = req.params.idParameter
    indikatorT = req.params.idIndikator
    aspekT = req.params.idAspek

    if (req.user.typeUser == 'Admin' || req.user.typeUser == 'Super-user') {
        deleteParameter(parameterT, indikatorT, aspekT)
        res.redirect('/GCGData/'+req.params.idAspek+'/'+req.params.idIndikator)
    }
    else if(req.user.aspekUser == req.body.inputAspek){
        deleteParameter(parameterT, indikatorT, aspekT)
        res.redirect('/GCGData/'+req.params.idAspek+'/'+req.params.idIndikator)
    }
    else {
        req.flash('errDeclined', 'Maaf Anda tidak berhak untuk mengakses fitur tersebut')
        res.render('admin/notFound', {message:req.flash('errDeclined')})
    }

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
    res.render('admin/GCG/tambah/tambahSubParameter', {parameterID: ParameterID, idAspek:idAspek, idIndikator:idIndikator, errMsg: req.flash('infoFailAddSP')})
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
    res.redirect('/GCGData/'+req.params.idAspek+'/'+req.params.idIndikator+'/'+req.params.idParameter+'/')
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
            // console.log(result)
            // console.log(req.flash('subFaktorAddStatus'))
            res.render('admin/GCG/tambah/tambahFaktor', {aspek, indikator, IDParameter, result:result, message:req.flash('infoFailAddFaktor')})
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
    catatanFaktor = req.body.inputCatatan

    
    addFaktors(req,res, Faktor, aspek, indikator, idParameter, idSubParameter, IndexFaktor, catatanFaktor)
})

//Delete Faktor
app.get('/:idAspek/:idIndikator/:idParameter/:idSubParameter/hapusFaktor/:idFaktor/', (req,res) => {
    parameterT = req.params.idParameter
    subParameterT = req.params.idSubParameter
    aspekT = req.params.idAspek
    indikatorT = req.params.idIndikator
    IDFaktor = req.params.idFaktor

    deleteFaktor(aspekT, indikatorT, parameterT,subParameterT, IDFaktor)
    res.redirect('/GCGData/'+req.params.idAspek+'/'+req.params.idIndikator+'/'+req.params.idParameter+'/'+req.params.idSubParameter+'/')
})

//Get faktor form
app.get('/:idAspek/:idIndikator/:idParams/:idSubParams/:idFaktor/fillForm/', (req,res) => {
    IDParameter = req.params.idParams
    IndexSubParameter = req.params.idSubParams
    aspek = req.params.idAspek
    indikator = req.params.idIndikator
    IDFaktor = req.params.idFaktor

    FaktorSchema.findOne({aspek, indikator, IDParameter, IndexSubParameter, IDFaktor}, (err,result) =>{
        if(err)
        {
            res.send(err)
        }
        else if(!res){
            res.send('Faktor tidak ada')
        }
        else{
            res.render('admin/GCG/isiFaktor/isi', {data:result})
        }
    })
})

//Post penilaian Faktor
app.post('/postPenilaian', (req,res) => {
    IDFaktor = req.body.inputID
    buktiPemenuhan = req.body.inputPemenuhan
    skor = req.body.inputNilai

    console.log(req.body)

    

    FaktorSchema.findOneAndUpdate({IDFaktor} , {buktiPemenuhan, skor}, {upsert:true}, (err,result) => {
        if(err){
            res.send(err)
        }
        else{
            console.log(result)
            res.redirect('/GCGData/'+result.aspek+'/'+result.indikator+'/'+result.IDParameter+'/'+result.IndexSubParameter+'/')
        }
    })
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
                    res.redirect('/GCGdata/')
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
            // res.send('Aspek belum ada')
            req.flash('notFoundMsg', 'Aspek tidak ditemukan');
            res.render('admin/notFound.ejs', {message: req.flash('notFoundMsg')})
        }
        else{
            Indikator.find({aspek:aspek}, (errIndikator, resultIndikator) => {
                if(errIndikator){
                    res.send(errIndikator)
                }
                else{
                    res.render('admin/GCG/tabelIndikator.ejs', {result:resultIndikator, idAspek:aspek, resAsp})
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
    Indikator.findOne({aspek: indikator.aspek, index:indikator.index}, (errFind,resFind) =>{
        if(errFind){
            res.send(errFind)
        }
        else if(resFind){
            console.log('Indikator dengan ID yang sama sudah ada')
            req.flash('infoFailAddI', 'Indikator sudah ada');
            res.redirect('back')
        }
        else{
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
                    res.redirect('/GCGData/'+req.body.inputAspek)
                }
            })
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
            Parameter.find({aspek: idAspek, indikator: idIndikator}, (err,result) => {
                if(err){
                    res.send(err)
                }
                else{
                    var totalSkor = []
    
                    // skorArray = {}
                    // skorArray = result.skor
    
    
    
                    if(result.length > 0){
                        var totalSkor = countScore(result)
                        console.log("total skor = " + totalSkor)
                        console.log("bobot = " + resInd.bobot)
                        // totalSkor = totalSkor * resInd.bobot
                        console.log("final skor = " + totalSkor)
                        Indikator.findOneAndUpdate({aspek:idAspek, index:idIndikator}, {nilai:totalSkor}, {upsert:true}, (errUpdSub,resUpdSub) =>{
                            if(errUpdSub){
                                console.log(errUpdSub)
                            }
                            else{
                               console.log(resUpdSub)
                            }
                        })
                    }
                    res.render('admin/GCG/tabelParameter', {result: result, idAspek: idAspek, idIndikator: idIndikator, resInd:resInd})
                }
            })
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
            console.log('Parameter dengan ID yang sama sudah ada')
            req.flash('infoFailAddP', 'Parameter sudah ada');
            res.redirect('back')
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
                    res.redirect('/GCGData/'+ req.body.inputAspek + '/' + req.body.inputIndikator);
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

                    var totalSkor = []

                    // skorArray = {}
                    // skorArray = result.skor
    
    
    
                    if(result.length > 0){
                        var totalSkor = countScoreParameter(result)
                        totalSkor = totalSkor * resultParameter.bobot
                        Parameter.findOneAndUpdate({IDPertanyaan: IDParameter}, {nilai:totalSkor}, {upsert:true}, (errUpdSub,resUpdSub) =>{
                            if(errUpdSub){
                                console.log(errUpdSub)
                            }
                            else{
                               console.log(resUpdSub)
                            }
                        })
                    }
                    else{
                        var totalSkor = 0
                    }
                    console.log(result)

                    var percentData = toPercentageData(result)
                    res.render('admin/GCG/tabelSubParameter', {data:result, dataParameter:resultParameter, idAspek:idAspek, idIndikator:idIndikator, header:result[0], percentData:percentData})
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
            console.log("Sub-Parameter sudah ada")
            req.flash('infoFailAddSP', 'Sub-Parameter sudah ada');
            res.redirect('back')
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
                    res.redirect('/GCGData/'+ subParameter.aspek +'/'+ subParameter.indikator + '/' + subParameter.IDParameter + '/')
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
                var totalSkor = []

                // skorArray = {}
                // skorArray = result.skor



                if(result.length > 0){
                    var totalSkor = countScoreFaktor(result)
                    SubParameter.findOneAndUpdate({aspek, indikator, IDParameter, IndexSubParameter}, {nilai:totalSkor}, {upsert:true}, (errUpdSub,resUpdSub) =>{
                        if(errUpdSub){
                            console.log(errUpdSub)
                        }
                        else{
                           console.log(resUpdSub)
                        }
                    })
                }
                else{
                    var totalSkor = 0
                }

                res.render('admin/GCG/tabelFaktor', {
                    result:result, 
                    idAspek:aspekT, 
                    idIndikator:indikatorT, 
                    idParameter:IDParameterT, 
                    subParameter: resultSub,
                    totalSkor: totalSkor
                })
                }
            })
        }
    })

}

function addFaktors(req,res, FaktorT, aspekT, indikatorT, IDParameterT, IndexSubParameterT, IndexFaktor, catatanFaktor){
    
    faktor = FaktorT
    aspek = aspekT
    indikator = indikatorT
    IDParameter = IDParameterT
    IndexSubParameter = IndexSubParameterT
    catatan = catatanFaktor
    skor = 0
    buktiPemenuhan = ''
    catatanBukti = ''
    
    IDFaktor = createFaktorID(IDParameter, IndexSubParameter, IndexFaktor)

    faktorIns = new FaktorSchema();
    faktorIns.faktor = FaktorT
    faktorIns.aspek = aspekT
    faktorIns.indikator = indikatorT
    faktorIns.IDParameter = IDParameterT
    faktorIns.IndexSubParameter = IndexSubParameterT
    faktorIns.skor = 0
    faktorIns.buktiPemenuhan = ''
    faktorIns.IDFaktor = IDFaktor
    faktorIns.catatan = catatan
    faktorIns.catatanBukti = catatanBukti

    FaktorSchema.findOne({IDFaktor}, (errFind,resFind) =>{
        if(errFind){
            res.send(errFind)
        }
        else if(resFind){
            console.log('Faktor sudah ada')
            // req.session.save( function(){ 
                req.flash('infoFailAddFaktor', 'Faktor sudah ada');
                res.redirect('back')
            // })

        }
        else{
            faktorIns.save((errSave,resSave) =>{
                if(errSave){
                    res.send(errSave)
                }
                else{
                    console.log('Hasil input Faktor : \n')
                    console.log(resSave)
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
                    res.redirect('/GCGData/'+ aspek +'/'+ indikator + '/' + IDParameter + '/' + IndexSubParameter + '/')
                }
            })
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

function countScoreFaktor(data) {
    
    var totalSkor = 0
    for (var i=data.length; i--;) {
      totalSkor+=data[i].skor;
    }
    totalSkor = totalSkor/data.length
    
    return totalSkor
}

function countScore(data) {
    
    var totalSkor = 0
    for (var i=data.length; i--;) {
      console.log("nilai : " + data[i].nilai)
      totalSkor+=data[i].nilai;
    }
    
    
    return totalSkor
}

function countScoreParameter(data) {
    
    var totalSkor = 0
    for (var i=data.length; i--;) {
      console.log("nilai : " + data[i].nilai)
      totalSkor+=data[i].nilai;
    }

    totalSkor = totalSkor/data.length
    
    
    return totalSkor
}

function toPercentageData(data) {
    percentageArr = []

    for(var i=data.length; i--;) {
        percentageArr[i] = toPercentage(data[i].nilai) + '%'
    }

    return percentageArr
}

function toPercentage(data) {

    data = data * 100
    return data
}

function isLoggedIn(req, res, next) {
    console.log('Loggin in....')
    if (req.isAuthenticated()) {
      return next();
    }
    else {
      res.redirect('/login');
    }
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