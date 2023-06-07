const router = require('express').Router();
const userController = require('../controllers/userController');
const { requireUser } = require('../middlewares/requireuser');


router.post('/follow', requireUser, userController.followController)
router.get('/getfeeddata', requireUser, userController.getFeedData)
router.get('/getallusers', requireUser, userController.getAllUsers)
router.get('/getmyposts', requireUser, userController.getMyPosts)
router.get('/getanypost', requireUser, userController.getAnyPost)
router.get('/getusersposts', requireUser, userController.getUsersPost)

router.post('/getusersprofile', requireUser, userController.getUsersProfile)

router.get('/getmyprofile', requireUser, userController.getMyProfile)
router.put('/', requireUser, userController.updateProfile)

router.delete('/deleteprofile', requireUser, userController.deleteMyProfile)

module.exports = router