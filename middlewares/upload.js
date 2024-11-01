const path = require('path')
const multer = require('multer')

var storage = multer.diskStorage({
    destination: function(req, res, cb) {
        cb(null, '/uploads')
    },
    filename: function(req, file, cb) {
        let ext = path.extname(file.originalname)
        cb(null, Date.now() + ext)
    }
})

var upload = multer({
    storage: storage,
    fileFilter: function(req, file, callback) {
        if (file.mimetype == 'image/jpg' || file.mimetype == 'image/png') {
            callback(null, true)
        } else {
            console.log('only jpg and png files')
            callback(null, false)
        }
    },
    limits: {
        fileSize: 1024 * 1024 * 2
    }
})

module.exports = upload