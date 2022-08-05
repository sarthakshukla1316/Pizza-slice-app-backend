const router = require('express').Router();
const authController = require('./controllers/auth-controller');
const menuController = require('./controllers/menu-controller');
const orderController = require('./controllers/order-controller');
const restrauntController = require('./controllers/restraunt-controller');
const { authMiddleware } = require('./middlewares/auth-middleware');



// Authentication
router.post('/api/send-otp', authController.sendEmailOtp);
router.post('/api/verify-otp', authController.verifyEmailOtp);

// login
router.post('/api/login', authController.login);
router.post('/api/login-via-password', authController.loginViaPassword);
router.post('/api/logout', authMiddleware, authController.logout);

router.post('/api/refresh', authController.refresh);

// Fetch Menu
router.get('/api/fetch-items', menuController.fetchMenu);
router.post('/api/create-item', menuController.createItem);

// restraunt
router.get('/api/fetch-restraunts', restrauntController.fetchRestraunts);
router.post('/api/create-restraunt', restrauntController.createRestraunt);

// confirm order
router.post('/api/send-order-otp', authMiddleware, orderController.sendOrderOtp);
router.post('/api/checkout', authMiddleware, orderController.checkout);

// Fetch order
router.get('/api/fetch-orders', authMiddleware, orderController.fetchOrders);


module.exports = router;