const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const {requireUser} = require('../middlewares/requireuser.js');


router.post('/create', requireUser, postController.createPostController)
router.post('/like', requireUser, postController.likeController)
router.put('/updatePost', requireUser, postController.updatePostController)
router.delete('/deletePost', requireUser, postController.deletePostController)

module.exports = router;