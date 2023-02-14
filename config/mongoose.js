require('dotenv').config()
const mongoose = require('mongoose')

const connect = ()=>{const mongoose = require('mongoose')
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGOOSE_URL+process.env.MONGOOSE_COLLECTION,{useNewUrlParser: true})}

module.exports ={ connect}