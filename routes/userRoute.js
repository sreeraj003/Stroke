const express = require('express');
const user_route = express();
const session = require('../config/session')
const userController = require('../controllers/userController');
const hbs = require('express-handlebars')
require('dotenv').config()
const auth = require('../middleware/auth')
const Coupon = require('../models/couponModel')
const cron = require('node-cron');
const { use } = require('./adminRoute');

user_route.set('views','./views/user');

user_route.engine('hbs', hbs.engine({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutsDir: __dirname + '../../views/layouts/',
    partialsDir: __dirname + '../../views/partials'
  }))

user_route.use(session.checkSession)

cron.schedule("* * * * *", async () => {
  const expiredCoupons = await Coupon.find({ expire: { $lt: new Date() } });
  await Coupon.updateMany({ _id: { $in: expiredCoupons.map((c) => c._id) } }, { $set: { is_valid: false } });
});

user_route.get('/register',userController.loadRegister)
user_route.post('/register',userController.insertUser)
user_route.get('/login',userController.loadLogin)
user_route.post('/login',userController.verifyLogin)
user_route.get('/',userController.loadHome)
user_route.get('/verify',userController.verifyMail)
user_route.get('/forgotPassword',userController.loadForget)
user_route.post('/forgotPassword',userController.forgetVerify)
user_route.get('/forgetPassword',userController.forgetPasswordLoad)
user_route.post('/forgetPassword',userController.resetPassword)
user_route.get('/home',userController.loadHome)
user_route.get('/logout',userController.userLogout)
user_route.get('/shop',userController.loadShop)
user_route.get('/singleProduct',userController.singleProduct)
user_route.get('/profile',auth.isUserLogin,userController.loadProfile)
user_route.get('/address',auth.isUserLogin,userController.loadAddress)
user_route.post('/address',auth.isUserLogin,userController.uploadAddress)
user_route.get('/orders',auth.isUserLogin,userController.orders)
user_route.delete('/deleteAddress',auth.isUserLogin,userController.deleteAddress)
user_route.get('/wishListPage',auth.isUserLogin,userController.loadWishList)
user_route.get('/editProfile',auth.isUserLogin,userController.updateProfileLoad)
user_route.post('/editProfile',auth.isUserLogin,userController.profileUpdate)
user_route.post('/addwishlistitem',auth.isUserLogin,userController.addWishlistItem)
user_route.delete('/removeWishlist',auth.isUserLogin,userController.removeWishlist)
user_route.get('/cart',auth.isUserLogin,userController.loadCart)
user_route.post('/addcartitem',auth.isUserLogin,userController.addCartItem)
user_route.get('/logForgetPassword',auth.isUserLogin,userController.loadForget)
user_route.post('/logForgetPassword',auth.isUserLogin,userController.forgetVerify)
user_route.delete('/removeCartItem',auth.isUserLogin,userController.removeCartItem)
user_route.get('/proceedCheckout',auth.isUserLogin,userController.placeOrder)
user_route.post('/placeorders',auth.isUserLogin,userController.proceedToPay)
user_route.get('/success',auth.isUserLogin,userController.successLoad)
user_route.post('/success',auth.isUserLogin,userController.success)
user_route.put('/cancelOrder',auth.isUserLogin,userController.cancelOrder)
user_route.get('/viewOrder',auth.isUserLogin,userController.viewOrder)
user_route.put('/increaseCartCount',auth.isUserLogin,userController.increaseCartCount)
user_route.put('/decreaseCartCount',auth.isUserLogin,userController.decreaseCartCount)
user_route.get('/categorySearch',auth.isUserLogin,userController.searchCategory)
user_route.post('/searchProduct',auth.isUserLogin,userController.searchProduct)
user_route.post('/checkCoupon',auth.isUserLogin,userController.checkCoupon)


module.exports = user_route










// user_route.post('/returnOrder',auth.isUserLogin,userController.returnOrder)
// user_route.get('/returnOrder',auth.isUserLogin,userController.loadreturnOrder)