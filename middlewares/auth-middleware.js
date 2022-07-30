const tokenService = require("../services/token-service");

const authMiddleware = async (req, res, next) => {
    try {
        const { accessToken } = req.header.Authorization;
        // console.log(accessToken);
        if(!accessToken) {
            throw new Error();
        }

        const userData = await tokenService.verifyAccessToken(accessToken);
        console.log(userData);
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