const express=require('express');
const app=express();
const session=require('express-session');

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
//   cookie: { secure: true }
}))


app.listen('8080',()=>{
    console.log('connected');
})

app.get('/',(req,res)=>{
    res.send('welcome to the session');
})
app.get('/viewcount',(req,res)=>{
    if(req.session.count){
       req.session.count+=1;
    }
    else{
        req.session.count=1;
    }
    res.send(req.session.count);
})
app.get('/setname',(req,res)=>{
    req.session.username="rinkijha";
    res.redirect('/greet');
})
app.get('/greet',(req,res)=>{
    let{username="anonymous"}=req.session;
    res.send(`hi i am ${username}`);
})
