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
    profession: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        default: '',
    },
    created_at: {
        type: Date,
        default: Date.now,
    }
});

UserSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('User', UserSchema, 'users')