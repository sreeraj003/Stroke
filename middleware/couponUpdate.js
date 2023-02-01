const Coupon = require('../models/couponModel')
const cron = require('node-cron');
const { nextTick } = require('process');

    const Update = function(req,res,next){cron.schedule("*/5 * * * * *", async () => {
    const expiredCoupons = await Coupon.find({ expire: { $lt: new Date() } });
        console.log('haaai');
    await Coupon.updateMany({ _id: { $in: expiredCoupons.map((c) => c._id) } }, { $set: { is_valid: false } });
});
next()
    }
    
module.exports = {
    Update
}