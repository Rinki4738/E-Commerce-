const mongoose=require('mongoose');
let reviewschmena=mongoose.Schema({
    rating:{
        type:Number,
        min:0,
        max:5
    },
    comment:{
        type:String,
        trim:true
    }
   
    },{timestamps:true});
    let Review=mongoose.model('Review',reviewschmena);
    module.exports=Review;
    

