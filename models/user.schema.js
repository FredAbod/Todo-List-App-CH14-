const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        // required: true,
    },
    otpCreatedAt: {
        type: Date,
    //    default: Date.now()
        // required: true,
    },
    isVerified: {
        type: Boolean,
        required: true,
        default: false,
    },
    list: [
        {
            description: {
                type: String,
                // required: true,
            },
            completed: {
                type: Boolean,
                default: false,
            },
        }
    ]
}, {
    versionKey: false,
    timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
