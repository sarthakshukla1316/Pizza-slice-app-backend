const router = require('express').Router();
const authController = require('./controllers/auth-controller');
const orderController = require('./controllers/order-controller');



// Authentication
router.post('/api/send-otp', authController.sendEmailOtp);
router.post('/api/verify-otp', authController.verifyEmailOtp);
// login
router.post('/api/login', authController.login);
router.post('/api/login-via-password', authController.loginViaPassword);
router.post('/api/logout', authController.logout);
// orders
router.post('/api/make-order', orderController.makeOrder);




module.exports = router;