const router = require('express').Router();
const authRoute = require('./authRouter')
const postRoute = require('./postRouter')
const userRoute = require('./userRouter')


router.use('/auth', authRoute)
router.use('/post', postRoute)
router.use('/user', userRoute)


module.exports = router

