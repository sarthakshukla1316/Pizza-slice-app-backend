const hashService = require("../services/hash-service");
const otpService = require("../services/otp-service");
const userService = require("../services/user-service");
const mailSender = require("../services/mailsender");
const tokenService = require("../services/token-service");
const UserDto = require("../dtos/user-dto");
const bcrypt = require('bcrypt');

class AuthController {
    async sendEmailOtp(req, res) {
        const { email, phone, name, password, confirmPassword } = req.body;
        if(!email || !phone || !name || !password || !confirmPassword) {
            res.status(400).json({ message: 'All fields are required !'});
        }

        let user = await userService.findUser({ $or:[ { 'phone': phone }, { 'email': email } ]});
        if(user) {
            return res.status(401).json({ message: 'User already registered' });
        }

        if(password !== confirmPassword) {
            return res.status(401).json({ message: 'password and confirm password does not match' });
        }

        // Generate Otp
        const otp = await otpService.generateOtp();

        // Hash Otp
        const ttl = 1000 * 60 * 10;                  // 2 minutes
        const expires = Date.now() + ttl;           // Expiry time

        const data = `${email}.${otp}.${expires}`;
        const hash = hashService.hashOtp(data);

        // Send otp
        try {
            let markupCustomer = `
                    <div style="height: 50px; width: 100%; background: #59b256">
                        <h1 style="color: #fff; text-align: center; padding-top: 20px;">Verification Code</h1>
                    </div>
                    <h1>Your Verification code is <br /> </h1>
                    <p style="font-size: 20px">${otp}</p>
                    <p>Please do not disclose this OTP with anyone.</p>
            `;
            const subjectCustomer = 'Food Delivery - OTP Verification';
            const toEmailCustomer = email;
            mailSender(toEmailCustomer, markupCustomer, subjectCustomer);

            let hashedPassword = await bcrypt.hash(password, 10);           //   Hash password
            if(!user) {
                user = await userService.createUser({ email, phone, name, password: hashedPassword });
            }


            res.status(200).json({
                hash: `${hash}.${expires}`,
                email,
            })
        } catch(err) {
            console.log(err);
            res.status(500).json({ message: 'Otp Sending failed'});
        }
    }

    async verifyEmailOtp(req, res) {
        const { email, otp, hash } = req.body;
        console.log(otp);

        if(!email || !otp || !hash) {
            return res.status(400).json({ message: "All fields are required"});
        }

        console.log(otp);

        const [ hashedOtp, expires ] = hash.split('.');

            if(Date.now() > +expires) {
                return res.status(400).json({ message: 'Otp expired !'});
            }
    
            const data = `${email}.${otp}.${expires}`;
    
            const isValid = otpService.verifyOtp(hashedOtp, data);
    
            if(!isValid) {
                return res.status(400).json({ message: 'Invalid Otp' });
            }
    
            let user;
    
            try {
                user = await userService.findUser({ email });
                if(!user) {
                    return res.status(401).json({ message: 'Invalid Email address' });
                }

                user.verified = true;

                user.save();

                const { accessToken, refreshToken } = tokenService.generateTokens({ 
                    _id: user._id,
                    verified: true,
                });
        
                await tokenService.storeRefreshToken(refreshToken, user._id);

                const userDto = new UserDto(user);
                return res.json({ user: userDto, auth: true, accessToken, refreshToken });

                
            } catch(err) {
                console.log(err);
                return res.status(500).json({ message: 'Something went wrong...'});
            }

    }

    async login(req, res) {
        const { email } = req.body;
        if(!email) {
            res.status(400).json({ message: 'All fields are required !'});
        }

        let user = await userService.findUser({ email });
        if(!user) {
            return res.status(401).json({ message: 'No user found with this email' });
        }

        if(user.verified === false) {
            return res.status(401).json({ message: 'User not verified !' });
        }

        // Generate Otp
        const otp = await otpService.generateOtp();

        // Hash Otp
        const ttl = 1000 * 60 * 10;                  // 2 minutes
        const expires = Date.now() + ttl;           // Expiry time

        const data = `${email}.${otp}.${expires}`;
        const hash = hashService.hashOtp(data);

        // Send otp
        try {
            let markupCustomer = `
                    <div style="height: 50px; width: 100%; background: #59b256">
                        <h1 style="color: #fff; text-align: center; padding-top: 20px;">Verification Code</h1>
                    </div>
                    <h1>Your Verification code is <br /> </h1>
                    <p style="font-size: 20px">${otp}</p>
                    <p>Please do not disclose this OTP with anyone.</p>
            `;
            const subjectCustomer = 'Food Delivery - OTP Verification';
            const toEmailCustomer = email;
            mailSender(toEmailCustomer, markupCustomer, subjectCustomer);

            return res.status(200).json({
                hash: `${hash}.${expires}`,
                email,
            })
        } catch(err) {
            console.log(err);
            return res.status(500).json({ message: 'Otp Sending failed'});
        }
    }

    async loginViaPassword(req, res) {
        try {
            const { email, password } = req.body;
            if(!email || !password) {
                return res.status(400).json({ message: 'All fields are required !' });
            }
    
            let user = await userService.findUser({ email });
            if(!user) {
                return res.status(401).json({ message: 'No user found with this email' });
            }
    
            if(user.verified === false) {
                return res.status(401).json({ message: 'User not verified !' });
            }
    
            const exist = bcrypt.compare(user.password, password);
            if(exist) {
                const { accessToken, refreshToken } = tokenService.generateTokens({ 
                    _id: user._id,
                    verified: true,
                });

                await tokenService.storeRefreshToken(refreshToken, user._id);
        
                const userDto = new UserDto(user);
                return res.status(200).json({ user: userDto, auth: true, accessToken, refreshToken });
            }
            return res.status(401).json({ message: 'Invalid user or password' });
            
        } catch(err) {
            return res.status(500).json({ message: 'Internal Server error' });
        }

    }

    async logout(req, res) {
        try {
            const { refreshToken } = req.body;
            console.log(refreshToken, 'logout');
            await tokenService.removeToken(refreshToken);
    
            return res.status(200).json({ user: null, auth: false });
        } catch(err) {
            return res.status(500).json({ message: 'Internal server error !' });
        }
    }

    async refresh(req, res) {

        try {
            const { refreshTokenFromCookie } = req.body;

            let userData;
            try {
                userData = await tokenService.verifyRefreshToken(refreshTokenFromCookie);
            } catch(err) {
                return res.status(401).json({ message: 'Invalid token'});
            }
            
            try {
                const token = await tokenService.findRefreshToken(userData._id, refreshTokenFromCookie);
                console.log(token, 'find ref');
                if(!token) {
                    return res.status(401).json({ message: 'Invalid token'});
                }
            } catch(err) {
                return res.status(500).json({ message: 'Invalid token'});
            }
    
            const user = await userService.findUser({ _id: userData._id });
            if(!user) {
                return res.status(404).json({ message: 'No user'});
            }
    
            const { accessToken, refreshToken } = tokenService.generateTokens({ _id: userData._id });
    
            try {
                await tokenService.updateRefreshToken(userData._id, refreshToken);
            } catch(err) {
                return res.status(404).json({ message: 'Internal Server error'});
            }

    
            const userDto = new UserDto(user);
            return res.status(200).json({ user: userDto, auth: true, accessToken, refreshToken });
    
        } catch(err) {
            return res.status(500).json({ message: 'Internal server error !' });
        }
    }
}


module.exports = new AuthController();