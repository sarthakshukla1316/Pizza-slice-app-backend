const crypto = require('crypto');
const hashService = require('./hash-service');

class OtpService {
    async generateOtp() {
        const otp = crypto.randomInt(100000, 999999);
        return otp;
    }

    verifyOtp(hashedOtp, data) {
        let computedHash = hashService.hashOtp(data);

        return computedHash === hashedOtp;
    }
}


module.exports = new OtpService();