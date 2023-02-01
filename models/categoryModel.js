const mongoose = require('mongoose')

const categorySchema = mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    is_deleted:{
        type:Boolean,
        default:false
    }
})

module.exports = mongoose.model('category',categorySchema)