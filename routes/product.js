const express=require('express');
const Product = require('../models/Products');
const router=express.Router();
const {validateproduct,isLoggedIn,isseller,isProductAuthor}=require('../middleware');

router.get('/', (req, res) => {
    res.render('home');  // views/home.ejs
});


router.get('/products',isLoggedIn, async(req,res)=>{
    try{ let product=  await Product.find({});
    res.render('product/index',{product});}
    catch(e){
        res.status(500).render('error',{err:e.message})
    }

    
})
router.get('/product/new',isLoggedIn,(req,res)=>{
    try{res.render('product/new');}
    catch(e){
        res.status(500).render('error',{err:e.message}) 
    }
    
})
router.post('/products',isLoggedIn, isseller,validateproduct,async(req,res)=>{
    // console.log(req.body);
    try{ let {name,image,price,desc}=req.body;
   await  Product.create({name,image,price,desc,author:req.user._id});
    req.flash('success' ,'product added successfully');
    res.redirect('/products');}
    catch(e){
        res.status(500).render('error',{err:e.message}) 
    }
   

})
router.get('/products/:id',isLoggedIn,async(req,res)=>{
    try{ let {id}=req.params;
   let foundproduct=await Product.findById(id).populate('reviews');
   res.render('product/show',{foundproduct,msg:req.flash('msg')});}
   catch(e){
     res.status(500).render('error',{err:e.message}) 
   }
   
})
router.get('/products/:id/edit',isLoggedIn,async(req,res)=>{
    try{let {id}=req.params;
    let foundproduct=await Product.findById(id);
    res.render('product/edit',{foundproduct});}
    catch(e){
         res.status(500).render('error',{err:e.message}) 
    }
    
})
router.patch('/products/:id',isLoggedIn,validateproduct,isProductAuthor,async(req,res)=>{
    try{ 
    let {id}=req.params;
    let {name,image,price,desc}=req.body;
   await Product.findByIdAndUpdate(id,{name,image,price,desc});
   req.flash('success' ,'product edited successfully');
    res.redirect(`/products/${id}`);}
    catch(e){
         res.status(500).render('error',{err:e.message}) 
    }
})
router.delete('/products/:id',isLoggedIn,isProductAuthor,async(req,res)=>{
    try{ let {id}=req.params;
   const product= await Product.findById(id);
   await Product.findByIdAndDelete(id);
 req.flash('success' ,'product deleted successfully');
    res.redirect('/products');
}

catch(e){
    res.status(500).render('error',{err:e.message}) 
}
   

})

module.exports=router;