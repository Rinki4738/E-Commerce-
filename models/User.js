const mongoose=require('mongoose');
const passportLocalMongoose=require('passport-local-mongoose');
let userschmena=mongoose.Schema({
    email:{
        required:true,
        type:String,
        trim:true
    },
    role:{
        type:String,
        required:true

    },
    cart:[
        { type:mongoose.Schema.Types.ObjectId,
        ref:'Product'}
       

    ]
    
   
  
    });
userschmena.plugin(passportLocalMongoose);

let User=mongoose.model('User',userschmena);
module.exports=User;
    

