const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        required: false,
        get: (avatar) => {
            if(avatar)
                return `${process.env.BASE_URL}${avatar}`;
            return avatar;
        }
    },
    verified: {
        type: Boolean,
        required: false,
        default: false,
    },
    role: {
        type: String,
        required: false,
        default: 'user',
    },
}, {
    timestamps: true,
    toJSON: {
        getters: true
    }
});


module.exports = mongoose.model('User', userSchema, 'users');