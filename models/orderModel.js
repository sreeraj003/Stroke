const mongoose = require('mongoose')

const orderSchema = mongoose.Schema({
    id:{
        type:String,
        required:true
    },
    date:{
        type:String,
        required:true
    },
    user:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    product:{
        type:Array,
        required:true
    },
    quantity:{
        type:Array,
        required:true
    },
    price:{
        type:Array,
        required:true
    },
    amount:{
        type:Array,
        required:true
    },
    coupon:{
        type:String,
        default:''
    },
    discount:{
        type:String,
        default:''
    },
    total:{
        type:Number,
        required:true
    },
    payment:{
        type:String
    },
    status:{
        type:String
    },
    is_rejected:{
        type:Number,
        default:0
    },
    // returnStatus:{
    //     type:String,
    //     default:''
    // },
    // returnReason:{
    //     type:String,
    //     default:''
    // }
})
module.exports = mongoose.model('order',orderSchema)