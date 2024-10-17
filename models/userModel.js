const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2')

const UserSchema = new mongoose.Schema({
    
    name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true,
        unique: true
    },
    nick: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    bio: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: 'role_user',
    },
    image: {
        type: String,
        default: 'default_user.png',
    },
    created_at: {
        type: Date,
        default: Date.now,
    }
});

UserSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('User', UserSchema, 'users')