const Router = require('express')
const GroupController = require('../controllers/GroupController')
const router = new Router()

router.post('/create', GroupController.create)
router.get('/getAll', GroupController.getAll)
router.get('/getExact/:id', GroupController.getExact)


module.exports = router