require('dotenv').config()
const mongoose = require('mongoose')

const connect = ()=>{const mongoose = require('mongoose')
mongoose.set('strictQuery', false);
mongoose.connect("mongodb://127.0.0.1:27017/user_management",{useNewUrlParser: true})}

module.exports ={ connect}