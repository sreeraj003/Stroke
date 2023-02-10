const mongoose = require ('mongoose')

const returnSchema = mongoose.Schema({
    date:{
        type:Date,
        required:true
    },
    order:{
        type:mongoose.Types.ObjectId,
        required:true
    },
    user:{
        type:mongoose.Types.ObjectId,
        required:true
    },
    item:{
        type:mongoose.Types.ObjectId,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    reason:{
        type:String,
        required:true
    },
    returnStatus:{
        type:String,
        default:''
    }
})

module.exports = mongoose.model('return', returnSchema)