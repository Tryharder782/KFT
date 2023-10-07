const { Post } = require("../models/models")
const fs = require("fs")
const path = require('path')
const uuid = require('uuid')
const ApiError = require("../ErrorApi/ApiError")
const requestLogging = require('../scripts/requestLogging')
const { formToJSON } = require("axios")
const FileType = import('file-type');

class PostController {
	async create (req,res,next) {
		let post = req.body
		post = {...post, mediaList : []}
		let media = req.files
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
				post.mediaList = [...post.mediaList, fileName]
				// console.log(newMessage.media)
			}
		}
		// for (let i = 0; i < mediaList.length; i++) {
		// 	const file = mediaList[i]
		// 	let fileName = uuid.v4() + file.type
		// 	file.mv(path.resolve(__dirname, '..', 'static', `${fileName}`))
		// 	post = {...post, mediaList: [fileName]}
		// }
		const newPost = await Post.create(post)
		return res.json(newPost)
	}

	async getExact (req, res, next) {
		const {id} = req.params
		return res.json(await Post.findOne({where: {id}}))
	}

	async getAll (req, res, next) {
		return res.json(await Post.findAll())
	}

	async change (req,res,next) {
		const {id, authorId, text} = req.body
		if (authorId !== await Post.findOne({where: {id}, attributes: ['authorId']})){
			return res.json(ApiError.badRequest('You are not the author of this post!'))
		}
		const updatedPost = await Post.update({text},{where: {id}})
		return res.json(updatedPost)
	}

	async likePost (req, res, next) {
		try {
			const { postId, userId } = req.body;

			// Проверка наличия необходимых данных
			if (!postId || !userId) {
				return next(ApiError.badRequest('Invalid data. Both postId and userId are required.'));
			}

			// Поиск комментария
			const post = await Post.findByPk(postId);

			if (!post) {
				return next(ApiError.badRequest('No such post.'));
			}

			// Проверка, что пользователь еще не лайкнул этот пост
			if (!post.likedUsers.includes(userId)) {
				post.likedUsers = [...post.likedUsers, userId]
				await post.save();

				console.log(await Post.findByPk(postId,{raw: true}));
			} else {
				// Если пользователь уже лайкнул пост, можно вернуть сообщение об ошибке
				return next(ApiError.badRequest('User has already liked this post.'));
			}

			// Отправить успешный ответ
			return res.json(post.likedUsers.length);
		} catch (err) {
			console.log(err)
			// Обработка внутренней ошибки
			return next(ApiError.internal(err));
		}
	}

	async unlikePost (req, res, next) {
		try {
			let { postId, userId } = req.params;

			postId = Number(postId);
			userId = Number(userId);
			console.log('userId', userId)
			// Проверка наличия необходимых данных
			if (!postId || !userId) {
				return next(ApiError.badRequest('Invalid data. Both postId and userId are required.'));
			}

			// Поиск комментария
			const post = await Post.findByPk(postId);

			if (!post) {
				return next(ApiError.badRequest('No such post.'));
			}

			// Проверка, что пользователь уже лайкнул пост
			if (post.likedUsers.includes(userId)) {
				post.likedUsers = post.likedUsers.filter(likedUser => likedUser !== userId);
				await post.save();

				console.log(await Post.findByPk(postId,{raw: true}));
			} else {
				return next(ApiError.badRequest('Post is not liked yet.'));
			}

			// Отправить успешный ответ
			return res.json(post.likedUsers.length);
		} catch (err) {
			console.log(err)
			// Обработка внутренней ошибки
			return next(ApiError.internal(err));
		}
	}

	
	async update (req,res,next) {
		let start = Date.now()
		console.log('запрос пришёл', start)
		const postData = req.body
		const updatePost = async() => {
			return await Post.update(postData,{
				where: {id: postData.id},
				returning: true,
			})
		}

		let updatedPost = await requestLogging(updatePost, 'user update')
		let end = Date.now()
		updatedPost = updatedPost[1].map(post => post.toJSON())[0]
		global.io.to(`post_${postData.id}`).emit(`post_${postData.id}_liked`, {postId : updatedPost.id, postLikedUsers: updatedPost.likedUsers})
		
		// console.log('время выполнения запроса:', end-start,'миллисекунд')
		return res.json(updatedPost)
	}
	
	async delete (req,res,next) {
		const {id} = req.params
		await Post.destroy({where: {id}})
		return res.json(`post with id: ${id} has been deleted`)
	}

	async getFYP (req,res,next) {
		const {userId} = req.params
	}
	async getUserPosts (req,res,next) {
		const userId = req.params.id
		console.log(userId)
		if(!userId) {
			return next(ApiError.badRequest('specify user id'))
		}
		const userPosts = await Post.findAll({
			where: {authorId: userId},
			order: [['createdAt', 'ASC']], // Сортировка по убыванию (последние обновления сверху)
		})
		if (!userPosts) {
			return next(ApiError.badRequest('no posts were found'))
		}
		console.log(userPosts)
		return res.json(userPosts)
	}
}


module.exports = new PostController()