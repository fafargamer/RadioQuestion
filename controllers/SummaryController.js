const express = require('express');
const CryptoJS = require('crypto-js')
var app = express.Router();
const mongoose = require('mongoose')

const Parameter = mongoose.model('Parameter');
const SubParameter = mongoose.model('SubParameter')
const FaktorSchema = mongoose.model('FaktorSchema')
const Indikator = mongoose.model('Indikator')
const Aspek = mongoose.model('Aspek')
const toPercent = require('decimal-to-percent');
const e = require('express');
const { reset } = require('nodemon');
const xlsx = require('excel4node');
const { Workbook } = require('excel4node');

mongoose.set('useFindAndModify', false);

app.get('/crypto', (req,res) => {
    console.log(CryptoJS.HmacSHA1("Message", "Key"));
})

app.get('/', isLoggedIn, async function(req, res, next) {
        try {    
            const resAsp = await Aspek.find({}).sort({index: 'ascending'}).exec()
            const resInd = await getAllIndikators(resAsp)
            const resPars = await getAllParameters(resInd)
            const resSubPars = await getAllSubParameters(resPars)
            const resSubFak = await getAllSubFaktors(resSubPars)
            // console.log(resInd)
            // res.send(resInd[0].indikators)
            res.render('admin/FillGCG/tabelCombined3', {result:resSubFak, user:req.user})
            next();
        } catch (err) { 
            next(err)
        }
})

async function getAllIndikators(resAsp) {
    testAsp = {}
    testAsp = resAsp
        for(i=0;i<resAsp.length;i++) {
            var resInd = await Indikator.find({aspek: resAsp[i].index}).sort({index: 'ascending'}).exec()
            if(resInd) {
                // var sortable = [];
                // for (var i in resInd) {
                //     sortable.push(i);
                // }
                // const sortedArr = await sort(resInd)
                console.log(resInd)
                testAsp[i].indikators = resInd
            }
            // const resIndP = await getAllParameters(resInd)
            // console.log(typeof resAsp)
            // console.log(typeof resInd)
            // console.log(resIndP)
            // testAsp[i].indikators = resInd
            // console.log(resAsp[i].indikators[0].indikator)
            // resAsp[i].indikators = resInd
            // global.TTTTTT = resAsp
            // console.log(resAsp[i].indikators)
        }
        return testAsp

} 

async function getAllParameters(resInd) {
    testInd = {}
    testInd = resInd
    for(i=0;i<resInd.length;i++) {
        for(j=0;j<resInd[i].indikators.length;j++){
            var resPars = await Parameter.find({aspek: resInd[i].indikators[j].aspek, indikator:resInd[i].indikators[j].index}).sort({IDParameter: 'ascending'}).exec()
            if(resPars){
                testInd[i].indikators[j].parameters = resPars
            }
        }

    }
    return testInd
}

async function getAllSubParameters(resPars) {
    testPars = {}
    testPars = resPars
    for(i=0;i<resPars.length;i++) {
        for(j=0;j<resPars[i].indikators.length;j++){
            for(k=0;k<resPars[i].indikators[j].parameters.length;k++){
                var resSubPars = await SubParameter.find({aspek: resPars[i].indikators[j].parameters[k].aspek, 
                    indikator:resPars[i].indikators[j].parameters[k].indikator, 
                    IDParameter: resPars[i].indikators[j].parameters[k].IDParameter}).sort({IndexSubParameter: 'ascending'}).exec()
                if(resSubPars){
                    testPars[i].indikators[j].parameters[k].subparameters = resSubPars
                }
            }
        }

    }
    return testPars
}

async function getAllSubFaktors(resSubPars) {
    testSubPars = {}
    testSubPars = resSubPars

    for(i=0;i<resSubPars.length;i++) {

        for(j=0;j<resSubPars[i].indikators.length;j++){

            for(k=0;k<resSubPars[i].indikators[j].parameters.length;k++){

                for(l=0;l<resSubPars[i].indikators[j].parameters[k].subparameters.length;l++){

                    var resSubFaktor = await FaktorSchema.find({aspek: resSubPars[i].indikators[j].parameters[k].subparameters[l].aspek, 
                        indikator:resSubPars[i].indikators[j].parameters[k].subparameters[l].indikator, 
                        IDParameter: resSubPars[i].indikators[j].parameters[k].subparameters[l].IDParameter,
                        IndexSubParameter: resSubPars[i].indikators[j].parameters[k].subparameters[l].IndexSubParameter,
                    }).sort({Index: 'ascending'}).exec()
    
                    if(resSubPars){
                        // console.log(resSubFaktor)
                        testSubPars[i].indikators[j].parameters[k].subparameters[l].faktors = resSubFaktor
                    }


                }



            }

        }

    }
    return testSubPars
}

async function twoTest(resInd) {
    var test = 2+2
    return test
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

// async function sort(data) {
//     for(i=0;i<2;i++) {
//         console.log(i)
//     }
//     return data
// }

module.exports = app;