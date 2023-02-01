require('./config/mongoose').connect()
const cache = require('./middleware/cache')
const express = require("express");
const app =express();
const path = require('path')
const userRoute = require('./routes/userRoute')
const adminRoute = require('./routes/adminRoute')
const errorHandler = require('./middleware/errorHandler')

app.use(errorHandler.errorHandler);

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(__dirname + '/public'));


app.set('views',path.join(__dirname,'views'));
app.set('view engine','hbs')

app.use(cache.cacheClear)
app.use('/admin',adminRoute)  
app.use('/',userRoute);


app.listen(3000,function(){
    console.log("server connected");
})
