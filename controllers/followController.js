const User = require('../models/userModel');
const Follow = require('../models/followModel');
const jwtService = require('../services/jwt');
const { followUserIds } = require('../services/followService');


const getFollows = async (req, res, next) => {
    try {
        const follows = await Follow.find();
        res.status(200).json({
            follows
        })
    } catch (error) {
        console.log(error);
        return next(error);
    }
}

const saveFollow = async (req, res) => {
    try {
        const { followed_user } = req.body;
        const identity = req.user;
        if (!identity || !identity.userId) {
            return res.status(400).send({
                status: 'error',
                message: 'No se ha proporcionado el usuario para seguir'
            })
        }

        if (identity.userId === followed_user) {
            return res.status(400).send({
                status: 'error',
                message: 'No puede seguirte a ti mismo'
            })
        }

        const followedUser = await User.findById(followed_user)
        if (!followedUser) {
            return res.status(404).send({
                status: 'error',
                message: 'No encontró al usuario'
            })
        }

        const existingFollow = await Follow.findOne({
            following_user: identity.userId,
            followed_user: followed_user
        })

        if (existingFollow) {
            return res.status(400).send({
                status: 'error',
                message: 'Ya lo estás siguiendo'
            })
        }

        const newFollow = new Follow({
            following_user: identity.userId,
            followed_user: followed_user
        })

        const followStored = await newFollow.save()
        if (!followStored) {
            return res.status(500).send({
                status: 'error',
                message: 'No se ha podido seguir al usuario, ponte en contacto con el admin'
            })
        }

        const followedUserDetails = await User.findById(followed_user).select('name last_name');
        if (!followedUserDetails) {
            return res.status(404).send({
                status: 'error',
                message: 'Usuario no encontrado'
            })
        }

        const combinedFollowData = {
            ...followStored.toObject(),
            followedUser: {
                name: followedUserDetails.name,
                last_name: followedUserDetails.last_name
            }
        }

        return res.status(200).json({
            status: 'success',
            message: 'Seguido',
            identity: req.user,
            follow: combinedFollowData
        })

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).send({
                status: 'error',
                message: 'Ya lo estás siguiendo'
            })
        }
        return res.status(500).send({
            status: 'error',
            message: 'Error al seguir al usuario'
        })
    }
}

const unfollow = async (req, res) => {
    try {
        const userId = req.user.userId;
        const followedId = req.params.id;

        const followDeleted = await Follow.findOneAndDelete({
            following_user: userId,
            followed_user: followedId
        })

        if (!followDeleted) {
            return res.status(404).send({
                status: 'error',
                message: 'No se encontró el follow a eliminar'
            })
        }

        return res.status(200).json({
            status: 'success',
            message: 'Dejaste de seguir al usuario correctamente'
        })
    } catch (error) {
        return res.status(500).send({
            status: 'error',
            message: 'Error al unfollow usuario'
        })
    }
}

const following = async (req, res) => {
    try {
        let userId = req.user && req.user.userId ? req.user.userId : undefined;
        if (req.params.id) userId = req.params.id

        let page = req.params.page ? parseInt(req.params.page, 10) : 1;

        let itemsPerPage = req.query.limit ? parseInt(req.query.limit, 10) : 5;

        const options = {
            page: page,
            limit: itemsPerPage,
            populate: {
                path: 'followed_user',
                select: '-password -role -__v -email'
            },
            lean: true
        }

        const follows = await Follow.paginate({ following_user: userId }, options);

        let followUsers = await followUserIds(req);
        console.log('Resultado de follow users ids', followUsers)

        return res.status(200).send({
            status: 'success',
            message: 'Listado de usuarios que estoy siguiendo',
            follows: follows.docs,
            total: follows.totalDocs,
            pages: follows.totalPages,
            page: follows.page,
            limit: follows.limit,
            users_following: followUsers.following,
            user_follow_me: followUsers.followers
        })
    } catch (error) {
        return res.status(500).send({
            status: 'error',
            message: 'Error al listar los usuarios que estás siguiendo'
        })
    }
}

const followers = async (req, res) => {
    try {
        let userId = req.user && req.user.userId ? req.user.userId : undefined;
        if (req.params.id) userId = req.params.id;

        let page = req.params.page ? parseInt(req.params.page, 10) : 1;

        let itemsPerPage = req.query.limit ? parseInt(req.query.limit, 10) : 5;

        const options = {
            page: page,
            limit: itemsPerPage,
            populate: {
                path: 'following_user',
                select: '-password -role -__v -email'
            },
            lean: true
        }


        const follows = await Follow.paginate({ followed_user: userId }, options);

        let followUsers = await followUserIds(req);
        console.log('Resultado de follow users ids', followUsers);

        return res.status(200).send({
            status: "success",
            message: "Listado de usuarios que me siguen",
            follows: follows.docs,
            total: follows.totalDocs,
            pages: follows.totalPages,
            page: follows.page,
            limit: follows.limit,
            users_following: followUsers.following,
            user_follow_me: followUsers.followers
        });
    } catch (error) {
        return res.status(500).send({
            status: 'error',
            message: 'Error al listar los usuarios que me siguen'
        })
    }
}

module.exports = { getFollows, saveFollow, unfollow, following, followers }