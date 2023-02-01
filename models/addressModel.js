const mongoose = require("mongoose")

const addressSchema = mongoose.Schema({
    user:{
        type:String,
        required:true
    },
    house_no:{
        type:String,
        required:true
    },
    place:{
        type:String,
        required:true
    },
    town:{
        type:String,
        requiresd:true
    },
    city:{
        type:String,
        required:true
    },
    dist:{
        type:String,
        required:true
    },
    state:{
        type:String,
        required:true
    },
    country:{
        type:String,
        required:true
    },
    zip:{
        type:Number,
        required:true
    }
})

module.exports = mongoose.model('address',addressSchema)