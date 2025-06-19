const Router = require('express')
const router = new Router()
const UserController = require('../controllers/userController')
const authMiddleware = require('../middlewares/authMiddleware')
const checkRole = require('../middlewares/checkRoleMiddleware')
const guestGuard = require('../middlewares/guestGuard')
const passport = require('passport');

router.post('/registration', UserController.registration)
router.post('/login',  UserController.login)
router.post('/guest-login', UserController.guestLogin)
router.get('/check', authMiddleware, UserController.check)
router.put('/update/:id', UserController.update)
router.get('/getAll', UserController.getAll) //checkRole('ADMIN')
router.post('/searchUsers', UserController.searchUsers)
router.post('/friendRequest', guestGuard, UserController.friendRequest)
router.post('/getMultiple', UserController.getMultiple)
router.post('/getExact', UserController.getExact)
router.post('/checkPassword', UserController.checkPassword)
router.post('/auth', UserController.auth)
router.get('/changeOnlineStatus/:userId/:isOnline', UserController.changeOnlineStatus)

module.exports = router