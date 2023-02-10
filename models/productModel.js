const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    date:{
        type:Date,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    stock:{
        type:Number,
        required:true
    },
    brand:{
        type:String,
        required:true
    },
    image:{
        type:Array,
        required:true
    },
    thumb_image:{
        type:String,
    },
    is_deleted:{
        type:Boolean,
        default:false
    }
})
module.exports = mongoose.model('product',productSchema)