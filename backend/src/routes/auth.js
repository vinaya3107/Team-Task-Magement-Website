const express = require('express');
const router  = express.Router();

const { signup, login, me } = require('../controllers/authController');
const { signupValidator, loginValidator } = require('../validators/authValidator');
const validate = require('../middleware/validate');
const auth     = require('../middleware/auth');

router.post('/signup', signupValidator, validate, signup);
router.post('/login',  loginValidator,  validate, login);
router.get('/me',      auth,                      me);

module.exports = router;
