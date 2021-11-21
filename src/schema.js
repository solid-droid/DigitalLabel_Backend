const mongoose = require('mongoose')

const product = new mongoose.Schema({
    code: {
        type: String,
        required: true
    },
    geoLoc: {
        lat: {
            type: String,
            default:'N/A'
        },
        long: {
            type: String,
            default:'N/A'
        },
    },
    timeStamp:{
        type: Date,
        default: Date.now
    },
    scannedBy: {
        type: String,
        default: 'N/A'
    },
    scannedAt: {
        type: String,
        default: 'N/A'
    },
    bayerScan: {
        type: Boolean,
        default: true
    },
    customerScan: {
        type: Boolean,
        default: false
    },
    supplierScan: {
        type: Boolean,
        default: false
    },
    customer: {
        type: String,
        default: 'N/A'
    },
    customerScanTimeStamp: {
        type: Date,
        default: Date.now
    },
    customerGeoLoc: {
        lat: {
            type: String,
            default:'N/A'
        },
        long: {
            type: String,
            default:'N/A'
        },
    },
    supplierScans: [{
        type: Object,
    }],
    invalidSuplierScan: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Product', product);