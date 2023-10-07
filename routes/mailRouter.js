const Router = require('express')
const router = new Router()
const MailController = require('../controllers/MailController')



router.get('/testMail/:email', MailController.test)
router.post('/recovery', MailController.passwordRecovery)
router.post('/checkToken', MailController.checkPasswordToken)

module.exports = router