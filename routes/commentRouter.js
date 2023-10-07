const Router = require('express')
const CommentController = require('../controllers/CommentController')
const router = new Router()

router.post('/create', CommentController.create)
router.get('/get/:id/:limit/:offset', CommentController.getPostComments)
router.put('/likeComment', CommentController.likeComment)
router.delete('/unlikeComment/:commentId/:postId/:userId', CommentController.unlikeComment)
router.put('/update', CommentController.edit)
router.delete('/delete', CommentController.delete)

module.exports = router