const mongoose = require('mongoose')

const couponSchema= mongoose.Schema({
    code:{
        type:String,
        required:true
    },
    discount:{
        type:Number,
        required:true
    },
    expire:{
        type:Date,
        required:true
    },
    is_valid:{
        type:Boolean,
        default:true
    }
})
module.exports = mongoose.model('coupon',couponSchema)