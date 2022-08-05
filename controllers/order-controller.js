const springedge = require('springedge');
const orderModel = require('../models/order-model');
const mailSender = require('../services/mailSender');
const otpService = require('../services/otp-service');
const userService = require('../services/user-service');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class OrderController {

    async sendOrderOtp(req, res) {
        try {
            const { phone } = req.body;
            console.log(phone);
            if(!phone) {
                return res.status(400).json({ message: 'Phone number is required !' });
            }

            const otp = await otpService.generateOtp();

            let order = new orderModel({
                customerId: req.user._id,
                phone: phone,
                otp: otp
            })

            await order.save();
    
            let params = {
                'sender': process.env.SPRINGEDGE_SENDER,
                'apikey': process.env.SPRINGEDGE_SECRET_KEY,
                'to': [
                    `91${phone}`  //Mobile Numbers 
                ],
                'message': `Hello ${otp} , This is a test message from spring edge`,
                'format': 'json'
            };
                
            // springedge.messages.send(params, 5000, function (err, response) {
            //     if (err) {
            //         return console.log(err);
            //     }
            //     console.log(response);
            // });

            return res.status(200).json({ order_id: order._id, otp: otp });

        } catch(err) {
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    async checkout(req, res) {

        const { order_id, address, otp, price, sendEmail, items, paymentType, card, cvc, expiry_month, expiry_year } = req.body;            //  Validating request
            if(!order_id  || !address || !otp || !price || !paymentType || !items) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            if(paymentType === 'card') {
                if(!card || !cvc || !expiry_month || !expiry_year) {
                    return res.status(400).json({ message: 'All fields are required' });
                }
            }
            console.log('checkout visited');
            let order = await orderModel.findById(order_id);

            if(!order) {
                return res.status(500).json({ message: 'Invalid Order' });
            }
            
            if(order.otp !== otp) {
                return res.status(500).json({ message: 'Invalid otp' });
            }

            let user = await userService.findUser({ _id: req.user._id });
            if(!user) {
                return res.status(500).json({ message: 'Invalid User' });
            }
            console.log(user, 'user');
            
            await orderModel.findByIdAndUpdate(order_id, {items: items, address: address, price: price, isVerified: true}).then(result => {

                if(sendEmail === true) {
                    let markupCustomer = `
                    <div style="height: 50px; width: 100%; background: #59b256">
                        <h1 style="color: #fff; text-align: center; padding-top: 15px;">Order Summary</h1>
                    </div>
                    <img src="https://thumbs.dreamstime.com/b/mobile-shopping-app-modern-online-technology-internet-customer-service-icon-order-placed-processing-processed-metaphors-vector-184200609.jpg" alt="">
                    <h1>Thank you !! <br /> Order placed successfully</h1>
                    <p>Expected Delivery Time within 40 minutes</p>
                    <p>Payment method : ${paymentType === 'cod' ? 'Cash on Delivery' : 'Card'}</p>
                    <p>Price : Rs ${price}</p>
                    `;
                    const subjectCustomer = 'Pizza Slice App - Order placed';
                    const toEmailCustomer = user.email;
                    console.log(toEmailCustomer);
                    mailSender(toEmailCustomer, markupCustomer, subjectCustomer);

                    let markupAdmin = `
                        <div style="height: 50px; width: 100%; background: #59b256">
                            <h1 style="color: #fff; text-align: center; padding-top: 15px;">New Order</h1>
                        </div>
                        <img src="https://thumbs.dreamstime.com/b/mobile-shopping-app-modern-online-technology-internet-customer-service-icon-order-placed-processing-processed-metaphors-vector-184200609.jpg" alt="">
                        <h1>Congrats !! <br />New Order has been placed successfully</h1>
                        <p>Payment method : ${paymentType === 'cod' ? 'Cash on Delivery' : 'Card'}</p>
                        <p>Price : Rs ${price}</p>
                    `;
                    const subjectAdmin = `New Order placed by ${user.name}`;
                    const toEmailAdmin = 'sarthakshukla1317@gmail.com';
                    mailSender(toEmailAdmin, markupAdmin, subjectAdmin);
                }
                
                orderModel.populate(result, { path: 'customerId' }, async (err, placedOrder) => {
                    
                    //   Stripe payment
                    
                    if(paymentType === 'card') {
                        const token = await stripe.tokens.create({
                            card: {
                            number: card,
                            exp_month: expiry_month,
                            exp_year: expiry_year,
                            cvc: cvc,
                            },
                        });
                        if(!token) {
                            return res.status(403).json({ message: 'Invalid card details' });
                        }
                        
                        stripe.charges.create({
                            amount: price * 100,
                            source: token.id,
                            currency: 'inr',
                            description: `Food order: ${placedOrder._id}`
                        }).then(() => {
                            placedOrder.paymentStatus = true;
                            placedOrder.paymentType = paymentType;
                            placedOrder.save().then((ord) => {
                                return res.json({ message: 'Payment Successful, Order placed successfully', order_id: placedOrder._id });
                            }).catch(err => {
                                console.log(err);
                            })
                        }).catch(err => {
                            return res.json({ message: 'Order placed successfully but Payment failed, You can pay at delivery time', order_id: placedOrder._id });
                        })
                    } else {
                        return res.json({ message: 'Order placed successfully', order_id: placedOrder._id });
                    }
                    
                } )
            }).catch(err => {
                return res.status(500).json({ message: 'Something went wrong!!' });
            })
    }

    async fetchOrders(req, res) {
        try {
            const orders = await orderModel.find({ customerId: req.user._id }, 
                null,
                { sort: { 'createdAt': -1}});
            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

            return res.status(200).json(orders);
        } catch(err) {
            return res.status(500).json({ message: 'Internal server error !' });
        }
    }
}



module.exports = new OrderController();