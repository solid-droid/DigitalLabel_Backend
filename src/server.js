const express = require('express')
const serverless = require('serverless-http')
require('dotenv/config')


const app = express()
const router = express.Router();
const cors = require('cors')

const mongoose = require('mongoose')
const schema = require('./schema')

//add product to DB

const bayerScanProduct = async (req, res) => {
   try{
       const {scannedBy,scannedAt, geoLoc, code} = req.body
       const products = await schema.find();
    if(!products.find(product => product.code === code)){
       const product = new schema({ scannedBy , scannedAt, code, geoLoc });
       const saveProduct = await product.save();
       res.status(200).json({success: true, exists: false, data: saveProduct})
    }else{
        res.status(200).json({success: true, exists : true})
    }
   } catch(err)
   {
       res.status(409).json({success: false, data: [], error: err})
       console.log(err)
   }
}

const supplierScanProduct = async (req, res) => {
    try{
        const {scannedBy,scannedAt, geoLoc, code} = req.body
        const products = await schema.find();
        let product = products.find(product => product.code === code);
        if(  product && 
            !product.customerScan && 
            !product.invalidSuplierScan && 
            (product.bayerScan || product.supplierScan)
        ){
            product.supplierScan = true;
            product.bayerScan = false;
            product.supplierScans.push({scannedBy,scannedAt, timeStamp: new Date(), geoLoc, invalid: false});
            //update product
            const updateProduct = await product.save();
            res.status(200).json({success: true, invalid:false, data: updateProduct})
        }else{
            if(!product){
                product = new schema({code});
            }
            product.invalidSuplierScan = true;
            product.supplierScan = true;
            product.bayerScan = false;
            product.supplierScans.push({scannedBy,scannedAt, timeStamp: new Date(), geoLoc, invalid: true});
            //update product
            const updateProduct = await product.save();
            res.status(200).json({success: true, invalid: true, data:updateProduct})
        }

    } catch(err)
    {
        res.status(409).json({success: false, data: [], error: err})
        console.log(err)
    }
}

const customerScanProduct = async (req, res) => {
    try{
        const {scannedBy, geoLoc, code} = req.body
        const products = await schema.find();
        let product = products.find(product => product.code === code);
        if(  product && !product.invalidSuplierScan){
            if(!product.customerScan){
                product.customerScan = true;
                product.bayerScan = false;
                product.supplierScan = false;
                product.customer = scannedBy;
                product.customerGeoLoc = geoLoc;
                const saveProduct = await product.save();
                res.status(200).json({success: true, invalid: false,complete:false, data: saveProduct})
            } 
            else{
                res.status(200).json({success: true, invalid: false, complete:true, data:product})
            }
        }else{
              res.status(200).json({success: true, invalid: true, data:product})
        }
    } catch(err) {
        res.status(409).json({success: false, data: [], error: err})
        console.log(err)
    }
}

const getAllProduct = async (req, res) => {
    try{
        const products = await schema.find();
        res.status(200).json({success: true, data: products})
    } catch(err)
    {
        res.status(409).json({success: false, data: [], error: err})
        console.log(err)
    }
};

const getProductByCode = async (req, res) => {
    try{
        const {code} = req.params
        const product = await schema.find({code});
        res.status(200).json({success: true, data: product})
    } catch(err)
    {
        res.status(409).json({success: false, data: [], error: err})
        console.log(err)
    }
}

// middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

//routes

router.get('/', (req, res) => {
    res.json({success:true, data: ["hello"]})
  })

router.get('/getAllProduct', getAllProduct)

router.get('/getProductByCode/:code', getProductByCode)
  
router.post('/add', bayerScanProduct)

router.post('/update', supplierScanProduct)

router.post('/customer', customerScanProduct)
//mongoDB
mongoose.connect('mongodb+srv://nikhil:qwerty1234@cluster0.87dy8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', () => console.log('DB connected'))

//DB Schema

app.use('/.netlify/functions/server',router);

module.exports.handler = serverless(app)