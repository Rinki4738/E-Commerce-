const Joi = require('joi');

const productschema = Joi.object({
    name:Joi.string().required(),
    image:Joi.string().required(),
    price:Joi.string().min(0).required(),
    desc:Joi.string().required()
})
const reviewschema=Joi.object({
    rating:Joi.string().min(0).max(5).required(),
    comment:Joi.string().required()
})
module.exports={productschema,reviewschema}
    