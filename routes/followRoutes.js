const express = require('express');
const router = express.Router();

const { getFollows } = require('../controllers/followController');


// router.post('/createUser', createUser);

router.get('/getFollows', getFollows);

// router.post('/loginUser', loginUser);

// router.delete('/:id', deleteUser);


module.exports = router;