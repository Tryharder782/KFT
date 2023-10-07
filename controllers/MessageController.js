const ApiError = require("../ErrorApi/ApiError")
const { Message, Chat } = require("../models/models")
const { Op } = require("sequelize");
const fs = require("fs")
const path = require('path')
const uuid = require('uuid')
const FileType = import('file-type');

class MessageController {
	async create(req, res, next) {
		try {
			const { sender, text, reciever, respondTo, chatId } = req.body
			let media = req.files

			console.log('create Message',sender, text, chatId)
			let newMessage
			// console.log(typeof (media))
			newMessage = { sender, text, reciever, respondTo: respondTo === 'null' ? null : Number(respondTo), chatId, media: [] }
			if (media) {
				// console.log(media[1])
				for (let key in media) {
					const file = media[key];
					// console.log(media)
					const fileBuffer = fs.readFileSync(file.tempFilePath);
					const fileInfo = await (await FileType).fileTypeFromBuffer(fileBuffer);
					const fileExtension = fileInfo.ext;

					let fileName = uuid.v4() + '.' + fileExtension
					file.mv(path.resolve(__dirname, '..', 'static', `${fileName}`))
					newMessage.media = [...newMessage.media, fileName]
					// console.log(newMessage.media)
				}
			}
			if (!sender) {
				return next(ApiError.badRequest('specify the sender!'))
			}
			if (!text && !media) {
				return next(ApiError.badRequest('Empty message!'))
			}
			console.log(newMessage)
			const newmsg = await Message.create(newMessage)
			const result = await Message.findOne({ where: { id: newmsg.id } })
			console.log(result)
			global.io.emit('new_message', result)
			return res.json('sended!')
		} catch (error) {
			return next(ApiError.internal(error))
		}
	}

	async update(req, res, next) {
		const { id, text } = req.body
		const media = req.files
		const updatedMessage = await Message.update({ text, media, }, { where: { id } })
		return res.status(200)
	}

	async delete(req, res, next) {
		let { id, userId } = req.params
		id = Number(id)
		userId = Number(userId)
		// console.log('id:', id, 'user id:', userId)
		const deletedMessage = await Message.findOne({ where: { id } })
		if (userId !== deletedMessage.sender) {
			return next(ApiError.forbidden('You cannot delete other\'s messages!'))
		}
		await Message.destroy({ where: { id } })
		return res.json('deleted!')
	}

	async getChatMessagesByMembers(req, res, next) {
		try {
			let { userList, requesterId } = req.body;
			userList = userList.sort();
			console.log('userList', userList, requesterId);
			if (!userList.includes(requesterId)) {
				return next(ApiError.forbidden("You cannot access others' chat info"));
			}

			let chat = await Chat.findOne({ where: { userList: userList } });
			if (!chat) {
				return res.json({ messages: [], chatId: null });
			}
			const chatId = chat.id;
			const { limit, offset } = req.body;

			console.log('limit, offset', limit, offset)
			console.log(chatId)
			const messages = await Message.findAll({
				where: { chatId },
				order: [['createdAt', 'DESC']],
				limit,
				offset,
			});
			global.io.emit('hello', 'texxxxxt')

			return res.json({ messages, chatId });
		} catch (error) {
			console.error('Error occurred while fetching chat messages:', error);
			next(error);
		}
	}
	async getChatMessages(req, res, next) {
		let { chatId, userId, limit, offset } = req.body
		chatId = Number(chatId)
		userId = Number(userId)
		limit = Number(limit)
		offset = Number(offset)
		console.log(chatId);
		if (!chatId) {
			return next(ApiError.badRequest('specify chat ID'))
		}
		const chat = await Chat.findOne({ where: { id: chatId } })
		if (!chat) {
			return next(ApiError.badRequest('chat is not found! check the specified chatId'))
		}
		if (!chat.userList.includes(userId)) {
			return next(ApiError.forbidden('you cannot get messages of the chat, that you are not a part of!'))
		}
		const chatMessages = await Message.findAll({
			where: { chatId },
			order: [['createdAt', 'DESC']],
			limit,
			offset,
		})
		// console.log('chatMessages', chatMessages)
		return res.json(chatMessages)
	}

	// async getChatMessages(req, res, next) {
	// 	let { chatId, userId } = req.params
	// 	chatId = Number(chatId)
	// 	userId = Number(userId)
		// console.log(chatId, userId);

	// 	if (!chatId) {
	// 		return next(ApiError.badRequest('specify chat ID'))
	// 	}
	// 	const chat = await Chat.findOne({ where: { id: chatId } })
	// 	if (!chat) {
	// 		return next(ApiError.badRequest('chat is not found! check the specified chatId'))
	// 	}
		// console.log(chat.userList);
	// 	if (!chat.userList.includes(userId)) {
	// 		return next(ApiError.forbidden('you cannot get messages of the chat, that you are not a part of!'))
	// 	}
	// 	const chatMessages = await Message.findAll({ where: { chatId } })
	// 	return res.json(chatMessages)
	// }
}

module.exports = new MessageController