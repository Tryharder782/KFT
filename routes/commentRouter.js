const Router = require('express')
const CommentController = require('../controllers/CommentController')
const router = new Router()
const guestGuard = require('../middlewares/guestGuard')

router.post('/create', guestGuard, CommentController.create)
router.get('/get/:id/:limit/:offset', CommentController.getPostComments)
router.put('/likeComment', guestGuard, CommentController.likeComment)
router.delete('/unlikeComment/:commentId/:postId/:userId', guestGuard, CommentController.unlikeComment)
router.put('/update', guestGuard, CommentController.edit)
router.delete('/delete', guestGuard, CommentController.delete)

module.exports = router