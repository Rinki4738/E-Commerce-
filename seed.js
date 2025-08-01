const mongoose=require('mongoose');
const Product=require('./models/Products');
 

const products=[
    {
        name:'Iphone 14 pro max',
        image:'https://images.unsplash.com/photo-1656392851225-ec9a304ef9d0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8aSUyMHBob25lJTIwMTRwJTIwcHJvJTIwbWF4fGVufDB8fDB8fHww',
        price:130000,
        desc:'aukaat k bahar'
    },
    {
         name:'MacBook 13 pro max',
        image:'https://images.unsplash.com/photo-1625242504068-6bcff3a603da?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fG1hY2Jvb2slMjAxMyUyMHBybyUyMG1heHxlbnwwfHwwfHx8MA%3D%3D',
        price:250000,
        desc:' BAHUT aukaat k bahar'

    },
    { 
        name:'Iphone 12',
        image:'https://plus.unsplash.com/premium_photo-1681336999500-e4f96fe367f8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aSUyMHBob25lJTIwMTJ8ZW58MHx8MHx8fDA%3D',
        price:110000,
        desc:' aukat mai hai'
    },
    {
         name:'Iwatch',
        image:'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8YXBwbGUlMjB3YXRjaHxlbnwwfHwwfHx8MA%3D%3D',
        price:50000,
        desc:'badhiya hai aukat mai'
    },
  

    {
         name:'Ipad',
        image:'https://images.unsplash.com/photo-1612367990403-73ef3e67bc4f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8aXBhZHxlbnwwfHwwfHx8MA%3D%3D',
        price:100000,
        desc:' mast hai re'
    }];


    async function seedDB(){
        await Product.insertMany(products);
        console.log("seeded successfully");

    }
    module.exports=seedDB;
