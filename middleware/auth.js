

const isAdminLogin = async(req,res,next)=>{
    
    try {
        
        if(req.session.admin){
            
        }else{
            res.redirect('/admin/login')
        }
        next()
    } catch (error) {
        console.log(error.message);
    }
}

const isUserLogin = async(req,res,next)=>{
    try {
        if(req.session.user_id){

        }else{
            res.redirect('/login')
        }
        next()
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    isUserLogin,
    isAdminLogin
}