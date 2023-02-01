const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const randomstring = require('randomstring')
const config = require('../config/cofig')
const Product = require('../models/productModel')
const Category = require('../models/categoryModel');
const Order = require('../models/orderModel');
require('dotenv').config()
const ObjectId = require('mongoose').Types.ObjectId
const Address = require('../models/addressModel')
global.moment=require('moment')
const Coupon = require('../models/couponModel');
const ReturnD = require('../models/returnModel')
const exphbs  = require('express-handlebars');
const hbs = exphbs.create({});

hbs.handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});
hbs.handlebars.registerHelper('num', function(index){
    return (index+1)
})
//password Hashing
const securePassword = async (password,next) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    next(error);
  }
};

//mobile verify
function phonenumber(inputtxt)
{
  var phoneno = /^\d{10}$/;
  if(inputtxt.match(phoneno))
  {
      return true;
  }
  else
  {
     return false;
  }
}

//mail verify
function ValidateEmail(mail) 
{
  var mailidform = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
 if (mail.match(mailidform))
  {
    return (true)
  }
    return (false)
}
//send mail
const sendVerifyMail = async (name, email, token,next) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user:process.env.MAIL ,
        pass:process.env.PASS ,
      },
    });
    const mailOptions = {
      from: process.env.MAIL,
      to: email,
      subject: "For Verification mail",
      html:
        "<p>hii " +
        name +
        ',Please click here to <a href="http://localhost:3000/verify?token=' +
        token +
        '">verify</a> your mail.</p> ',
    };
    
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email has been sent", info.response);
      }
    });
  } catch (error) {
    next(error);
  }
};

//verify mail
const verifyMail = async (req, res,next) => {
  try {
    const updateInfo = await User.updateOne(
      { token: req.query.token },
      { $set: { is_verified: 1,token:'' } }
    );
    res.render("email_verified");
  } catch (error) {
    next(error);
  }
};

//verify login
const verifyLogin = async (req, res,next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await User.findOne({ email: email });
    if (req.body.email!='') {
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        if (userData.is_verified === 0) {
          res.render("login", { message: "Please verify your mail" });
        } else {
          if (userData.is_blocked === 0) {
            req.session.user_id = userData._id;
            res.redirect("/home");
          } else {
            res.render("login", { message: "Your account has been blocked by admin.Please contact admin" });
          }
        }
      } else {
        res.render("login", { message: "Email or password is incorrect" });
      }
    } else {
      res.render("login", { message: "Email or password is incorrect" });
    }
  }else{
    res.render('login',{message:'invalid mail'})
  }
  } catch (error) {
    next(error);
  }
};

//Register loading
const loadRegister = async (req, res,next) => {
  try {
    res.render("register");
  } catch (error) {
    next(error);
  }
};

//user insertion (post register)
const insertUser = async (req, res,next) => {
  try {
    if (req.body.password === req.body.cPassword) {
      const email = req.body.email;
      const mobileno = req.body.mobile;
      const phoneCheck = await phonenumber(mobileno)
        if(phoneCheck){
          const emailCheck = await ValidateEmail(email)
          if(emailCheck){
        const existCheck = await User.findOne({ email: email });
        if (!existCheck) {
        const secPass = await securePassword(req.body.password);
        const randomString = randomstring.generate()
        const user = new User({
          name: req.body.name,
          email: req.body.email,
          mobile: req.body.mobile,
          age: req.body.age,
          password: secPass,
          token:randomString
          
        });

        const userData = await user.save();

        if (userData) {
          sendVerifyMail(req.body.name, req.body.email, userData.token);
          res.render("register", { message: "Registeration successfull.Please verify your mail...!",
          });
        } else {
          res.render("register", { check: 1,message: "something went wrong" });
        }
      } else {
        res.render("register", { check: 1, message: "Email already exists." });
      }
    }else{
      res.render("register", { check: 1, message: "Invalid email address." });
    }
  }else{
    res.render("register", { check: 1, message: "invalid mobile number." });
  }
  }else{
    res.render('register',{check: 1,message:"Password doesn't match,please try again"})
  }
  } catch (error) {
    next(error.message);
  }
};

//login page loading
const loadLogin = async (req, res,next) => {
  try {
    if (req.session.user_id) {
      res.redirect("/");
    } else {
      res.render("login");
    }
  } catch (error) {
    next(error);
  }
};

//Home page loading
const loadHome = async (req, res,next) => {
  try {
    if(req.session.user_id){
      const userData  = await User.findById({_id:req.session.user_id}).lean()
      res.render("home",{userData});
    }else{
      res.render("home");
    }
    
  } catch (error) {
    next(error);
  }
};

//logout
const userLogout = async (req, res,next) => {
  try {
    req.session.destroy();
    res.redirect("/home");
  } catch (error) {
    next(error);
  }
};

//shop load
const loadShop = async (req,res,next)=>{
    try {
      const productsData = await Product.find({is_deleted:false}).lean()
        const categoryData = await Category.find({is_deleted:false}).lean()
      if (req.session.user_id) {
        const userData = await User.findById({_id:req.session.user_id}).lean()
        res.render('shop',{userData,productsData,categoryData})
      }else{
        res.render('shop',{productsData,categoryData})
      }
    } catch (error) {
        next(error);
    }
}

//forgot password page
const loadForget = async(req,res,next)=>{
    try {
        res.render('forgotPassword')
    } catch (error) {
        next(error);
    }
}

//forget verification
const forgetVerify = async(req,res,next)=>{
    try {
        const email = req.body.email
       const userData = await User.findOne({email:email})

       if (userData) {
        if (userData.is_verified === 0) {
            res.render('forgotPassword',{message:'please verify your mail...!'})
        }else{
            const randomString = randomstring.generate();
            const updatedData = await User.updateOne({email:email},{ $set: { token:randomString }})
            sendRestpasswordMail(userData.name,userData.email,randomString)
            res.render('forgotPassword',{message:'Please check your mail to reset your password'})
        }
       } else {
        res.render('forgotPassword',{message:'No mail id found'})
       }
    } catch (error) {
        next(error);
    }
}


//for reset password  mail send
const sendRestpasswordMail = async (name, email, token,next) => {
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user:config.emailUser ,
          pass:config.emailPassword ,
        },
      });
      const mailOptions = {
        from: config.emailUser,
        to: email,
        subject: "For reset password",
        html:
          "<p>hii " +
          name +
          ',Please click here to <a href="http://localhost:3000/forgetPassword?token=' +
          token +
          '">reset</a> your password.</p> ',
      };
      transporter.sendMail(mailOptions, (error, info,next) => {
        if (error) {
          next(error);
        } else {
          console.log("Email has been sent", info.response);
        }
      });
    } catch (error) {
      next(error);
    }
};

  //forget password load
const forgetPasswordLoad = async(req,res,next)=>{
    try {
      const token = req.query.token
      const tokenData = await User.findOne({token:token})
      if (tokenData) {
        res.render('newPassword',{user_id:tokenData._id})
      } else {
        res.render('404',{message:'Invalid token.'}) 
      }
    } catch (error) {
      next(error);
    }
}

  //reset password
const resetPassword = async(req,res,next)=>{
    try {
      const password = req.body.password
      const User_id = req.body.user_id
      const sec_Pass = await securePassword(password) 
      const userUpadate = await User.findByIdAndUpdate({_id:User_id},{$set:{password:sec_Pass,token:''}})
      res.redirect('/login')
    } catch (error) {
      next(error);
    }
} 

  //single product view
const singleProduct = async(req,res,next)=>{
    try {
      const singleItem = await Product.findOne({_id:req.query.id}).lean()
      if(req.session.user_id){
        const userData = await User.findById({_id:req.session.user_id}).lean()
        res.render('shop-single',{Item:singleItem,userData:userData})
      }else{
        res.render('shop-single',{Item:singleItem})
      }
    } catch (error) {
      next(error);
    }
}

const loadProfile= async(req,res,next)=>{
  try {
    const userData = await User.findById({_id:req.session.user_id}).lean()
    res.render('profile',{userData})
  } catch (error) {
    next(error);
  }
}


//adress page load
const loadAddress = async(req,res,next)=>{
  try {
    const userData = await User.findById({_id:req.session.user_id}).lean()
    const addressData = await Address.find({user:req.session.user_id}).lean()
    res.render('address',{userData,addressData})
  } catch (error) {
    next(error);
  }
}

//upload address
const uploadAddress = async (req,res,next)=>{
  try {

    const {house_no,place,town,city,dist,state,country,zip} = req.body

    const address = new Address({
      user:req.session.user_id,
      house_no:house_no,
      place:place,
      town:town,
      city:city,
      dist:dist,
      state:state,
      country:country,
      zip:zip
    }) 
    const saveAddress = await address.save()
    res.redirect('/address')
  } catch (error) {
    next(error);
  }
}

//deleteAddress
const deleteAddress = async (req,res,next)=>{
  try {
    const deleteAddres = await Address.findOneAndDelete({_id:req.body.id})
    res.json('done')
  } catch (error) {
    next(error);
  }
}


//wishlist load
const loadWishList = async(req,res,next)=>{
  try {
    const userData = await User.aggregate([{
      $match:{_id:ObjectId(req.session.user_id)}
    },{
      $unwind:"$wishlist"
    },
    {
      $lookup:{
        from:'products',
        localField:'wishlist',
        foreignField:'_id',
        as:'proData'
      }
    }])
    console.log(userData[1].proData);
     res.render('wishlist',{userDatas:userData,userData:userData[0]})
  } catch (error) {
    next(error.messge);
  }
}

//add wishlist item
const addWishlistItem = async(req,res,next)=>{
  try {
    // const itemData = await Product.findById({_id:req.body.item_id})
    const updatewishlist = await User.findByIdAndUpdate({_id:req.session.user_id},{$addToSet:{wishlist:ObjectId(req.body.id)}})
    const Item = await Product.findById({_id:req.query.id}).lean()
    res.render('shop-single',{Item})
  } catch (error) {
    next(error);
  }
}

// /removeWishlist
const removeWishlist = async (req,res,next)=>{
  try {
    const userUp = await User.findByIdAndUpdate({_id:req.session.user_id},{$pull:{wishlist:ObjectId(req.body.id)}})
    res.json('done')
  } catch (error) {
    next(error)
  }
}

//edit profile load
const updateProfileLoad = async(req,res,next)=>{
  try {
    const userData = await User.findById({_id:req.session.user_id}).lean()
    res.render('editProfile',{userData})
  } catch (error) {
    next(error);
  }
}

// profile Update
const profileUpdate = async(req,res,next)=>{
  try {
    const updatedData = await User.findByIdAndUpdate({_id:req.body.user_id},{$set:{name:req.body.name,age:req.body.age,email:req.body.email,mobile:req.body.mobile}})
    res.redirect('/profile')
  } catch (error) {
    next(error);
  }
}

//loadCart
const loadCart = async (req,res,next)=>{
  try {
    const userData = await User.findById({_id:req.session.user_id}).lean()
    const productData = await User.aggregate([
      {$match:{_id:ObjectId(req.session.user_id)}},
      {$unwind:'$cart'},
      {$project:{
        item:'$cart.item_id',
        quantity:'$cart.count'
      }},
      {
        $lookup:{
          from:'products',
          localField:'item',
          foreignField:'_id',
          as:'products'
        }
      },
      {
        $project:{
         item:1,quantity:1,product:{$arrayElemAt:['$products',0]}
        }
      }
    ])
    const total = await User.aggregate([
      {$match:{_id:ObjectId(req.session.user_id)}},
      {$unwind:'$cart'},
      {$project:{
        item:'$cart.item_id',
        quantity:'$cart.count'
      }},
      {
        $lookup:{
          from:'products',
          localField:'item',
          foreignField:'_id',
          as:'products'
        }
      },
      {
        $project:{
         item:1,quantity:1,product:{$arrayElemAt:['$products',0]}
        }
      },{
        $group:{
          _id:null,
          total:{$sum:{$multiply:['$quantity','$product.price']}}
        }
      }
    ])
    console.log( total)
    const addressData = await Address.findOne({user:req.session.user_id}).lean()
    res.render('cart',{userData:userData,productData,total,addressData})
  } catch (error) {
    next(error);
  }
}

//addCartItem
const addCartItem = async (req,res,next)=>{
  const itemId = ObjectId(req.body.item_id)
  const number = parseInt(req.body.count)
  try {
      const Item = await Product.findById({_id:req.body.item_id}).lean()
      const userData = await User.findById({_id:req.session.user_id}).lean()
      const cart = await userData.cart.findIndex((el,index) => {
        return el.item_id == req.body.item_id
      })
      if (cart==-1) {
        const cartItem = await User.findByIdAndUpdate({_id:req.session.user_id},{$addToSet:{cart:{item_id:itemId,count:number,}}})
      }else{
        const cartItem = await User.updateOne({_id:req.session.user_id,'cart.item_id':ObjectId(req.body.item_id)},{$inc:{'cart.$.count':parseInt(req.body.count)}})
      }
      res.render('shop-single',{Item,userData})
  } catch (error) {
    next(error);
  }
}
//Remove from cart
const removeCartItem = async (req,res,next)=>{
  try {
    const removeItem = await User.updateOne({ _id: req.session.user_id }, { "$pull": { "cart": { "item_id": ObjectId(req.body.id)} }}, { safe: true, multi:true });
    res.json("done")
  } catch (error) {
    next(error);
  }
}

//place order
const placeOrder = async(req,res,next)=>{
  try {

    const userData = await User.findById({_id:req.session.user_id}).lean() 
      const cartItem = await User.updateOne({_id:req.session.user_id,'cart.item_id':ObjectId(req.body.item)},{$set:{'cart.$.count':parseInt(req.body.qty)}})
       
    const total = await User.aggregate([
      {$match:{_id:ObjectId(req.session.user_id)}},
      {$unwind:'$cart'},
      {$project:{
        item:'$cart.item_id',
        quantity:'$cart.count'
      }},
      {
        $lookup:{
          from:'products',
          localField:'item',
          foreignField:'_id',
          as:'products'
        }
      },
      {
        $project:{
         item:1,quantity:1,product:{$arrayElemAt:['$products',0]}
        }
      },{
        $group:{
          _id:null,
          total:{$sum:{$multiply:['$quantity','$product.price']}}
        }
      }
    ])
    const productData = await User.aggregate([
      {$match:{_id:ObjectId(req.session.user_id)}},
      {$unwind:'$cart'},
      {$project:{
        item:'$cart.item_id',
        quantity:'$cart.count'
      }},
      {
        $lookup:{
          from:'products',
          localField:'item',
          foreignField:'_id',
          as:'products'
        }
      },
      {
        $project:{
         item:1,quantity:1,product:{$arrayElemAt:['$products',0]}
        }
      }
    ])

    const addressData = await Address.find({user:req.session.user_id}).lean()
    
      res.render('placeOrder',{productData,userData,total,addressData})
    
  } catch (error) {
    next(error);
  }
}

//category search
const searchCategory = async(req,res,next)=>{
  try {
    const category =await Category.aggregate([
      {$match:{name:req.query.category}},
      {$lookup:{from:'products',
      localField:'name',
      foreignField:'category',
      as:'Products'
  }},
])
const categoryData = await Category.find({is_deleted:false}).lean()

const lookupoutData = category.map((x)=>{
  return x})
  const products = lookupoutData[0]
  const productsData = products.Products
    res.render('shop',{productsData,categoryData})
  } catch (error) {
    next(error)
  }
}

//proceed To pay
const proceedToPay = async(req,res,next)=>{
  try {
    const userData = await User.findById({_id:req.session.user_id}).lean()    
      if(req.body.coupon){
        const code = req.body.coupon
        const couponData = await Coupon.find({code:code}).lean()
        if(couponData!=''){
          if (couponData[0].is_valid==true) {
            const addressData=req.body.address
            const totalamount = parseInt(req.body.total)
            const discount = (totalamount*couponData[0].discount/100)
            const total = totalamount-discount
            res.render('payment',{addressData,userData,total,totalamount,discount,code})
          }else{
            const addressData=req.body.address
            const totalamount = parseInt(req.body.total)
            const total = totalamount
            res.render('payment',{addressData,userData,total,totalamount,discount:0})
          }
         
        }else{
          const addressData = req.body.address
          const total = req.body.total
          res.render('payment',{addressData,userData,total,discount:0}) 
        }
        }else{
          const addressData = req.body.address
          const total = req.body.total
          res.render('payment',{addressData,userData,total,discount:0})
        }
  
    
  } catch (error) {
    next(error);
  }
}

//success
const success = async (req,res,next)=>{
  try {

    const userData = await User.findById({_id:req.session.user_id}).lean()
    const productData = await User.aggregate([
      {$match:{_id:ObjectId(req.session.user_id)}},
      {$unwind:'$cart'},
      {$project:{
        item:'$cart.item_id',
        quantity:'$cart.count',
      }},
      {
        $lookup:{
          from:'products',
          localField:'item',
          foreignField:'_id',
          as:'products'
        }
      },
      {
        $project:{
         item:1,quantity:1,product:{$arrayElemAt:['$products',0]}
        }
      }
    ])

     
    const product = productData.map((x)=>{
      return x.product;})

    const productName = product.map((x)=>{
      return x
    })
    const priceData = product.map((y)=>{
        return y.price;})
      
    const purchaseQuantity = userData.cart.map((x)=>{
      return x.count})

      const  totalcost = purchaseQuantity.map(function(element, index) {
        return element * priceData[index];
      });

      for (let i = 0; i < priceData.length; i++) {
        const element = await Product.findByIdAndUpdate({_id:product[i]._id},{$inc:{stock:-purchaseQuantity[i]}});
        const removeItem = await User.updateOne({_id:req.session.user_id},{"$pull": { "cart": { "item_id": productName[i]._id} }}, { safe: true, multi:true });

      }
      if (req.body.coupon) {
          const order = new Order({
          id:req.session.user_id,
          date:moment(Date.now()).format('Do MMM YYYY'),
          user:userData.name,
          address:req.body.address,
          product:productName,
          quantity:purchaseQuantity,
          price:priceData,
          status:'ordered',
          amount:totalcost,
          payment:req.body.payment,
          total:req.body.total,
          coupon:req.body.coupon,
          discount:req.body.discount
        })
        const orderData = await order.save()
        const couponUpdate = await Coupon.findOneAndUpdate({code:req.body.coupon},{$set:{is_valid:false}})
      }else{
        const order = new Order({
          id:req.session.user_id,
          date:moment(Date.now()).format('Do MMM YYYY'),
          user:userData.name,
          address:req.body.address,
          product:productName,
          quantity:purchaseQuantity,
          price:priceData,
          status:'ordered',
          amount:totalcost,
          payment:req.body.payment,
          total:req.body.total

        })
        const orderData = await order.save()
      }
      if (req.body.payment == 'online') {
        res.json('ok')
      }else{
        const userData = await User.findById({_id:req.session.user_id}).lean()
          res.render('success',userData)
      }
  } catch (error) {
    next(error);
  }
}

//successLoad
const successLoad = async(req,res,next)=>{
  try {
    const userData = await User.findById({_id:req.session.user_id}).lean()
    res.render('success',{userData})
  } catch (error) {
    next(error)
  }
}


//orders
const orders = async(req,res,next)=>{
  try {
    const userData = await User.findById({_id:req.session.user_id}).lean()
    const orderData = await Order.find({id:req.session.user_id}).sort({date:-1}).lean()
   
    res.render('orders',{userData,orderData})
  } catch (error) {
    next(error);
  }
}
//cancelOrder
const cancelOrder = async (req,res,next)=>{
  try {

    const orderData = await Order.findOne({_id:req.body.id}).lean()
    const orderUpdate = await Order.findOneAndUpdate({_id:req.body.id},{$set:{is_rejected:1}})
    for (let i = 0; i < orderData.product.length; i++) {
      const element = await Product.findByIdAndUpdate({_id:orderData.product[i]._id},{$inc:{stock:orderData.quantity[i]}})   
    }
    const walletUpdate = await User.findByIdAndUpdate({_id:req.session.user_id},{$inc:{wallet:orderData.total}})
    res.json('success')
  } catch (error) {
    next(error);
  }
}

//viewOrder
const viewOrder = async (req,res,next)=>{
  try {
    // console.log(req.query.id);

    // console.log(returnData);
    const userData = await User.findById({_id:req.session.user_id}).lean()
    const orderData =await Order.findOne({_id:req.query.id}).lean()
    const returnData = await ReturnD.aggregate([{
      $match:{
      order:ObjectId(req.query.id),
      user:ObjectId(req.session.user_id)}
    },
      {
      $lookup:{
          from:"products",
          localField:"item",
          foreignField:"_id",
          as:"item"
      }
    }
    ])
    // console.log(returnData);
    res.render('viewOrder',{orderData,userData,returnData})
  } catch (error) {
    next(error)
  }

}

//increaseCartCount
const increaseCartCount = async (req,res,next)=>{
  try {
    const cartItem = await User.updateOne({_id:req.session.user_id,'cart.item_id':ObjectId(req.body.id)},{$inc:{'cart.$.count':1}})
    res.json('done')
  } catch (error) {
    next(error)
  }
}

//decreaseCartCount
const decreaseCartCount = async(req,res,next)=>{
  try {
    const cartItem = await User.updateOne({_id:req.session.user_id,'cart.item_id':ObjectId(req.body.id)},{$inc:{'cart.$.count':-1}})
    res.json('done')
  } catch (error) {
    next(error)
  }
}

//searchProduct
const searchProduct = async (req,res,next)=>{
  try {
    const search = req.body.search
    const productsData = await Product.find({
      $and:[
        {$or:[
          {name:{$regex:search,$options:'i'}},
          {price:{$regex:parseInt(search),$options:'i'}},
          {category:{$regex:search,$options:'i'}}
        ]},
        {is_deleted:false}]
    }).lean()
    const categoryData = await Category.find({is_deleted:false}).lean()
    res.render('shop',{productsData,categoryData})
  } catch (error) {
    next(error)
  }
}

//check Coupon
const checkCoupon = async(req,res,next)=>{
  try {
    const code= req.body.code
    const total = req.body.total
    const couponData = await Coupon.find({code:code})
    if (couponData!='') {
      if (couponData[0].is_valid==true) {
        const CouponDiscount = await Coupon.findOne({code:code}).lean()
        const discounted = total-(total*CouponDiscount.discount/100)
        res.json(discounted)
      }else{
        res.json('invalid')
      }
      }else{
      res.json('invalid')
    }
  } catch (error) {
    next(error)
  }
}

//returnOrder
const returnOrder = async (req,res,next)=>{
  try {
    const {id,reason,order_id} = req.body
    // console.log(req.body);
    const dr = await ReturnD.find().lean()
    const orderQuantity = await Order.findById({_id:ObjectId(order_id)})
    const ind = orderQuantity.product.findIndex((x,el)=>{
      return x._id == id
    })
    const quantity = orderQuantity.quantity[ind]
    if (dr!='') {
      const ret = await ReturnD.find({order:ObjectId(order_id)}).lean()
      // console.log(ret);
      const check = ret.map((x)=>{
        return x.item == id
      })
      if (ret == '' || (ret!='' && check[0] == false) ) {
        const returnData = new ReturnD({
          user:ObjectId(req.session.user_id),
          order:ObjectId(order_id),
          item:ObjectId(id),
          quantity:quantity,
          reason:reason,
          returnStatus:'requested'
          })
        const saveReturn = returnData.save()
        res.json('requested')
      }else{
      res.json('Exist')
      }
    }else{
      const returnData = new ReturnD({
        user:ObjectId(req.session.user_id),
        order:ObjectId(order_id),
        item:ObjectId(id),
        quantity:quantity,
        reason:reason,
        returnStatus:'requested'
        })
      const saveReturn = returnData.save()
      res.json('requested')
      }
      
  } catch (error) {
    next(error)
  }
}


module.exports = {
  loadRegister,
  insertUser,
  verifyMail,
  verifyLogin,
  loadLogin,
  loadHome,
  userLogout,
  loadShop,
  searchCategory,
  loadForget,
  forgetVerify,
  sendRestpasswordMail,
  forgetPasswordLoad,
  resetPassword,
  singleProduct,
  loadProfile,
  loadAddress,
  uploadAddress,
  deleteAddress,
  loadWishList,
  updateProfileLoad,
  profileUpdate,
  addWishlistItem,
  removeWishlist,
  loadCart,
  addCartItem,
  removeCartItem,
  placeOrder,
  proceedToPay,
  successLoad,
  success,
  orders,
  cancelOrder,
  viewOrder,
  increaseCartCount,
  decreaseCartCount,
  searchProduct,
  checkCoupon,
  returnOrder

};
