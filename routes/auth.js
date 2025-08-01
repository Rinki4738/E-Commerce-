const express=require('express');
const router=express.Router();
const User = require('../models/User');
const passport=require('passport');


router.get('/register',(req,res)=>{
    res.render('auth/signup');
})

router.post('/register',async(req,res)=>{
    try{
        let {username,password,email,role}=req.body;
   const user=new User({username,email,role})
     const newUser=await User.register(user,password);
    
     req.login(newUser,function(err){
        if(err){
            return next(err);
        }
        req.flash('success','welcome');
        res.redirect('/products');
     })}
     catch(e){
        req.flash('error',e.message);
        return res.redirect('/signup')
     }
    

})
router.get('/login',(req,res)=>{
    res.render('auth/login');
})
router.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login' }),
  (req, res)=>{
    req.flash('success','welcome back');
    res.redirect('/products');
    
  });

router.get('/logout',(req,res)=>{
    ()=>{
        req.logout();
    }
    req.flash('success','good bye friends');
    res.redirect('/login');
})
module.exports=router;