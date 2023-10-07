const ApiError = require("../ErrorApi/ApiError")
const { Chat, Message } = require("../models/models")
const { Op } = require("sequelize");

class ChatController {
	async create(req,res,next) {
		let {userList, adminList} = req.body
		userList = userList.sort()
		adminList = adminList.sort()
		if (!userList){
			return next(ApiError.badRequest('specify user list'))
		}
		const newChat = await Chat.create({userList, adminList})
		return res.json(newChat.id)
	}

	async getUserChats(req,res,next){
		try {
			const { userId } = req.params
			console.log('userId', userId)
			const chats = await Chat.findAll({
				where: {
					userList: {
						[Op.contains]: [userId]
					}
				}
			})
			// console.log(chats)
			return res.json(chats)
		} catch (error) {
			return next(ApiError.internal(error))
		}
		
	}
	
	async get(req,res,next){
		const {id} = req.params
		const chat = Chat.findOne({where: {id}})
		if (!chat) return next (ApiError.badRequest('chat not found'))
		return res.json(chat)
	}

	async update(req,res,next) {
		const {id, userList, adminList} = req.body
		const mediaList = req.files
		if (!userList){
			return next(ApiError.badRequest('chat cannot be empty!'))
		}
		if (!adminList){
			return next(ApiError.badRequest('there should be at least one admin!'))
		}
		const updatedChat = await Chat.update({userList, mediaList}, {where: {id}})
		return res.json('chat updated! \n', updatedChat)
	}

	async delete(req,res,next) {
		const {userId, chatId} = req.body
		if (!Number(chatId)){
			return next(ApiError.badRequest('chatId is invalid!'))
		}
		const deletedChat = await Chat.findOne({where: {id : chatId}})
		if (!deletedChat.adminList.includes(userId)){
			return next(ApiError.forbidden('you cannot delete this chat (only admins can)'))
		}
		await Chat.delete({where:{id : chatId}})
		await Message.delete
		res.json(`chat with id:${id} has been deleted!`)
	}
}


module.exports = new ChatController