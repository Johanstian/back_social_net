const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const FollowSchema = new mongoose.Schema({
    following_user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    followed_user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

//Definir índice único para evitar duplicación

FollowSchema.index({ following_user: 1, followed_user: 1 }, { unique: true })

FollowSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Follow', FollowSchema, 'follows');