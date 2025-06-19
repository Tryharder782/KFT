const Router = require('express')
const PostController = require('../controllers/PostController.js')
const checkRole = require('../middlewares/checkRoleMiddleware')
const guestGuard = require('../middlewares/guestGuard')
const router = new Router()

router.post('/create', guestGuard, PostController.create)
// router.get('/getAll', checkRole("ADMIN"), PostController.getAll)
router.get('/getAll', PostController.getAll)
router.get('/getExact/:id', PostController.getExact)
router.get('/getUserPosts/:id', PostController.getUserPosts)
router.put('/likePost', guestGuard, PostController.likePost)
router.delete('/unlikePost/:postId/:userId', guestGuard, PostController.unlikePost)
router.put('/update/:id', guestGuard, PostController.update)
router.put('/change/:id', guestGuard, PostController.change)
router.get('/getFYP/:userId', PostController.getFYP)

module.exports = router