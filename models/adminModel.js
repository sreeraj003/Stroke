const mongoose = require('mongoose')

const adminSchema = mongoose.Schema({
    email :{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    is_admin:{
        type:Number,
        required:true
    }
})

module.exports = mongoose.model('admin',adminSchema)