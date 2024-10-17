const express = require('express');
const router = express.Router();

const { getUsers } = require('../controllers/userController');


// router.post('/createUser', createUser);

router.get('/get-users', getUsers);

// router.post('/loginUser', loginUser);

// router.delete('/:id', deleteUser);


module.exports = router;