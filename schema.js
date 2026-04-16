const Joi = require('joi');

const productschema = Joi.object({
    name:Joi.string().trim().min(3).max(100).required().messages({
        'string.min': 'Product name must be at least 3 characters',
        'string.max': 'Product name cannot exceed 100 characters',
        'any.required': 'Product name is required'
    }),
    image:Joi.string().uri().required().messages({
        'string.uri': 'Please provide a valid image URL',
        'any.required': 'Product image is required'
    }),
    price:Joi.string().pattern(/^\d+(\.\d{1,2})?$/).required().messages({
        'string.pattern.base': 'Price must be a valid number',
        'any.required': 'Price is required'
    }),
    desc:Joi.string().trim().min(10).max(1000).required().messages({
        'string.min': 'Description must be at least 10 characters',
        'string.max': 'Description cannot exceed 1000 characters',
        'any.required': 'Description is required'
    })
})

const reviewschema=Joi.object({
    rating:Joi.number().integer().min(1).max(5).required().messages({
        'number.min': 'Rating must be between 1 and 5 stars',
        'number.max': 'Rating must be between 1 and 5 stars',
        'number.base': 'Rating must be a valid number',
        'any.required': 'Please select a rating'
    }),
    comment:Joi.string().trim().min(5).max(500).required().messages({
        'string.min': 'Comment must be at least 5 characters',
        'string.max': 'Comment must not exceed 500 characters',
        'any.required': 'Comment is required'
    })
})

module.exports={productschema,reviewschema}
    