const Router = require('express')
const PostController = require('../controllers/PostController.js')
const checkRole = require('../middlewares/checkRoleMiddleware')
const router = new Router()

router.post('/create', PostController.create)
// router.get('/getAll', checkRole("ADMIN"), PostController.getAll)
router.get('/getAll', PostController.getAll)
router.get('/getExact/:id', PostController.getExact)
router.get('/getUserPosts/:id', PostController.getUserPosts)
router.put('/likePost', PostController.likePost)
router.delete('/unlikePost/:postId/:userId', PostController.unlikePost)
router.put('/update/:id', PostController.update)
router.put('/change/:id', PostController.change)
router.get('/getFYP/:userId', PostController.getFYP)

module.exports = router