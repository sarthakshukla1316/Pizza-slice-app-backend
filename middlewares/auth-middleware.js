const tokenService = require("../services/token-service");

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization;
        if(!token) {
            throw new Error();
        }

        const accessToken = token.split(' ')[1];
        if(!accessToken) {
            throw new Error();
        }
        console.log(accessToken, 'token');

        const userData = await tokenService.verifyAccessToken(accessToken);
        console.log(userData, 'userdata');
        if(!userData) {
            throw new Error();
        }

        req.user = userData;

        next();
    } catch(err) {
        res.status(401).json({ message: 'Invalid Token' });
    }
}


module.exports = { authMiddleware };