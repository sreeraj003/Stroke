const mongoose = require('mongoose')
const bannerModel = mongoose.Schema({
    image:{
    type:String,
    required:true
    }
})
module.exports = mongoose.model('banner',bannerModel)