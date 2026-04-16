const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Products');
const { isLoggedIn } = require('../middleware');

// Create Stripe Checkout Session for Single Product (Buy Now)
router.post('/buy-now/:productId', isLoggedIn, async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const user = await User.findById(req.user._id);

        // Create Stripe Checkout Session for single product
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: product.name,
                            description: product.desc || 'Product',
                            images: product.image ? [product.image] : []
                        },
                        unit_amount: Math.round(product.price * 100)
                    },
                    quantity: 1
                }
            ],
            mode: 'payment',
            success_url: `${process.env.DOMAIN}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.DOMAIN}/payment/cancel`,
            customer_email: user.email
        });

        // Save order with session ID (status: pending)
        const order = new Order({
            user: req.user._id,
            items: [
                {
                    product: product._id,
                    price: product.price
                }
            ],
            totalAmount: product.price,
            stripeSessionId: session.id,
            paymentStatus: 'pending'
        });

        await order.save();

        res.json({ sessionId: session.id });
    } catch (error) {
        console.error('Error creating buy-now checkout session:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create Stripe Checkout Session for Cart
router.post('/create-checkout-session', isLoggedIn, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('cart');
        
        if (!user.cart || user.cart.length === 0) {
            req.flash('error', 'Your cart is empty');
            return res.redirect('/user/cart');
        }

        // Prepare line items for Stripe
        const lineItems = user.cart.map(product => ({
            price_data: {
                currency: 'inr',
                product_data: {
                    name: product.name,
                    description: product.desc || 'Product',
                    images: product.image ? [product.image] : []
                },
                unit_amount: Math.round(product.price * 100) // Stripe expects amount in paise for INR
            },
            quantity: 1
        }));

        // Calculate total
        const totalAmount = user.cart.reduce((sum, product) => sum + product.price, 0);

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.DOMAIN}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.DOMAIN}/payment/cancel`,
            customer_email: user.email
        });

        // Save order with session ID (status: pending)
        const orderItems = user.cart.map(product => ({
            product: product._id,
            price: product.price
        }));

        const order = new Order({
            user: req.user._id,
            items: orderItems,
            totalAmount: totalAmount,
            stripeSessionId: session.id,
            paymentStatus: 'pending'
        });

        await order.save();

        res.json({ sessionId: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: error.message });
    }
});

// Payment Success Page
router.get('/payment/success', isLoggedIn, async (req, res) => {
    try {
        const sessionId = req.query.session_id;

        // Retrieve session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            // Update order status to completed
            const order = await Order.findOne({ stripeSessionId: sessionId });
            
            if (order) {
                order.paymentStatus = 'completed';
                await order.save();

                // Clear user's cart after successful payment
                const user = await User.findById(req.user._id);
                user.cart = [];
                await user.save();

                req.flash('success', 'Payment successful! Thank you for your purchase.');
            }
        }

        res.render('payment/success', { order });
    } catch (error) {
        console.error('Error in payment success:', error);
        req.flash('error', 'Error processing payment confirmation');
        res.redirect('/user/cart');
    }
});

// Payment Cancel Page
router.get('/payment/cancel', (req, res) => {
    req.flash('error', 'Payment cancelled. Your cart items are still saved.');
    res.render('payment/cancel');
});

// Webhook for payment events (optional but recommended for production)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return res.sendStatus(400);
    }

    // Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        
        try {
            const order = await Order.findOne({ stripeSessionId: session.id });
            if (order && order.paymentStatus === 'pending') {
                order.paymentStatus = 'completed';
                await order.save();

                // Clear user cart
                await User.findByIdAndUpdate(order.user, { cart: [] });
            }
        } catch (error) {
            console.error('Error updating order in webhook:', error);
        }
    }

    res.sendStatus(200);
});

module.exports = router;