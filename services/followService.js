const Follow = require('../models/followModel');

const followUserIds = async (req, res) => {
    try {
        const identityUserId = req.user.userId;
        if (!identityUserId) {
            return res.status(400).send
            ({
                status: 'error',
                message: 'Usuario no recibido'
            })
        }

        let following = await Follow.find({ 'following_user': identityUserId }).
        select({ 'followed_user': 1, '_id' : 0 }).exec();

        let followers = await Follow.find({ 'followed_user': identityUserId }).
        select({ 'following_user': 1, '_id': 0 }).exec();

        const user_following = following.map(follow => follow.followed_user);
        const user_follow_me = followers.map(follow => follow.following_user);

        return {
            following: user_following,
            followers: user_follow_me
        }
    } catch (error) {
        return {
            following: [],
            followers: []
        }
    }
}

const followThisUser = async (identityUserId, profileUserId) => {
    try {
        if (!identityUserId || !profileUserId) {
            throw new Error('Ids de los usuarios son inválidos');
        }

        const following = await Follow.findOne({ 'following_user': identityUserId, 'followed_user': profileUserId });
        const follower = await Follow.findOne({ 'following_user': profileUserId, 'followed_user': identityUserId });

        return {
            following,
            follower
        }
    } catch (error) {
        console.log('Error al obtener la información del usuario', error);
        return {
            following: null,
            follower: null
        }
    }
}

module.exports = { followUserIds, followThisUser }