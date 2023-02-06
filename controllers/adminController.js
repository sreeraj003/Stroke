const Product = require("../models/productModel");
const Admin = require('../models/adminModel')
const bcrypt = require("bcrypt");
const Category = require('../models/categoryModel')
const User = require('../models/userModel');
const Order = require('../models/orderModel')
const ObjectId = require('mongoose').Types.ObjectId
const Coupon = require('../models/couponModel')
const ReturnD = require('../models/returnModel')
const exphbs  = require('express-handlebars');
const hbs = exphbs.create({});
hbs.handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});
hbs.handlebars.registerHelper('num', function(index) {
    return (index+1)})

//login
const loadLogin = async (req, res,next) => {
    try {
      if (req.session.admin) {   
        res.redirect("/admin/dashboard");
      } else {
        res.render("login",{is_admin:1});
      }
    } catch (error) {
        next(error);
    }
  };


//login verify
const verifyLogin = async(req,res,next)=>{
    try {
        const Email = req.body.email
        const Password = req.body.password
        const adminData = await Admin.findOne({email:Email}) 
        if (adminData) {
            const passwordMatch = await bcrypt.compare(Password,adminData.password)
            if (passwordMatch) {
                req.session.admin = adminData
                req.session.admin_id = adminData._id
                res.redirect('/admin/dashboard')
            } else {
                res.render('login',{message:'invalid username or password',is_admin:1});
            }
        } else {
           res.render('login',{message:'invalid username or password',is_admin:1});
        }
    } catch (error) {
        next(error.message);
    }
}

//dashboard
const loadDashboard = async(req,res,next)=>{
    try {
        if(req.session.admin){
        res.render('dashboard')
        }else{
            res.redirect('/admin/login')
        }
    } catch (error) {
        next(error.message);
    }
}

//logout
const logout = async (req,res,next)=>{
    try {
        req.session.destroy();
        res.redirect('/admin/')
    } catch (error) {
        next(error.message);
    }
}

//loadInventory
const loadInventory = async (req,res,next)=>{
    try {
        
        const products = await Product.aggregate([
            {$match:{is_deleted:false}},
            {$lookup:{ from: 'categories', localField:'category', 
              foreignField:'name',as:'category'}}
      ])
        res.render('inventory',{products})
    } catch (error) {
        next(error.message);
    }
}

//loadUsers
const loadUsers = async (req,res,next)=>{
    try {
        const userData = await User.find().lean()
        res.render('users',{userData})
    } catch (error) {
        next(error.message);
    }
}

//load Category
const loadCategory = async (req,res,next)=>{
    try {
        const categoryData = await Category.find({is_deleted:false}).lean()
        res.render('category',{categoryData})
    } catch (error) {
        next(error.message);
    }
}

//load block user
const blockUser = async (req,res,next)=>{
    try {
        const userData = await User.findOneAndUpdate({_id:ObjectId(req.body.id)},{is_blocked:1})
        res.json('done')
    } catch (error) {
        next(error.message);
    }
}

//load unblock user
const unblockUser = async (req,res,next)=>{
    try {
        const userData = await User.findOneAndUpdate({_id:ObjectId(req.body.id)},{is_blocked:0})
        res.json("done")
    } catch (error) {
        next(error.message);
    }
}

//add-product
const addProduct = async (req,res,next)=>{
    try {
        const categories = await Category.find({is_deleted:false}).lean()
        res.render('addProduct',{categories})
    } catch (error) {
        next(error.message);
    }
}

//delete product
const deleteProduct = async (req,res,next)=>{
    try {
        const products = await Product.findOneAndUpdate({_id:req.body.id},{is_deleted:true}).lean()
        res.json('json')
    } catch (error) {
        next(error.message);
    }
}
//edit product page load
const loadEditProduct = async (req,res,next)=>{
    try {
        const ProductData = await Product.find({_id:req.query.id}).lean()
        const categories = await Category.find({is_deleted:false}).lean()
        res.render('editProduct',{categories,ProductData:ProductData[0]})
    } catch (error) {
        next(error.message);
    }
}

//edit product
const editProduct = async (req,res,next)=>{
    try {
        // const proData = await Product.findById({_id:req.query.id}).lean()
        // if (req.files.length<(5-proData.image.length)) {
        //     console.log(req.files.length);
        // }
        // console.log(proData);
        let imagesFilename = req.files.map(function (obj) {
            return obj.filename;
          });  
            const products = await Product.findByIdAndUpdate({_id:req.query.id},{$set:{name:req.body.name,category:req.body.category,description:req.body.description,price:req.body.price,stock:req.body.stock,brand:req.body.brand},$push:{image:{$each:imagesFilename, $position:0}}})
            res.redirect('/admin/inventory')
        
    } catch (error) {
        next(error.message);
    }
}

//insert product
const insertProduct = async (req,res,next)=>{

    try {
        const categories = await Category.find({is_deleted:false}).lean()
        let imagesFilename = req.files.map(function (obj) {
                return obj.filename;
              });  
        const newProduct = new Product({
            name:req.body.name,
            category:req.body.category,
            description:req.body.description,
            price:req.body.price,
            stock:req.body.stock,
            brand:req.body.brand,
            image : imagesFilename,
            thumb_image:imagesFilename[0]

        })
        const productData = await newProduct.save();

        if (productData) {
            res.render('addProduct',{message:'Product added successfully...!',categories})
        } else {
        }
    } catch (error) {
        next(error.message);
    }
}

//load category add page
const addCategory = async(req,res,next)=>{
    try {
        res.render('addCategory')
    } catch (error) {
        next(error.message);
    }
}

//insert category
const insertCategory = async (req,res,next)=>{
    try {
        const existCheck = await Category.findOne({name:req.body.name})
        if(!existCheck){
            const newCategory = new Category({
                name:req.body.name,
                image:req.file.filename
            })
            const categoryData = await newCategory.save()
            if (categoryData) {
                res.render('addCategory',{categoryData:categoryData,message:'Category added successfully...!'})
            } else {
                res.render('addCategory',{message:'Something went wrong...!'})
            }
        }else{
            res.render('addCategory',{message:'Category already exist...!'})
        }
        
        
    } catch (error) {
        next(error.message);
    }
}

//delete category
const deleteCategory = async(req,res,next)=>{
    try {
        const categoryUpdate = await Category.findOneAndUpdate({_id:ObjectId(req.body.id)},{is_deleted:true})
        res.json('done')
    } catch (error) {
        next(error.message);
    }
}

//orders
const loadOrders = async (req,res,next)=>{
    try {
        const orderData = await Order.find().sort({date:1}).lean()
        const orderDate = orderData.map((X) => {
            return moment(X.date).format("Do MMM YYYY");
        })
        res.render('orders',{orderData,orderDate})
    } catch (error) {
        next(error.message);
    }
}

//reject order
const rejectOrder = async(req,res,next)=>{
    try {
        const orderData = await Order.findOne({_id:req.body.id}).lean()
        for (let i = 0; i < orderData.product.length; i++) {
            const element = await Product.findByIdAndUpdate({_id:orderData.product[i]._id},{$inc:{stock:orderData.quantity[i]}})   
        }
        const rejectUpdate= await Order.findOneAndUpdate({_id:req.body.id},{$set:{is_rejected:1}})
        res.json('success')
    } catch (error) {
        next(error.message);
    }
}
//proceeed order
const proceedOrder = async (req,res,next)=>{
    try {
        const orderData = await Order.findOne({_id:req.query.id}).lean()
        for (let i = 0; i < orderData.product.length; i++) {
            const element = await Product.findByIdAndUpdate({_id:orderData.product[i]._id},{$inc:{stock:-orderData.quantity[i]}});      
        }
        const orderUpdate = await Order.findOneAndUpdate({_id:req.query.id},{$set:{is_rejected:0}})
        res.redirect('/admin/order')
    } catch (error) {
        next(error.message);
    }
}

//changeStatus
const changeStatus = async(req,res,next)=>{
    try {

        const{id}=req.body
        const orderStatus=await Order.findById({_id:id})

        if (orderStatus.status=='ordered') {
            const update = await Order.findByIdAndUpdate({_id:id},{$set:{status:'packed'}})
        }else if(orderStatus.status=='packed'){
            const update = await Order.findByIdAndUpdate({_id:id},{$set:{status:'shipped'}})
        }else if(orderStatus.status=='shipped'){
            const update = await Order.findByIdAndUpdate({_id:id},{$set:{status:'delivered'}})
        }else{}
        res.json('done')
    } catch (error) {
        next(error)
    }
}

//view order
const viewOrder = async(req,res,next)=>{
    try {
       
        const orderData = await Order.findById({_id:req.query.id}).lean()
        res.render('viewOrder',{orderData})
    } catch (error) {
        next(error)
    }
}

//load coupon
const loadCoupon = async(req,res,next)=>{
    try {
        const couponData = await Coupon.find({}).lean()
        const expire = moment(couponData.expire).format('Do MMMM YYYY')
         
        
        res.render('coupon',{couponData,expire})
    } catch (error) {
        next(error)
    }
}



// add coupon
const loadAddCoupon = async(req,res,next)=>{
    try {
        
        res.render('addCoupon')
    } catch (error) {
        next(error)
    }
}
//insertCoupon
const insertCoupon = async(req,res,next)=>{
    try {
        const {code,discount,expire} = req.body
        const couponexist = await Coupon.find({code:code}).lean()
        if (couponexist!='') {
            res.render('addCoupon',{message:'Coupon already exists...!',exist:1})
        }else{
        const coupon =await new Coupon({
            code:code,
            discount:discount,
            expire:expire
        })
        const saveData = coupon.save()
        res.render('addCoupon',{message:'Coupon added successfully...!'})
    }
    } catch (error) {
        next(error)
    }
}

//blockCoupon
const blockCoupon = async (req,res,next)=>{
    try {
        const id = ObjectId(req.body.id)
        const couponData = await Coupon.findByIdAndUpdate({_id:id},{$set:{is_valid:false}})
        res.json('done')
    } catch (error) {
        next(error)
    }
}
//productReturn
const productReturn = async (req,res,next)=>{
    try {
        const requestData = await ReturnD.aggregate([{
            $lookup:{
                from:"products",
                localField:"item",
                foreignField:"_id",
                as:"item"
            }
        }, {
            $lookup:{
                from:"users",
                localField:"user",
                foreignField:"_id",
                as:"user"
            }
        },
        {
            $lookup:{
                from:"orders",
                localField:"order",
                foreignField:"_id",
                as:'order'
            }
        }
    ])
        res.render('returnedProd',{requestData})
    } catch (error) {
        next(error)
    }
}

//acceptReturn
const acceptReturn = async (req,res,next)=>{
    try {
        const orderUp = await ReturnD.findByIdAndUpdate({_id:ObjectId(req.body.id)},{$set:{returnStatus:'confirmed'}})
        const item = orderUp.item
        const prod = await Order.find({_id:orderUp.order}).lean()
        const pp =  prod[0].product.map((x)=>{
            return  x._id.toString()  
        })
        const pc = pp.indexOf(item.toString())
        const refund = (prod[0].price[pc])
        // const amount = (orderUp[0].quantity)*(prod[0].)
        const walletUpdate = await User.findByIdAndUpdate({_id:orderUp.user},{$inc:{wallet:refund}})
        console.log(walletUpdate);
        res.json('done')
    } catch (error) {
        next(error)
    }
}


const rejectReturn = async (req,res,next)=>{
    try {
        const orderUp = await ReturnD.findByIdAndUpdate({_id:ObjectId(req.body.id)},{$set:{returnStatus:'rejected'}})
        res.json('done')
    } catch (error) {
        next(error)
    }
}

//removeProductImage
const removeProductImage = async (req,res,next)=>{
    try {
        const {imageName,productId} = req.body
        const productUpdate = await Product.findByIdAndUpdate({_id:productId},{$pull:{image:imageName}})
        res.json('done')
    } catch (error) {
        next(error)
    }
}

module.exports = {
    loadLogin,
    verifyLogin,
    loadDashboard,
    logout,
    loadInventory,
    loadUsers,
    loadCategory,
    blockUser,
    unblockUser,
    addProduct,
    insertProduct,
    addCategory,
    insertCategory,
    deleteCategory,
    deleteProduct,
    loadEditProduct,
    editProduct,
    loadOrders,
    rejectOrder,
    proceedOrder,
    viewOrder,
    changeStatus,
    loadCoupon,
    loadAddCoupon,
    insertCoupon,
    blockCoupon,
    productReturn,
    acceptReturn,
    rejectReturn,
    removeProductImage
}