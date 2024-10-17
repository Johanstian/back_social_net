const Follow = require('../models/followModel');

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

module.exports = { getFollows }