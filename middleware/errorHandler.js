const errorHandler = (err,re,res,next)=>{
    res.status(500)
    res.send('error', { error: err })
    next(err)
}

module.exports= {
    errorHandler
}