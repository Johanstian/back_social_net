const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { v2: cloudinary } = require('cloudinary');

const { getPublications, savePublication, showPublication, deletePublication, publicationUser, uploadMedia, showMedia, feed } = require('../controllers/publicationController');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'publications',
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
    public_id: (req, file) => 'publication-' + Date.now()
  }
});

const uploads = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 1,
  }
});

router.get('/get-publications', getPublications);
router.post('/create-publication', auth, savePublication);
router.get('/show-publication/:id', auth, showPublication);
router.delete('/delete-publication/:id', auth, deletePublication);
router.get('/user-publication/:id/:page?', auth, publicationUser);
router.post('/upload-media/:id', [auth, uploads.single('file0')], uploadMedia);
router.get('/media/:id', showMedia);
router.get('/feed/:page?', auth, feed);

module.exports = router;