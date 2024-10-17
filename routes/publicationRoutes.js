const express = require('express');
const router = express.Router();

const { getPublications } = require('../controllers/publicationController');


// router.post('/createUser', createUser);

router.get('/getPublications', getPublications);

// router.post('/loginUser', loginUser);

// router.delete('/:id', deleteUser);


module.exports = router;