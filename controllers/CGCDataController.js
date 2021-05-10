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

const multer = require('multer')
const fs = require('fs')
const path = require('path');

mongoose.set('useFindAndModify', false);

// app.use(express.bodyParser());

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
            res.render('admin/GCG/tabelAspek', {result:result, user:req.user})
        }
    })
})

//Get tambah Aspek
app.get('/addAspek', isLoggedIn, (req,res) =>{
    if (req.user.typeUser == 'Admin' || req.user.typeUser == 'Super-user') {
        res.render('admin/GCG/tambah/tambahAspek', {user:req.user})
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

//Update Aspek
app.get('/updateAspek/:idAspek', isLoggedIn, (req,res) => {

    if (req.user.typeUser == 'Admin' || req.user.typeUser == 'Super-user') {
        updateAspekGet(req,res)
    }
    else {
        req.flash('errDeclined', 'Maaf Anda tidak berhak untuk mengakses fitur tersebut')
        res.render('admin/notFound', {message:req.flash('errDeclined')})
    }


})

//Post Update Aspek
app.post('/updateAspek', isLoggedIn, (req,res) => {
    if (req.user.typeUser == 'Admin' || req.user.typeUser == 'Super-user') {
        updateAspek(req,res)
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
        res.render('admin/GCG/tambah/tambahIndikator', {idAspek: idAspek, user:req.user, errMsg: req.flash('infoFailAddI')})
    }
    else if(req.user.aspekUser == req.params.idAspek){
        var idAspek = req.params.idAspek
        res.render('admin/GCG/tambah/tambahIndikator', {idAspek: idAspek, user:req.user, errMsg: req.flash('infoFailAddI')})
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

//Update Indikator
app.get('/:idAspek/updateIndikator/:idIndikator', isLoggedIn, (req,res) => {

    if (req.user.typeUser == 'Admin' || req.user.typeUser == 'Super-user') {
        updateIndikatorGet(req,res)
    }
    else {
        req.flash('errDeclined', 'Maaf Anda tidak berhak untuk mengakses fitur tersebut')
        res.render('admin/notFound', {message:req.flash('errDeclined')})
    }


})

//Post Update Indikator
app.post('/updateIndikator', isLoggedIn, (req,res) => {
    if (req.user.typeUser == 'Admin' || req.user.typeUser == 'Super-user') {
        updateIndikator(req,res)
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
        res.render('admin/GCG/tambah/tambahParameter', {idAspek: idAspek, idIndikator: idIndikator, user:req.user, errMsg: req.flash('infoFailAddP')})
    }
    else if(req.user.aspekUser == req.params.idAspek){
        res.render('admin/GCG/tambah/tambahParameter', {idAspek: idAspek, idIndikator: idIndikator, user:req.user, errMsg: req.flash('infoFailAddP')})
    }
    else {
        req.flash('errDeclined', 'Maaf Anda tidak berhak untuk mengakses fitur tersebut')
        res.render('admin/notFound', {message:req.flash('errDeclined')})
    }
})

//Tambah parameter (Post)
app.post('/addParameter', isLoggedIn, (req, res) => {
    if (req.user.typeUser == 'Admin' || req.user.typeUser == 'Super-user') {
        addParameter(req, res);
    }
    else if(req.user.aspekUser == req.body.inputAspek){
        addParameter(req, res);
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

//Update Parameter
app.get('/:idAspek/:idIndikator/updateParameter/:idParameter', isLoggedIn, (req,res) => {

    if (req.user.typeUser == 'Admin' || req.user.typeUser == 'Super-user') {
        updateParameterGet(req,res)
    }
    else {
        req.flash('errDeclined', 'Maaf Anda tidak berhak untuk mengakses fitur tersebut')
        res.render('admin/notFound', {message:req.flash('errDeclined')})
    }


})

//Post Update Parameter
app.post('/updateParameter', isLoggedIn, (req,res) => {
    if (req.user.typeUser == 'Admin' || req.user.typeUser == 'Super-user') {
        updateParameter(req,res)
    }
    else {
        req.flash('errDeclined', 'Maaf Anda tidak berhak untuk mengakses fitur tersebut')
        res.render('admin/notFound', {message:req.flash('errDeclined')})
    }


})



//Tabel sub-parameter (HTML)
app.get('/:idAspek/:idIndikator/:idparams', isLoggedIn, (req,res) =>{
    if (req.user.typeUser == 'Admin' || req.user.typeUser == 'Super-user') {
        getSubParameters(req, res)
    }
    else if(req.user.aspekUser == req.body.inputAspek){
        getSubParameters(req, res)
    }
    else {
        req.flash('errDeclined', 'Maaf Anda tidak berhak untuk mengakses fitur tersebut')
        res.render('admin/notFound', {message:req.flash('errDeclined')})
    }
    
})

//Tambah sub-parameter (HTML)
app.get('/:idAspek/:idIndikator/:idparams/addSubParameter', isLoggedIn, (req,res) =>{
    ParameterID = req.params.idparams
    idAspek = req.params.idAspek
    idIndikator = req.params.idIndikator
    if (req.user.typeUser == 'Admin' || req.user.typeUser == 'Super-user') {
        res.render('admin/GCG/tambah/tambahSubParameter', {parameterID: ParameterID, idAspek:idAspek, idIndikator:idIndikator, user:req.user, errMsg: req.flash('infoFailAddSP')})
    }
    else if(req.user.aspekUser == req.body.inputAspek){
        res.render('admin/GCG/tambah/tambahSubParameter', {parameterID: ParameterID, idAspek:idAspek, idIndikator:idIndikator, user:req.user, errMsg: req.flash('infoFailAddSP')})
    }
    else {
        req.flash('errDeclined', 'Maaf Anda tidak berhak untuk mengakses fitur tersebut')
        res.render('admin/notFound', {message:req.flash('errDeclined')})
    }
 
})

//Tambah sub-parameter (Post)
app.post('/addSubParameter', (req,res) =>{
    addSubParameter(req, res)
})

//Delete Sub-Parameter dan lainnya
app.get('/:idAspek/:idIndikator/:idParameter/hapusSubParameter/:idSubParameter/', isLoggedIn, (req,res) => {
    parameterT = req.params.idParameter
    subParameterT = req.params.idSubParameter

    if (req.user.typeUser == 'Admin' || req.user.typeUser == 'Super-user') {
        deleteSubParameter(parameterT,subParameterT)
        res.redirect('/GCGData/'+req.params.idAspek+'/'+req.params.idIndikator+'/'+req.params.idParameter+'/')
    }
    else if(req.user.aspekUser == req.body.inputAspek){
        deleteSubParameter(parameterT,subParameterT)
        res.redirect('/GCGData/'+req.params.idAspek+'/'+req.params.idIndikator+'/'+req.params.idParameter+'/')
    }
    else {
        req.flash('errDeclined', 'Maaf Anda tidak berhak untuk mengakses fitur tersebut')
        res.render('admin/notFound', {message:req.flash('errDeclined')})
    }


})

//Update Sub-Parameter
app.get('/:idAspek/:idIndikator/:idParameter/updateSubParameter/:idSubParameter/', isLoggedIn, (req,res) => {

    if (req.user.typeUser == 'Admin' || req.user.typeUser == 'Super-user') {
        updateSubParameterGet(req,res)
    }
    else {
        req.flash('errDeclined', 'Maaf Anda tidak berhak untuk mengakses fitur tersebut')
        res.render('admin/notFound', {message:req.flash('errDeclined')})
    }


})

//Post Update Sub-Parameter
app.post('/updateSubParameter', isLoggedIn, (req,res) => {
    if (req.user.typeUser == 'Admin' || req.user.typeUser == 'Super-user') {
        updateSubParameter(req,res)
    }
    else {
        req.flash('errDeclined', 'Maaf Anda tidak berhak untuk mengakses fitur tersebut')
        res.render('admin/notFound', {message:req.flash('errDeclined')})
    }


})


//Get Faktor (HTML)
app.get('/:idAspek/:idIndikator/:idparams/:idsubparameter/', isLoggedIn, (req,res) =>{
    idAspek = req.params.idAspek
    idIndikator = req.params.idIndikator
    idparams = req.params.idparams
    idsubparameter = req.params.idsubparameter

    if (req.user.typeUser == 'Admin' || req.user.typeUser == 'Super-user') {
        getFaktors(req, res, idAspek, idIndikator, idparams, idsubparameter)
    }
    else if(req.user.aspekUser == req.body.inputAspek){
        getFaktors(req, res, idAspek, idIndikator, idparams, idsubparameter)
    }
    else {
        req.flash('errDeclined', 'Maaf Anda tidak berhak untuk mengakses fitur tersebut')
        res.render('admin/notFound', {message:req.flash('errDeclined')})
    }

    

    // console.log(dataSubFaktor)
    // res.send(dataSubFaktor)
})

//Get Faktor Tambah (HTML)
app.get('/:idAspek/:idIndikator/:idParams/:idSubParams/addFaktor/', isLoggedIn, (req,res) =>{
    aspek = req.params.idAspek
    indikator = req.params.idIndikator
    IDParameter = req.params.idParams
    IndexSubParameter = req.params.idSubParams

    if (req.user.typeUser == 'Admin' || req.user.typeUser == 'Super-user') {
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
                res.render('admin/GCG/tambah/tambahFaktor', {aspek, indikator, IDParameter, result:result, user:req.user, message:req.flash('infoFailAddFaktor')})
            }
        })
    }
    else if(req.user.aspekUser == req.body.inputAspek){
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
                res.render('admin/GCG/tambah/tambahFaktor', {aspek, indikator, IDParameter, result:result, user:req.user, message:req.flash('infoFailAddFaktor')})
            }
        })
    }
    else {
        req.flash('errDeclined', 'Maaf Anda tidak berhak untuk mengakses fitur tersebut')
        res.render('admin/notFound', {message:req.flash('errDeclined')})
    }
})

//Add Faktor
app.post('/addFaktor', isLoggedIn, (req,res) => {
    idSubParameter = req.body.idSubParameter
    idParameter = req.body.idParameter
    aspek = req.body.inputAspek
    indikator = req.body.inputIndikator
    Faktor = req.body.inputFaktor
    IndexFaktor = req.body.inputIndex
    catatanFaktor = req.body.inputCatatan

    if (req.user.typeUser == 'Admin' || req.user.typeUser == 'Super-user') {
        addFaktors(req,res, Faktor, aspek, indikator, idParameter, idSubParameter, IndexFaktor, catatanFaktor)
    }
    else if(req.user.aspekUser == aspek){
        addFaktors(req,res, Faktor, aspek, indikator, idParameter, idSubParameter, IndexFaktor, catatanFaktor)
    }
    else {
        req.flash('errDeclined', 'Maaf Anda tidak berhak untuk mengakses fitur tersebut')
        res.render('admin/notFound', {message:req.flash('errDeclined')})
    }
})

//Delete Faktor
app.get('/:idAspek/:idIndikator/:idParameter/:idSubParameter/hapusFaktor/:Index/', isLoggedIn, (req,res) => {
    parameterT = req.params.idParameter
    subParameterT = req.params.idSubParameter
    aspekT = req.params.idAspek
    indikatorT = req.params.idIndikator
    Index = req.params.Index

    if (req.user.typeUser == 'Admin' || req.user.typeUser == 'Super-user') {
        deleteFaktor(aspekT, indikatorT, parameterT,subParameterT, Index)
        res.redirect('/GCGData/'+req.params.idAspek+'/'+req.params.idIndikator+'/'+req.params.idParameter+'/'+req.params.idSubParameter+'/')
    }
    else if(req.user.aspekUser == req.body.inputAspek){
        deleteFaktor(aspekT, indikatorT, parameterT,subParameterT, Index)
        res.redirect('/GCGData/'+req.params.idAspek+'/'+req.params.idIndikator+'/'+req.params.idParameter+'/'+req.params.idSubParameter+'/')
    }
    else {
        req.flash('errDeclined', 'Maaf Anda tidak berhak untuk mengakses fitur tersebut')
        res.render('admin/notFound', {message:req.flash('errDeclined')})
    }

   
})

//Get faktor form
app.get('/:idAspek/:idIndikator/:idParams/:idSubParams/:Index/fillForm/', isLoggedIn, (req,res) => {
    getFillForm(req,res)
})

app.post('/PostParameterExt/', isLoggedIn, (req,res) =>{
    PostParameterExt(req,res)
})

app.post('/postPenilaian', async function(req, res, next) {
    try {    
        const FaktorSchema = await berinilaiFaktor(req,res)
        const SubParameterRes = await nilaiSP(req,res)
        const ParameterRes = await nilaiPar(req,res)
        const IndikatorRes = await nilaiIndi(req,res)
        const AspekRes = await nilaiAspek(req,res)
        // console.log(resInd)
        // res.send(resInd[0].indikators)
        res.redirect('/all/')
        next();
    } catch (err) { 
        next(err)
    }
})

    // // console.log(inputFile)
    // const storage = multer.diskStorage({
    //     destination : path.join(__dirname + './../files/buktiFaktor/'),
    //     filename: function(req, file, cb){
    //         cb(null, 'bukti-' + req.body.inputAspek + '-' + req.body.inputIndikator + '-' + req.body.idParameter + '-' + req.body.idSubParameter + '-' + req.body.inputIndex + path.extname(file.originalname));
    //         // console.log(filename)
    //     }
    // });

    // const fileFilter = (req, file, cb) => {
    //     console.log('filename: ' + file.originalname)
    //     console.log('aspek: ' + req.body.inputAspek)
    //     // console.log('new filename ' + req.file.filename)
    //     // if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    //     //   cb(null, true);
    //     // } else {
    //     //   //rejects storing a file
    //     //   console.log('Wrong type')
    //     // //   res.redirect('/all/')
    //     //   cb(null, false);
    //     // }
    // };

    // const upload = multer({
    //     storage : storage,
    //     fileFilter: fileFilter
    // }).single('inputBuktiFaktor');

    app.post('/PostCatatan', isLoggedIn, (req,res,next) =>{
        // Index = req.body.Index
        // catatan = req.body.catatan
        // console.log('request header' + JSON.stringify(req.body))
        IndexSubParameter = req.body.idSubParameter
        IDParameter = req.body.idParameter
        aspek = req.body.inputAspek
        indikator = req.body.inputIndikator
        Index = req.body.inputIndex
        catatanBukti = req.body.catatan
        // inputFile = req.body.inputBuktiFaktor
        // console.log(req.files.inputBuktiFaktor.name)
    
        FaktorSchema.findOneAndUpdate({aspek, indikator, IDParameter, IndexSubParameter, Index}, {catatanBukti}, (err, result) =>{
            if(err){
                res.send(err)
            }
            else{
                console.log(catatanBukti)
                console.log("Catatan terupdate")
                res.redirect('back')
            }
        })          
        // res.redirect('/all/')
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

function updateAspekGet(req,res) {
    Aspek.findOne({index:req.params.idAspek}, (err,result) =>{
        if(err) {
            res.send(err)
        }
        else if(!result) {
            req.flash('notFoundMsg', 'Aspek tidak ditemukan');
            res.render('admin/notFound.ejs', {message: req.flash('notFoundMsg')})
        }
        else {
            res.render('admin/GCG/ubah/Aspek', {data:result, user:req.user, errMsg: req.flash('infoFailAddA')})
        }
    })
}

function updateAspek(req,res) {
    prevIndex = req.body.prevIndex
    aspek = req.body.inputAspek
    index = req.body.inputNoAspek
    bobot = req.body.inputBobot

    Aspek.findOne({index}, (err,result) =>  {
        if(err) {
            res.send(err)
        }
        else if (result && (prevIndex != index)) {
            console.log('Aspek dengan ID yang sama sudah ada')
            req.flash('infoFailAddA', 'Aspek sudah ada');
            res.redirect('back')
        }
        else {
            FaktorSchema.updateMany({aspek:prevIndex}, {aspek:index}, (errIndi,resIndi) => {
                if(errIndi) {
                    res.send(errIndi)
                }
                else {
                    console.log('Updated Faktors')
                }
            })
    
            SubParameter.updateMany({aspek:prevIndex}, {aspek:index}, (errIndi,resIndi) => {
                if(errIndi) {
                    res.send(errIndi)
                }
                else {
                    console.log('Updated SubParameters')
                }
            })
    
            Parameter.updateMany({aspek:prevIndex}, {aspek:index}, (errIndi,resIndi) => {
                if(errIndi) {
                    res.send(errIndi)
                }
                else {
                    console.log('Updated Parameters')
                }
            })
    
            Indikator.updateMany({aspek:prevIndex}, {aspek:index}, (errIndi,resIndi) => {
                if(errIndi) {
                    res.send(errIndi)
                }
                else {
                    console.log('Updated Indikators')
                }
            })
    
            Aspek.findOneAndUpdate({index : prevIndex}, {index, aspek, bobot}, (errAs,resAs) =>{
                if(errAs){
                    res.send(errAs)
                }
                else{
                    console.log(resAs)
                    res.redirect('/GCGdata/')
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
                    res.render('admin/GCG/tabelIndikator.ejs', {result:resultIndikator, idAspek:aspek, user:req.user, resAsp})
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
    Aspek.findOne({index:indikator.aspek}, (errAsp,resAsp) => {
        if(errAsp) {
            res.send(errAsp)
        }
        else if(!resAsp) {
            console.log('Aspek ga ada')
            req.flash('infoFailAddI', 'Aspek tidak ada');
            res.redirect('back')
        }
        else {
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
                    indikator.aspekWritten = resAsp.aspek
                    indikator.save((error,indikator) =>{
                        if(error){
                            res.send(error)
                        }
                        else{
                            console.log(indikator)
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
    })

}

//Delete Indikator
function deleteIndikator(indikatorT, aspekT){
    indikator = indikatorT
    aspek = aspekT
    FaktorSchema.deleteMany({aspek, indikator}, (err,res) =>{
        if(err){
            console.log('Gagal menghapus Sub-Faktor')
        }
        else{
            console.log('Sub-Faktor dihapus')
        }
        
    })
    SubParameter.deleteMany({aspek, indikator}, (err,res) =>{
        if(err){
            console.log('Gagal menghapus Sub-Parameter')
        }
        else{
            console.log('Sub-Parameter dihapus')
        }
        
    })
    Parameter.deleteMany({aspek, indikator}, (err,res) =>{
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

function updateIndikatorGet(req,res) {
    idAspek = req.params.idAspek
    Indikator.findOne({aspek:req.params.idAspek, index:req.params.idIndikator}, (err,result) =>{
        if(err) {
            res.send(err)
        }
        else if(!result) {
            req.flash('notFoundMsg', 'Aspek tidak ditemukan');
            res.render('admin/notFound.ejs', {message: req.flash('notFoundMsg')})
        }
        else {
            res.render('admin/GCG/ubah/Indikator', {idAspek:idAspek, data:result, user:req.user, errMsg: req.flash('infoFailAddI')})
        }
    })
}


function updateIndikator(req,res) {
    prevIndex = req.body.prevIndex
    aspek = req.body.inputAspek
    indikator = req.body.inputIndikator
    index = req.body.inputNoIndikator
    bobot = req.body.inputBobot

    Indikator.findOne({aspek,index}, (err,result) =>  {
        if(err) {
            res.send(err)
        }
        else if (result && (prevIndex != index)) {
            console.log('Indikator dengan ID yang sama sudah ada')
            req.flash('infoFailAddI', 'Indikator sudah ada');
            res.redirect('back')
        }
        else {
            FaktorSchema.updateMany({aspek,indikator:prevIndex}, {indikator:index}, (errIndi,resIndi) => {
                if(errIndi) {
                    res.send(errIndi)
                }
                else {
                    console.log('Updated Faktors')
                }
            })
    
            SubParameter.updateMany({aspek,indikator:prevIndex}, {indikator:index}, (errIndi,resIndi) => {
                if(errIndi) {
                    res.send(errIndi)
                }
                else {
                    console.log('Updated SubParameters')
                }
            })
    
            Parameter.updateMany({aspek,indikator:prevIndex}, {indikator:index}, (errIndi,resIndi) => {
                if(errIndi) {
                    res.send(errIndi)
                }
                else {
                    console.log('Updated Parameters')
                }
            })
            Indikator.findOneAndUpdate({aspek, index:prevIndex}, {index, indikator, bobot}, (errAs,resAs) =>{
                if(errAs){
                    res.send(errAs)
                }
                else{
                    console.log(resAs)
                    res.redirect('/GCGdata/'+aspek+'/')
                }
            })
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
                    // var totalSkor = []
    
                    // // skorArray = {}
                    // // skorArray = result.skor
    
    
    
                    // if(result.length > 0){
                    //     var totalSkor = countScore(result)
                    //     console.log("total skor = " + totalSkor)
                    //     console.log("bobot = " + resInd.bobot)
                    //     // totalSkor = totalSkor * resInd.bobot
                    //     console.log("final skor = " + totalSkor)
                    //     Indikator.findOneAndUpdate({aspek:idAspek, index:idIndikator}, {nilai:totalSkor}, {upsert:true}, (errUpdSub,resUpdSub) =>{
                    //         if(errUpdSub){
                    //             console.log(errUpdSub)
                    //         }
                    //         else{
                    //            console.log(resUpdSub)
                    //         }
                    //     })
                    // }
                    res.render('admin/GCG/tabelParameter', {result: result, idAspek: idAspek, idIndikator: idIndikator, user:req.user, resInd:resInd})
                }
            })
        }
    })
}

function addParameter(req, res) {
    var parameter = new Parameter();
    parameter.pertanyaan = req.body.inputParameter;
    parameter.aspek = req.body.inputAspek;
    parameter.indikator = req.body.inputIndikator;
    parameter.bobot = req.body.inputBobot;
    parameter.jumlahSubParameter = 0;
    parameter.nilai = 0;
    parameter.IDParameter = req.body.inputNoParameter
    
    Parameter.findOne({aspek:req.body.inputAspek, indikator:req.body.inputIndikator, IDParameter:req.body.inputNoParameter}, (errorFind, hasilFind) =>{
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
    Parameter.deleteOne({IDParameter: IDParameter}, (err,res) =>{
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

function updateParameterGet(req,res) {
    IDParameter = req.params.idParameter
    Parameter.findOne({aspek:req.params.idAspek, indikator:req.params.idIndikator, IDParameter}, (err,result) =>{
        if(err) {
            res.send(err)
        }
        else if(!result) {
            req.flash('notFoundMsg', 'Parameter tidak ditemukan');
            res.render('admin/notFound.ejs', {message: req.flash('notFoundMsg')})
        }
        else {
            res.render('admin/GCG/ubah/Parameter', {idAspek:req.params.idAspek, idIndikator:req.params.idIndikator, data:result, user:req.user, errMsg: req.flash('infoFailAddP')})
        }
    })
}


function updateParameter(req,res) {
    prevIndex = req.body.prevIndex
    aspek = req.body.inputAspek
    pertanyaan = req.body.inputParameter
    indikator = req.body.inputIndikator
    bobot = req.body.inputBobot
    index = req.body.inputNoParameter
    IDParameter = index

    Parameter.findOne({aspek,indikator,IDParameter}, (err,result) =>  {
        if(err) {
            res.send(err)
        }
        else if (result && (prevIndex != index)) {
            console.log('Parameter dengan ID yang sama sudah ada')
            req.flash('infoFailAddP', 'Parameter sudah ada');
            res.redirect('back')
        }
        else {
            FaktorSchema.updateMany({aspek,indikator,IDParameter:prevIndex}, {index, IDParameter}, (errIndi,resIndi) => {
                if(errIndi) {
                    res.send(errIndi)
                }
                else {
                    console.log('Updated Faktors')
                }
            })
    
            SubParameter.updateMany({aspek,indikator,IDParameter:prevIndex}, {index, IDParameter}, (errIndi,resIndi) => {
                if(errIndi) {
                    res.send(errIndi)
                }
                else {
                    console.log('Updated SubParameters')
                }
            })
            Parameter.findOneAndUpdate({aspek, indikator, IDParameter:prevIndex}, {index, IDParameter, pertanyaan, bobot}, (errAs,resAs) =>{
                if(errAs){
                    res.send(errAs)
                }
                else{
                    console.log(resAs)
                    res.redirect('/GCGdata/'+aspek+'/'+indikator)
                }
            })
        }
    })
}

function PostParameterExt(req,res) {
    Parameter.findOne({aspek:req.body.inputAspek,indikator:req.body.inputIndikator,IDParameter:req.body.idParameter}, (errFind,resFind) =>{
        if(errFind) {
            res.send('Gagal konek database')
        }
        else if(!resFind) {
            res.send('Parameter tidak ada')
        }
        else {
            Parameter.findOneAndUpdate({aspek:req.body.inputAspek,indikator:req.body.inputIndikator,IDParameter:req.body.idParameter}, 
                {analisis:req.body.analisis,rekomendasi:req.body.rekomendasi,catatan:req.body.catatan},
                (errPost,resPost) => {
                    if(errPost) {
                        res.send('Gagal post')
                    }
                    else {
                        res.redirect('/all/')
                    }
                }) 
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
    Parameter.findOne({aspek:idAspek, indikator: idIndikator, IDParameter}, (errorParameter,resultParameter) =>{
        if(errorParameter){
            res.send(errorParameter)
        }
        else{
            SubParameter.find({ aspek:resultParameter.aspek, indikator:resultParameter.indikator, IDParameter: IDParameter}, (err,result) =>{
                if(err){
                    res.send(err)
                }
                else if(!result){
                    res.send('SubParameter belum ada')
                }
                else{

                    // var totalSkor = []

                    // // skorArray = {}
                    // // skorArray = result.skor
    
    
    
                    // if(result.length > 0){

                    //     //Fungsi untuk menghitung skor
                    //     var totalSkor = countScoreParameter(result)
                    //     totalSkor = totalSkor * resultParameter.bobot

                    //     //Query buat update skor
                    //     Parameter.findOneAndUpdate({IDParameter: IDParameter}, {nilai:totalSkor}, {upsert:true}, (errUpdSub,resUpdSub) =>{
                    //         if(errUpdSub){
                    //             console.log(errUpdSub)
                    //         }
                    //         else{
                    //            console.log(resUpdSub)
                    //         }
                    //     })
                    // }
                    // else{
                    //     var totalSkor = 0
                    // }
                    console.log(result)

                    // var percentData = toPercentageData(result)
                    res.render('admin/GCG/tabelSubParameter', {data:result, dataParameter:resultParameter, idAspek:idAspek, idIndikator:idIndikator, header:result[0], user:req.user})
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
                                                IDParameter:req.body.inputParameter}, 
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

    Parameter.findOneAndUpdate({IDParameter:IDParameter},{$inc:{jumlahSubParameter: -1}}, {upsert: true} , (err,res) =>{
        if(err){
            console.log('Gagal menghapus Entry Entry di Parameter')
        }
        else{
            console.log('Entry di Parameter dihapus')
        }
        
    })
}

function updateSubParameterGet(req,res) {
    IndexSubParameter = req.params.idSubParameter
    SubParameter.findOne({aspek:req.params.idAspek, indikator:req.params.idIndikator, IDParameter: req.params.idParameter, IndexSubParameter}, (err,result) =>{
        if(err) {
            res.send(err)
        }
        else if(!result) {
            req.flash('notFoundMsg', 'Sub-Parameter tidak ditemukan');
            res.render('admin/notFound.ejs', {message: req.flash('notFoundMsg')})
        }
        else {
            res.render('admin/GCG/ubah/SubParameter', {idAspek:req.params.idAspek, idIndikator:req.params.idIndikator, parameterID:req.params.idParameter, data:result, user:req.user, errMsg: req.flash('infoFailAddP')})
        }
    })
}


function updateSubParameter(req,res) {
    prevIndex = req.body.prevIndex
    aspek = req.body.inputAspek
    subParameter = req.body.inputSubParameter
    indikator = req.body.inputIndikator
    IDParameter = req.body.inputParameter
    // bobot = req.body.inputBobot
    IndexSubParameter = req.body.inputIndex
    // IDParameter = createID(req.body.inputAspek, req.body.inputIndikator, req.body.inputNoParameter)

    // subParameter.subParameter = req.body.inputSubParameter
    // subParameter.IDParameter = req.body.inputParameter
    // subParameter.aspek = req.body.inputAspek
    // subParameter.indikator = req.body.inputIndikator
    // subParameter.IndexSubParameter = req.body.inputIndex

    SubParameter.findOne({aspek,indikator,IDParameter,IndexSubParameter}, (err,result) =>  {
        if(err) {
            res.send(err)
        }
        else if (result && (prevIndex != IndexSubParameter)) {
            console.log(IndexSubParameter)
            console.log(prevIndex)
            // console.log(result)
            console.log('Sub-Parameter dengan ID yang sama sudah ada')
            req.flash('infoFailAddP', 'Sub-Parameter sudah ada');
            res.redirect('back')
        }
        else {
            FaktorSchema.updateMany({aspek,indikator,IDParameter,IndexSubParameter:prevIndex}, {IndexSubParameter}, (errIndi,resIndi) => {
                if(errIndi) {
                    res.send(errIndi)
                }
                else {
                    console.log('Updated Faktors')
                }
            })
            SubParameter.findOneAndUpdate({aspek,indikator,IDParameter,IndexSubParameter:prevIndex}, {IndexSubParameter, subParameter}, (errAs,resAs) =>{
                if(errAs){
                    res.send(errAs)
                }
                else{
                    console.log(resAs)
                    res.redirect('/GCGdata/'+aspek+'/'+indikator+'/'+IDParameter)
                }
            })
        }
    })
}

///////////////////
///Sub-Faktor//////
///////////////////


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



                // if(result.length > 0){
                //     var totalSkor = countScoreFaktor(result)
                //     SubParameter.findOneAndUpdate({aspek, indikator, IDParameter, IndexSubParameter}, {nilai:totalSkor}, {upsert:true}, (errUpdSub,resUpdSub) =>{
                //         if(errUpdSub){
                //             console.log(errUpdSub)
                //         }
                //         else{
                //            console.log(resUpdSub)
                //         }
                //     })
                // }
                // else{
                //     var totalSkor = 0
                // }

                res.render('admin/GCG/tabelFaktor', {
                    result:result, 
                    idAspek:aspekT, 
                    idIndikator:indikatorT, 
                    idParameter:IDParameterT, 
                    subParameter: resultSub,
                    totalSkor: totalSkor,
                    user:req.user
                })
                }
            })
        }
    })

}

function addFaktors(req,res, FaktorT, aspekT, indikatorT, IDParameterT, IndexSubParameterT, Index, catatanFaktor){
    
    faktor = FaktorT
    aspek = aspekT
    indikator = indikatorT
    IDParameter = IDParameterT
    IndexSubParameter = IndexSubParameterT
    catatan = catatanFaktor
    skor = 0
    buktiPemenuhan = ''
    catatanBukti = ''
    
    // Index = createFaktorID(IDParameter, IndexSubParameter, IndexFaktor)

    faktorIns = new FaktorSchema();
    faktorIns.faktor = FaktorT
    faktorIns.aspek = aspekT
    faktorIns.indikator = indikatorT
    faktorIns.IDParameter = IDParameterT
    faktorIns.IndexSubParameter = IndexSubParameterT
    faktorIns.skor = 0
    faktorIns.buktiPemenuhan = ''
    faktorIns.Index = Index
    faktorIns.catatan = catatan
    faktorIns.catatanBukti = catatanBukti
    faktorIns.valid = 0

    FaktorSchema.findOne({aspek:aspekT, indikator:indikatorT, IDParameter:IDParameterT, IndexSubParameter:IndexSubParameterT, Index}, (errFind,resFind) =>{
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
function deleteFaktor(aspekT, indikatorT, parameterT, subParameterT, Index){
    aspek = aspekT
    indikator = indikatorT
    IDParameter = parameterT
    IndexSubParameter = subParameterT
    Index = Index

    FaktorSchema.deleteOne({aspek, indikator, IDParameter, IndexSubParameter, Index}, (err,res) =>{
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

//Get fill Form

function getFillForm(req,res) {
    IDParameter = req.params.idParams
    IndexSubParameter = req.params.idSubParams
    aspek = req.params.idAspek
    indikator = req.params.idIndikator
    Index = req.params.Index

    Indikator.findOne({aspek, index:indikator}, (errInd,resInd) =>{
        if(errInd){
            res.send(errInd)
        }
        else if(!resInd){
            res.send('Indikator tdk ada')
        }
        else {
            Parameter.findOne({aspek, indikator, IDParameter}, (errPar,resPar) => {
                if(errPar){
                    res.send(errPar)
                }
                else if(!resPar){
                    res.send('Parameter tdk ada')
                }
                else {
                    SubParameter.findOne({aspek, indikator, IDParameter, IndexSubParameter}, (errSubP,resSubP) => {
                        if(errSubP){
                            res.send(errSubP)
                        }
                        else if(!resSubP){
                            res.send('Sub-Parameter tidak ada')
                        }
                        else {
                            FaktorSchema.findOne({aspek, indikator, IDParameter, IndexSubParameter, Index}, (err,result) =>{
                                if(err)
                                {
                                    res.send(err)
                                }
                                else if(!res){
                                    res.send('Faktor tidak ada')
                                }
                                else{
                                    res.render('admin/GCG/isiFaktor/isi2', {data:result, user:req.user, subparameter:resSubP, parameter:resPar, indikator:resInd})
                                }
                            })
                        }
                    })
                }
            })
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


//Fungsi untuk menghitung skor
function countScoreParameter(data) {
    
    var totalSkor = 0
    for (var i=data.length; i--;) {
      console.log("nilai : " + data[i].nilai)
      totalSkor+=data[i].nilai;
    }

    totalSkor = parseFloat(totalSkor/data.length).toFixed(2)
    
    
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
    // console.log('Loggin in....')
    if (req.isAuthenticated()) {
      return next();
    }
    else {
      res.redirect('/login');
    }
  }

  async function berinilaiFaktor(req,res) {
    Index = req.body.inputID
    aspek = req.body.inputAspek
    indikator = req.body.inputIndikator
    IDParameter = req.body.idParameter
    IndexSubParameter = req.body.idSubParameter
    buktiPemenuhan = req.body.inputPemenuhan
    skor = req.body.inputNilai
    valid = req.body.inputValid
    nilaiPersen = toPercentage(skor)


    const resFaktor = await FaktorSchema.findOneAndUpdate({aspek, indikator, IDParameter, IndexSubParameter, Index} , {buktiPemenuhan, skor, nilaiPersen, valid}, {upsert:true}).exec()
    if(resFaktor) {
        console.log('Faktor sudah diberi nilai')
    }

    return resFaktor
}

async function nilaiSP(req,res) {
    aspek = req.body.inputAspek
    indikator = req.body.inputIndikator
    IDParameter = req.body.idParameter
    IndexSubParameter = req.body.idSubParameter

    const resFaktors = await FaktorSchema.find({aspek, indikator, IDParameter, IndexSubParameter, valid:1}).exec()
    // console.log(resFaktors[0].skor)
    if(resFaktors.length == 0){
        var nilaiSP = 0
        var nilaiPersen = 0
        console.log("NP : " + nilaiPersen)
    }
    else {
        var nilaiSP = await countScoreFaktor(resFaktors)
        var nilaiPersen = await toPercentage(nilaiSP)
        console.log("NP : " + nilaiPersen)
    }
    console.log(nilaiSP)
    const updSP = await SubParameter.findOneAndUpdate({aspek, indikator, IDParameter, IndexSubParameter}, {nilai:nilaiSP, nilaiPersen}).exec()

    return updSP
}


async function nilaiPar(req,res) {
    aspek = req.body.inputAspek
    indikator = req.body.inputIndikator
    IDParameter = req.body.idParameter

    const resSP = await SubParameter.find({aspek, indikator, IDParameter}).exec()
    const parRes = await Parameter.findOne({aspek, indikator, IDParameter}).exec()
    var nilaiParBef = await countScoreParameter(resSP)
    var nilaiPar = parseFloat(nilaiParBef*parRes.bobot).toFixed(3)
    var nilaiPersen = parseFloat(nilaiPar/parRes.bobot).toFixed(3)
    const nilaiIndividu = await toPercentage(nilaiPersen)
    const updP = await Parameter.findOneAndUpdate({aspek, indikator, IDParameter}, {nilai:nilaiPar, nilaiIndividu}).exec()

    return updP
}

async function nilaiIndi(req,res) {
    aspek = req.body.inputAspek
    indikator = req.body.inputIndikator

    const resP = await Parameter.find({aspek, indikator}).exec()
    const IndRes = await Indikator.findOne({aspek, index: indikator}).exec()
    var nilaiIndBef = await parseFloat(countScore(resP)).toFixed(3)
    var nilaiPersen = (parseFloat((nilaiIndBef/IndRes.bobot)*100).toFixed(0))
    const updI = await Indikator.findOneAndUpdate({aspek, index: indikator}, {nilai:nilaiIndBef, nilaiIndividu:nilaiPersen}).exec()

    return updI
}

async function nilaiAspek(req,res) {
    aspek = req.body.inputAspek

    const resI = await Indikator.find({aspek}).exec()
    const AspRes = await Aspek.findOne({index: aspek}).exec()
    var nilaiAspBef = await countScore(resI)
    var nilaiPersen = (parseFloat(nilaiAspBef/AspRes.bobot).toFixed(2))*100
    const updA = await Aspek.findOneAndUpdate({index: aspek}, {nilai:nilaiAspBef, nilaiIndividu:nilaiPersen}).exec()

    return updA
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
        // IDParameter:{
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