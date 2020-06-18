const express = require('express');
const router = express.Router();

// Routes
const index = require('./index');
const login = require('./login');
const register = require('./register');
const liken = require('./likepage');
const chat = require('./chat');
const gif = require('./gif');
const error = require('./error');

router.use('/', index);
router.use('/', login);
router.use('/', register);
router.use('/', liken);
router.use('/', chat);
router.use('/', gif);
router.use('/', error);

module.exports = router;
