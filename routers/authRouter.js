const router = require('express').Router();
const authController = require('../controllers/authController');


router.post('/signup',authController.signUpController)
router.post('/login',authController.loginController)
router.post('/logout',authController.logOutController)
router.post('/googlesignup',authController.googleSignUp)
router.get('/refresh',authController.refreshAccessTokenController)



module.exports = router