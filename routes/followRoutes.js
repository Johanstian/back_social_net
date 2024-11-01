const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');

const { getFollows, saveFollow, unfollow, following, followers } = require('../controllers/followController');


router.post('/follow', auth, saveFollow);

router.get('/get-follows', getFollows);
router.delete('/unfollow/:id', auth, unfollow);
router.get('/following/:id?/:page?', auth, following);
router.get('/followers/:id?/:page?', auth, followers);

// router.post('/loginUser', loginUser);

// router.delete('/:id', deleteUser);


module.exports = router;