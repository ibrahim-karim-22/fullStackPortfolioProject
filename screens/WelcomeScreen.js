const express = require('express');
const router = express.Router();

welcomeRouter
.route('/')
.get((req, res) => {
    res.render('index', { title: 'Welcome!' });
});

module.exports = welcomeRouter;