const express = require('express');
const router = express.Router();
const stripe = require('stripe'); // ✅ IMPORTANT: init later
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Products');
const { isLoggedIn } = require('../middleware');


// helper: safe stripe init
function getStripeClient() {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("STRIPE_SECRET_KEY is missing in environment variables");
    }
    return stripe(process.env.STRIPE_SECRET_KEY);
}


// BUY NOW (Single Product)
router.post('/buy-now/:productId', isLoggedIn, async (req, res) => {
    try {
        const stripeClient = getStripeClient();

        const { productId } = req.params;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const user = await User.findById(req.user._id);

        const session = await stripeClient.checkout.sessions.create({
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

        const order = await Order.create({
            user: req.user._id,
            items: [{ product: product._id, price: product.price }],
            totalAmount: product.price,
            stripeSessionId: session.id,
            paymentStatus: 'pending'
        });

        res.json({ sessionId: session.id });

    } catch (error) {
        console.error("Buy Now Error:", error);
        res.status(500).json({ error: error.message });
    }
});


// CART CHECKOUT
router.post('/create-checkout-session', isLoggedIn, async (req, res) => {
    try {
        const stripeClient = getStripeClient();

        const user = await User.findById(req.user._id).populate('cart');

        if (!user.cart || user.cart.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        const lineItems = user.cart.map(product => ({
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
        }));

        const totalAmount = user.cart.reduce((sum, p) => sum + p.price, 0);

        const session = await stripeClient.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.DOMAIN}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.DOMAIN}/payment/cancel`,
            customer_email: user.email
        });

        const order = await Order.create({
            user: req.user._id,
            items: user.cart.map(p => ({ product: p._id, price: p.price })),
            totalAmount,
            stripeSessionId: session.id,
            paymentStatus: 'pending'
        });

        res.json({ sessionId: session.id });

    } catch (error) {
        console.error("Cart Checkout Error:", error);
        res.status(500).json({ error: error.message });
    }
});


// SUCCESS PAGE
router.get('/payment/success', isLoggedIn, async (req, res) => {
    try {
        const stripeClient = getStripeClient();

        const session = await stripeClient.checkout.sessions.retrieve(req.query.session_id);

        let order;

        if (session.payment_status === 'paid') {
            order = await Order.findOne({ stripeSessionId: session.id });

            if (order) {
                order.paymentStatus = 'completed';
                await order.save();

                await User.findByIdAndUpdate(order.user, { cart: [] });
            }
        }

        res.render('payment/success', { order });

    } catch (error) {
        console.error(error);
        res.redirect('/user/cart');
    }
});


// CANCEL PAGE
router.get('/payment/cancel', (req, res) => {
    res.render('payment/cancel');
});


// WEBHOOK (optional but correct)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];

    try {
        const event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;

            const order = await Order.findOne({ stripeSessionId: session.id });

            if (order) {
                order.paymentStatus = 'completed';
                await order.save();

                await User.findByIdAndUpdate(order.user, { cart: [] });
            }
        }

        res.sendStatus(200);

    } catch (err) {
        console.error("Webhook Error:", err.message);
        res.sendStatus(400);
    }
});

module.exports = router;