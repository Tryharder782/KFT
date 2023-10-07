const Router = require('express')
const router = new Router()
const userRouter = require('./userRouter')
const groupRouter = require('./groupRouter')
const postRouter = require('./postRouter')
const messageRouter = require('./messageRouter')
const chatRouter = require('./chatRouter')
const commentRouter = require('./commentRouter')
const mailRouter = require('./mailRouter')

router.use('/users', userRouter)
router.use('/groups', groupRouter)
router.use('/posts', postRouter)
router.use('/messages', messageRouter)
router.use('/chats', chatRouter)
router.use('/comments', commentRouter)
router.use('/mails', mailRouter)

module.exports = router