const express=require('express');
const router=express.Router();
const User = require('../models/User');
const Product = require('../models/Products');

const {isLoggedIn}=require('../middleware');

router.get('/user/cart', isLoggedIn,async(req,res)=>{
    let userid=req.user._id;
    let user=await User.findById(userid).populate('cart');
    res.render('cart/cart.ejs',{user});
})





router.post('/user/:productId/add',isLoggedIn, async(req,res)=>{

    let { productId }=req.params;
    let userid=req.user._id;
    const user=await User.findById(userid);
    const product=await Product.findById(productId);
    user.cart.push(product);
    await user.save();
    res.redirect('/user/cart');

})
router.delete('/user/cart/:productId/remove',async(req,res)=>{
   
   const userId = req.user._id;
const productIdToRemove = req.params.productId;

await User.findByIdAndUpdate(userId, {
  $pull: { cart: productIdToRemove }
});
res.redirect('/user/cart')

})
module.exports=router;
