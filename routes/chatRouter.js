const Router = require('express')
const ChatController = require('../controllers/ChatController')
const router = new Router()

router.post('/create', ChatController.create)
router.get('/get:id', ChatController.get)
router.get('/getUserChats/:userId', ChatController.getUserChats)
router.put('/update', ChatController.update)
router.delete('/delete', ChatController.delete)


module.exports = router