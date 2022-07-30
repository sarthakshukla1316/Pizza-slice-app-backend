const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class OrderController {
    async makeOrder(req, res) {
        const { card } = req.body;

        console.log('orfer');
        const token = await stripe.tokens.create({
            card: {
              number: '4242424242424242',
              exp_month: 7,
              exp_year: 2023,
              cvc: '314',
            },
        });

        stripe.charges.create({
            amount: 2 * 100,
            source: token.id,
            currency: 'inr',
        }).then(() => {
            return res.json({ message: 'Payment Successful, Order placed successfully' });
        }).catch(err => {
            return res.json({ message: err })
        })
    }
}



module.exports = new OrderController();