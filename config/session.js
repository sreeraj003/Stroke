const session = require('express-session')
require('dotenv').config()

const checkSession = session({
    secret:"mysessionsecret",
    saveUninitialized:false,
    resave:false,
    cookie:{
        maxAge:1000*60*60*60
    }
})

module.exports = {
    checkSession
}