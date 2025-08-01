if(process.env.NODE_ENV!=='production'){
    require('dotenv').config();
}



const express=require('express');
const app=express();
const path=require('path');
const session=require('express-session');
const flash=require('connect-flash');

const seedDB=require('./seed');
const productrouter=require('./routes/product');


const cartrouter=require('./routes/cart');
const paymentrouter = require('./routes/payment');
const ejsMate=require('ejs-mate');
const methodOverride=require('method-override');
const reviewrouter=require('./routes/review');
const authrouter=require('./routes/auth');
const passport=require('passport');
const LocalStrategy=require('passport-local')
const User=require('./models/User')




const mongoose = require('mongoose');
app.use(express.urlencoded({extended:true}));
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.log("DB connection error:", err));
// seedDB();

app.use(methodOverride('_method'));


app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    httpOnly:true,
    expires:Date.now()+7*24*60*60*1000,
    maxAge:7*24*60*60*1000
   }
}))
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use((req,res,next)=>{
    res.locals.currentUser=req.user;
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    next();
})

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new LocalStrategy(User.authenticate()));


app.use(productrouter);
app.use(reviewrouter);
app.use(authrouter);
app.use(cartrouter);
app.use(paymentrouter);



app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.static(path.join(__dirname,'public')));
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
