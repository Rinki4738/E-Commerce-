 const Product = require('./models/Products');
const {productschema,reviewschema}=require('./schema');
  

 const validateproduct=(req,res,next)=>{
    let{name,image,price,desc}=req.body;

    const {error,value}=productschema.validate({name,image,price,desc});
    if(error){
       return res.render('error');
    }
    next();
 }
 const validatereview=(req,res,next)=>{
    let{rating,comment}=req.body;

    const {error,value}=reviewschema.validate({rating,comment});
    if(error){
       return res.render('error');
    }
    next();
 }
 const isLoggedIn=(req,res,next)=>{
   if(!req.isAuthenticated()){
      req.flash('error','please login first');
       return res.redirect('/login');

   }
   next();
 }
 const isseller=(req,res,next)=>{
   if(!req.user.role){
      req.flash('error','please login first');
      return res.redirect('/products')
   }
   else if(req.user.role!=='Seller'){
      req.flash('error','oyu do not have the access to do that');
       return res.redirect('/products');
   }
   next();
 }
 const isProductAuthor= async(req,res,next)=>{
   let {id}=req.params;
   const foundproduct= await Product.findById(id);
   if(!foundproduct.author.equals(req.user.id)){
      req.flash('error','you are not the authorized user for this product');
       return res.redirect('/products');
   }
   next();

 }
 module.exports={validateproduct,validatereview,isLoggedIn,isseller,isProductAuthor};