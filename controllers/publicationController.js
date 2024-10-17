const Publication =  require('../models/publicationModel');

const getPublications = async (req, res, next) => {
    try {
        const publications = await Publication.find();
        res.status(200).json({
            publications
        })
    } catch (error) {
        console.log(error);
        return next(error);
    }
}

module.exports = { getPublications }