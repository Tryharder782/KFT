const Router = require('express')
const MessageController = require('../controllers/MessageController')
const router = new Router()

router.post('/create', MessageController.create)
router.post('/getByMembers', MessageController.getChatMessagesByMembers)
router.post('/getChatMessages', MessageController.getChatMessages)
router.put('/update', MessageController.update)
router.delete('/delete/:id/:userId', MessageController.delete)

module.exports = router