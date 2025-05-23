const express = require("express");
const authControllers = require('../controllers/auth');

const router = express.Router();

router.get('/', (req, res) => {
    res.render('login');
});

router.get('/register', (req,res) => {
    res.render('register');
})

router.get('/home', authControllers.home);

router.get('/movie/:id', authControllers.SpecificMovie);

router.get('/profile', authControllers.profile);

router.post('/movie/:id/review', authControllers.addReview);

module.exports = router;