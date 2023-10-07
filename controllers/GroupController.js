const ApiError = require("../ErrorApi/ApiError")
const { Group } = require("../models/models")


class GroupController {
	
	async create (req,res,next) {
		const {name, type} = req.body
		const candidate = await Group.findOne({where: {name}})
		if (candidate) {
			return next(ApiError.badRequest('Group with that name already exists'))
		} 
		const newGroup = await Group.create({name, type})
		return res.json(newGroup)
	}
	async getAll (req,res,next) {
		return res.json(await Group.findAll())
	}
	async getExact (req,res,next) {
		const {id} = req.params
		console.log(id);
		return res.json(await Group.findOne({where: {id}}))
	}
}

module.exports = new GroupController()