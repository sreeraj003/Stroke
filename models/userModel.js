const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    mobile:{
        type:Number,
        required:true
    },
    age:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    wishlist:{
        type:Array
    },
    cart:{
        type:Array
    },
    is_verified:{
        type:Number,
        default:0    
    },
    token:{
        type:String,
        default:''
    },
    is_blocked:{
        type:Number,
        default:0
    },
    wallet:{
        type:Number,
        default:0
    }
})
module.exports = mongoose.model('user',userSchema);