const mongoose=require('mongoose');
let reviewschmena=mongoose.Schema({
    rating:{
        type:Number,
        min:1,
        max:5,
        required:true
    },
    comment:{
        type:String,
        trim:true,
        required:true
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    }
   
    },{timestamps:true});
    let Review=mongoose.model('Review',reviewschmena);
    module.exports=Review;
    

