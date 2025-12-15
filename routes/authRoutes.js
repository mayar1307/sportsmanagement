const router = require('express').Router();
const AuthController = require('../controllers/AuthController');
const authController = new AuthController();

router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
