const Product = require('./models/Products');
const { productschema, reviewschema } = require('./schema');

const validateproduct = (req, res, next) => {
    let { name, image, price, desc } = req.body;

    const { error } = productschema.validate({ name, image, price, desc });
    if (error) {
        req.flash('error', error.details[0].message || 'Invalid product data');
        return res.redirect('back');
    }
    next();
};

const validatereview = (req, res, next) => {
    let { rating, comment } = req.body;

    // Convert rating to number if it's a string (from form)
    if (typeof rating === 'string') {
        rating = parseInt(rating, 10);
    }

    const { error } = reviewschema.validate({ rating, comment });
    if (error) {
        console.error('Review validation error:', error.details[0]);
        req.flash('error', error.details[0].message || 'Invalid review data');
        return res.redirect('back');
    }
    next();
};

const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'Please login first');
        return res.redirect('/login');
    }
    next();
};

const isseller = (req, res, next) => {
    if (!req.user || !req.user.role) {
        req.flash('error', 'please login first');
        return res.redirect('/products');
    }

    if (req.user.role !== 'Seller') {
        req.flash('error', 'you do not have access to do that');
        return res.redirect('/products');
    }

    next();
};

const isProductAuthor = async (req, res, next) => {
    let { id } = req.params;
    const foundproduct = await Product.findById(id);

    if (!foundproduct.author.equals(req.user._id)) {
        req.flash('error', 'you are not the authorized user for this product');
        return res.redirect('/products');
    }

    next();
};

module.exports = {
    validateproduct,
    validatereview,
    isLoggedIn,
    isseller,
    isProductAuthor
};