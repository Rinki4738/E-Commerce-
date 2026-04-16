const express=require('express');
const Review = require('../models/Review');
const Product = require('../models/Products');
const router=express.Router();
const {validatereview, isLoggedIn}=require('../middleware');

  
router.post('/products/:id/review', isLoggedIn, validatereview, async(req,res)=>{
        try{ 
            let {id}=req.params;
            let {rating,comment}=req.body;
            
            // Convert rating to number (comes as string from form)
            const numRating = parseInt(rating, 10);
            
            // Validate rating is between 1-5
            if (!numRating || numRating < 1 || numRating > 5) {
                req.flash('error','Please select a rating between 1 and 5');
                return res.redirect(`/products/${id}`);
            }

            let foundproduct=await Product.findById(id);
            if (!foundproduct) {
                req.flash('error','Product not found');
                return res.redirect('/products');
            }

            const review = await Review.create({
                rating: numRating, 
                comment,
                author: req.user._id
            });

            foundproduct.reviews.push(review._id);
            await foundproduct.save();
            req.flash('success','Review added successfully');
            res.redirect(`/products/${id}`);
        }
        catch(e){
                req.flash('error', e.message || 'Error adding review');
                res.redirect(`/products/${req.params.id}`);
        }
})

// DELETE Review Route
router.delete('/reviews/:reviewId', isLoggedIn, async (req, res) => {
    try {
        let { reviewId } = req.params;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ success: false });
        }

        if (review.author.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
            return res.status(403).json({ success: false });
        }

        // 🔥 FIXED
        await Product.findOneAndUpdate(
            { reviews: reviewId },
            { $pull: { reviews: reviewId } }
        );

        await Review.findByIdAndDelete(reviewId);

        res.json({ success: true });

    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({ success: false });
    }
});

module.exports=router;
