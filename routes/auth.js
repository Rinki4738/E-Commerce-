const express=require('express');
const router=express.Router();
const User = require('../models/User');
const passport=require('passport');

// Helper function to validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Helper function to validate password strength
function isValidPassword(password) {
    return password && password.length >= 6;
}

router.get('/register',(req,res)=>{
    res.render('auth/signup');
})

router.post('/register',async(req,res)=>{
    try{
        let {username,password,email,role}=req.body;
        
        // Backend validation
        if (!username || username.trim().length < 3 || username.trim().length > 20) {
            req.flash('error','Username must be 3-20 characters');
            return res.redirect('/register');
        }
        
        if (!isValidEmail(email)) {
            req.flash('error','Please provide a valid email address');
            return res.redirect('/register');
        }
        
        if (!isValidPassword(password)) {
            req.flash('error','Password must be at least 6 characters');
            return res.redirect('/register');
        }
        
        if (!role || (role !== 'Buyer' && role !== 'Seller')) {
            req.flash('error','Please select a valid role');
            return res.redirect('/register');
        }

        // Check if user already exists
        const existingUser = await User.findOne({username});
        if (existingUser) {
            req.flash('error','Username already exists');
            return res.redirect('/register');
        }

        const user=new User({username,email,role})
        const newUser=await User.register(user,password);
       
        req.login(newUser,function(err){
            if(err){
                return next(err);
            }
            req.flash('success','Welcome! Account created successfully');
            res.redirect('/products');
        })
    }
    catch(e){
        req.flash('error',e.message || 'Registration failed');
        return res.redirect('/register')
    }
})

router.get('/login',(req,res)=>{
    res.render('auth/login');
})

router.post('/login', 
  passport.authenticate('local', { 
    failureRedirect: '/login', 
    failureMessage: true,
    failureFlash: 'Invalid username or password'
  }),
  (req, res)=>{
    req.flash('success','Welcome back!');
    res.redirect('/products');
  });

router.get('/logout',(req,res)=>{
    req.logout(function(err) {
        if(err) {
            return next(err);
        }
        req.flash('success','Logged out successfully');
        res.redirect('/login');
    });
})

module.exports=router;