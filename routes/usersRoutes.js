const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { v2: cloudinary } = require('cloudinary');

const { testUser, getUsers, createUser, login, profile, listUsers, updateUser, uploadAvatar, getAvatar, counters } = require('../controllers/userController');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'avatars',
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
    public_id: (req, file) => 'avatar-' + Date.now()
  }
});

const uploads = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 1,
  }
});

router.get('/test-user', auth, testUser);
router.get('/get-users', getUsers);
router.post('/create-user', createUser);
router.post('/login', login);
router.get('/profile/:id', auth, profile);
router.get('/list/:page?', auth, listUsers);
router.put('/update', auth, updateUser);
router.post('/upload-avatar', auth, uploads.single('file0'), uploadAvatar);
router.get('/avatar/:id', getAvatar);
router.get('/counters/:id?', auth, counters);


module.exports = router;