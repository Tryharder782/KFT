const { Op } = require("sequelize")
const ApiError = require("../ErrorApi/ApiError")
const { Comment, User } = require("../models/models")
const fs = require("fs")
const path = require('path')
const uuid = require('uuid')
const FileType = import('file-type');

class CommentController {
	async create (req,res,next) {
		try{
			let {text, postId, userId, replyingToCommentId} = req.body
			if (replyingToCommentId === 'null'){
				replyingToCommentId = null
			}
			const media = req.files
			let newPostMedia 
			if (!text && !media){
				return res.json(ApiError.badRequest('empty comment'))
			}
			if (!postId, !userId){
				return res.json(ApiError.badRequest('missing data'))
			}
			if (media) {
				const file = media
				// console.log(media)
				const fileBuffer = fs.readFileSync(file.tempFilePath);
				const fileInfo = await (await FileType).fileTypeFromBuffer(fileBuffer);
				const fileExtension = fileInfo.ext;

				let fileName = uuid.v4() + '.' + fileExtension
				file.mv(path.resolve(__dirname, '..', 'static', `${fileName}`))
				newPostMedia = fileName
			}
			console.log('newPostMedia', newPostMedia)
			let newComment 
			await Comment.create({text, postId, userId, replyingToCommentId, media: newPostMedia},{returning: true}).then(data => newComment = data.get())
			const newCommentAuthor = await User.findOne({
				where: {id: userId},
				raw: true
			})
			global.io.to(`post_${postId}`).emit(`new_comment_post${postId}`, {...newComment, author: newCommentAuthor})
			return res.json(newComment)
		}catch (err) {
			console.log(err)
			return next(ApiError.internal(err))
		}
	}
	async likeComment(req, res, next) {
		try {
			const { commentId, postId, userId } = req.body;

			// Проверка наличия необходимых данных
			if (!postId || !userId) {
				return next(ApiError.badRequest('Invalid data. Both postId and userId are required.'));
			}

			// Поиск комментария
			const comment = await Comment.findByPk(commentId);

			if (!comment) {
				return next(ApiError.badRequest('No such comment.'));
			}

			// Проверка, что пользователь еще не лайкнул этот комментарий
			if (!comment.likedUsers.includes(userId)) {
				comment.likedUsers = [...comment.likedUsers, userId]
				await comment.save();

				console.log(await Comment.findByPk(commentId,{raw: true}));
			} else {
				// Если пользователь уже лайкнул комментарий, можно вернуть сообщение об ошибке
				return next(ApiError.badRequest('User has already liked this comment.'));
			}

			// Отправить успешный ответ
			return res.json(comment.likedUsers.length);
		} catch (err) {
			console.log(err)
			// Обработка внутренней ошибки
			return next(ApiError.internal(err));
		}
	}
	async unlikeComment(req, res, next) {
		try {
			let { commentId, postId, userId  } = req.params;

			commentId = Number (commentId)
			postId = Number (postId)
			userId = Number (userId)
			
			console.log('unlike comment', commentId,'by user', userId);	

			// Проверка наличия обязательных параметров
			if (!commentId || !userId) {
				return next(ApiError.badRequest('Invalid data. Both commentId and userId are required.'));
			}

			// Поиск комментария
			const comment = await Comment.findByPk(commentId);

			if (!comment) {
				return next(ApiError.badRequest('No such comment.'));
			}
			console.log(comment.likedUsers, userId, comment.likedUsers.indexOf(userId))
			// Поиск индекса пользователя в массиве likedUsers
			const index = comment.likedUsers.indexOf(userId);

			// Проверка, что пользователь уже лайкнул комментарий
			if (index !== -1) {
				// Удаление пользователя из массива likedUsers
				comment.likedUsers = comment.likedUsers.filter(likedUser => likedUser !== userId);
				await comment.save();

				console.log(await Comment.findByPk(commentId,{raw: true}));
				// Отправить JSON-ответ об успешном удалении лайка
				return res.json(comment.likedUsers.length);
			} else {
				return next(ApiError.badRequest('Comment is not liked yet.'));
			}
		} catch (error) {
			// Обработка внутренней ошибки
			return next(ApiError.internal(error));
		}
	}
	
	
	async update (req,res,next) {
		try {
			const {postId,userId} = req.body
			if (!postId || !userId) return next(ApiError.badRequest('invalid data'))
		} catch (error) {
			
		}
	}
	async edit (req,res,next) {
		const {id, text, postId, userId, replyingToCommentId} = req.body
		const media = req.files
		if (!text && !media){
			return res.json(ApiError.badRequest('empty comment'))
		}
		const editedComment = await Comment.update({text,postId,userId,replyingToCommentId, media}, {where:{id}})
		return res.json(editedComment)
	}
	async getPostComments (req,res,next) {
		const {id, limit, offset} = req.params
		if (!id) {
			return res.json(ApiError.badRequest('what post, mf?'))
		}
		let comments = await Comment.findAll({
			where: { postId : id },
			order: [['createdAt', 'DESC']],
			limit,
			offset,
			raw: true,
		})
		const commentsAuthorIds = comments.map(comment => comment.userId)
		const commentsAuthors = await User.findAll({
			where : {
				id: {
					[Op.in]: commentsAuthorIds,
				}
			},
			raw: true,
		})
		comments = comments.map(comment => ({...comment, author: commentsAuthors.find(user => user.id === comment.userId)}))
		return res.json(comments)
	}
	async delete (req,res,next) {
		const {id} = req.params
		if (!id) {
			return res.json(ApiError.badRequest('specify the id'))
		}
		return res.json(`comment with id: ${id} has been deleted`)
	}
}

module.exports = new CommentController()