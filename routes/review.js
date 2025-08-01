const express=require('express');
const Review = require('../models/Review');
const Product = require('../models/Products');
const router=express.Router();
const {validatereview}=require('../middleware');

  
router.post('/products/:id/review',validatereview,async(req,res)=>{
        try{ let {id}=req.params;
        let {rating,comment}=req.body;
        let foundproduct=await Product.findById(id);
        const review=await Review.create({rating,comment});
        foundproduct.reviews.push(review._id);
        await foundproduct.save();
        req.flash('success','review added successfully');
        res.redirect(`/products/${id}`);}

        catch(e){
                res.status(500).render('error',{err:e.message}) ;
        }
       

})








module.exports=router;