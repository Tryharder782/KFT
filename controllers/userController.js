const ApiError = require("../ErrorApi/ApiError")
const { User, UserInfo, Chat, PasswordTokens } = require("../models/models")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { where, Op } = require("sequelize")
const { Sequelize } = require("../db")
const path = require("path")
const uuid = require('uuid')


const generateJwt = (user, option) => {
	if (option === 'reg/log')
	{
		console.log('user login', user.userName, option);
		return jwt.sign(
		{
			email: user.user_info.email, 
			phoneNumber: user.user_info.phoneNumber, 
			groupList: user.user_info.groupList, 
			friendList: user.user_info.friendList, 
			birthYear: user.user_info.birthYear, 
			birthMonth: user.user_info.birthMonth, 
			birthDay: user.user_info.birthDay, 
			status: user.user_info.status, 
			id: user.id, 
			userName: user.userName, 
			profilePicture: user.profilePicture, 
			role: user.role, 
			isOnline: user.isOnline,
			tokenVersion: user.user_info.tokenVersion,
			isPrivate: user.user_info.isPrivate,
			profileHeaderPicture: user.user_info.profileHeaderPicture
		},
		process.env.SECRET_KEY,
		{ expiresIn: '24h' }
	)}
	else if (option === 'check/other') {
		// console.log(user.email, option);
		return jwt.sign(
			{
				email: user.email, 
				phoneNumber: user.phoneNumber, 
				groupList: user.groupList, 
				friendList: user.friendList, 
				birthYear: user.birthYear, 
				birthMonth: user.birthMonth, 
				birthDay: user.birthDay, 
				status: user.status, 
				id: user.id, 
				userName: user.userName, 
				profilePicture: user.profilePicture, 
				role: user.role, 
				isOnline: user.isOnline,
				tokenVersion: user.tokenVersion,
				isPrivate: user.isPrivate,
				profileHeaderPicture: user.profileHeaderPicture
			},
			process.env.SECRET_KEY,
			{ expiresIn: '24h' }
		)
	}
}


class UserController {
	async registration(req, res, next) {
		try {
			let isOnline = true
			let { email, password, role, birthYear, birthMonth, birthDay, userName } = req.body
			// console.log(req.body);
			const hashPassword = await bcrypt.hash(password, 10)
			let newUser;
			await User.create({ userName, isOnline }).then(data => {
				newUser = data.get({plain:true})
			})
			await UserInfo.create({ email, password: hashPassword, role, birthYear, birthMonth, birthDay, userId : newUser.id }).then(data => newUser = {...newUser, user_info: data.get({plain: true})})
			// console.log(newUser);
			
			const token = generateJwt(newUser,'reg/log')
			// console.log(token);
			return res.json( {token} )
		}
		catch (e) {
			return next(ApiError.badRequest(e.message))
		}
	}

	async checkExisting(req, res, next) {
		let { email } = req.body
		const candidate = await User.findOne({ where: { email } })
		if (candidate) {
			return next(ApiError.badRequest('User already exists'))
		}
		else {
			return res.status(204)
		}
	}

	async login(req, res, next) {
		try {
			let { email, password } = req.body
			let id
			// console.log('login wtf', email)
			await UserInfo.findOne({
				where: { email },
				attributes: ['userId']
			}).then(data => { 
				if (!data) {
					return next(ApiError.badRequest('User not found'))
				}
				id = data.userId
			})
			const user = await User.findOne({
				where: { id },
				include: [{ model: UserInfo }],
				attributes: { exclude: ['createdAt', 'updatedAt'] }
			})
			// console.log(email)
			if (!user) {
				return next(ApiError.badRequest('User not found'))
			}
			let comparePassword = bcrypt.compareSync(password, user.user_info.password)
			if (!comparePassword) {
				return next(ApiError.badRequest('Wrong login or password'))
			}
			delete user.password
			delete user.user_info.mediaList

			const token = generateJwt(user, 'reg/log')
			return res.json({ token })
		} catch (error){
			return next(ApiError.internal(error))
		}
	}
	async check(req, res, next) {
		// console.log(req.user)
		try {
			const token = generateJwt(req.user, 'check/other')
		return res.json({token})
		} catch (error) {
			return next(ApiError.internal(error))
		}
	}
	async auth(req, res, next) {
		try {
			const {userId, tokenVersion} = req.body
			console.log('auth:',userId, tokenVersion)
			const compareUser = await UserInfo.findOne({where: {userId}})
			// console.log('comparing to user:', compareUser)
			if (!compareUser) {
				return next(ApiError.internal(`couldn\'t find user to compare, user id: ${userId}`))
			}
			if (Number(tokenVersion) === compareUser.tokenVersion)
			{
				console.log('auth OK')
				return res.status(200).send('OK')	
			}
			else {
				return res.status(401)
			}
		} catch (error) {
			return next(ApiError.internal(error))
		}
	}
	async update(req,res,next) {
		try {
			let {id} = req.params
		id = Number(id)
		const {userName, password, status, birthDate, isPrivate, tokenVersion} = req.body
		const {pfp} = req.files
		console.log('update', pfp);
		let requestUser 
		if (userName){
			requestUser = {...requestUser, userName}
		}
		if ( pfp!== 'undefined' ){
			let fileExtension = pfp.mimetype.split('/')[1]
			if (fileExtension === 'jpeg') {
				fileExtension	= 'jpg'
			}
			console.log(fileExtension)
			let fileName = uuid.v4() + '.' + fileExtension
			pfp.mv(path.resolve(__dirname, '..', 'static', `${fileName}`))
			console.log(`file has been moved to ${path.resolve(__dirname, '..', 'static', `${fileName}`)}`)
			requestUser = {...requestUser, profilePicture: fileName}
		}
		let requestUserInfo
		if (password!== ('null')) {
			const hashPassword = await bcrypt.hash(password, 10)
			requestUserInfo = {...requestUserInfo, password : hashPassword, tokenVersion: Number(tokenVersion) + 1}
		}
		if (status) {
			requestUserInfo = {...requestUserInfo, status}
		}
		if (birthDate) {
			const birthDay = Number(birthDate.split('-')[2])
			const birthMonth = Number(birthDate.split('-')[1])
			const birthYear = Number(birthDate.split('-')[0])
			requestUserInfo = {...requestUserInfo, birthDay, birthMonth, birthYear}
		}
		if (isPrivate) {
         requestUserInfo = {...requestUserInfo, isPrivate}
      }
		// console.log(requestUser, requestUserInfo)
		let updatedUser
		await User.update(requestUser, {where:  {id}})
		await UserInfo.update(requestUserInfo, {where: {userId: id}})
		updatedUser = await User.findOne({
			where : {id},
			include: [{model: UserInfo}],
			attributes: {exclude: ['createdAt', 'updatedAt']} 
		})
	 	// console.log(updatedUser);
		return res.json(generateJwt(updatedUser,'reg/log'))

		} catch (error) {
			return next(ApiError.internal(error))
		}
		
	}
	
	async getAll(req,res,next) {
		try {
			return res.json(await User.findAll({}))
		} catch (error) {
			return next(ApiError.internal(error))
		}
	}
	async getExact (req,res,next) {
		try {
			let {id, userId} = req.body
			id = Number(id)
			const user = await User.findOne({
				where : {id},
				include: [{model: UserInfo}],
				attributes: {exclude: ['createdAt', 'updatedAt']} 
			})
			if (!user) {
				return next(ApiError.badRequest('user not found'))
			}
			if (id !== userId) {
				if (user.user_info.isPrivate){
					return next (ApiError.forbidden('User\' account is private'))
				}
			}
			const token = generateJwt(user,'reg/log')
			return res.json({token})
		} catch (error) {
			return next(ApiError.internal(error))
		}
		
	}

	async friendRequest (req,res,next) {
		try {
			const {userId, friendId} = req.body
			// console.log("friendreq", userId, friendId)
			if (!userId || !friendId) {
				return next(ApiError.badRequest('user id or friend id is not valid'))
			}
			let userFriendList = await UserInfo.findOne({where: {userId}, attributes: ['friendList']})
			let friendFriendList = await UserInfo.findOne({where: {userId : friendId}, attributes: ['friendList']})
			userFriendList = userFriendList.friendList
			friendFriendList = friendFriendList.friendList
			// console.log(userFriendList)
			if (userFriendList.includes(friendId)){
				return next(ApiError.badRequest('users are already friends'))
			}
			userFriendList = [...userFriendList, friendId]
			friendFriendList = [...friendFriendList, userId]
			// console.log(userFriendList)
			// console.log(friendFriendList)
			await UserInfo.update({friendList: userFriendList},{where: {userId}})
			await UserInfo.update({friendList: friendFriendList},{where: {userId: friendId}})
			let newChatUserList = [userId, friendId]
			newChatUserList.sort()
			let checkExistingChat = await Chat.findOne({where: {userList: newChatUserList, adminList: newChatUserList}})
			console.log(checkExistingChat)
			if (!checkExistingChat){
				await Chat.create({userList :newChatUserList, adminList: newChatUserList})
			}
			global.io.emit('updateUser', generateJwt(await User.findOne({
				where: {id : userId}, 
				include: [{model: UserInfo}], 
				attributes: {exclude: ['createdAt, updatedAt']}
			}), 'reg/log'))
			return res.json('friend requset status 200')
		} catch (error) {
			return next(ApiError.internal(error))
		}
	}
	
	async searchUsers (req,res,next) {
		try {
			const {text} = req.body
			if (!text) {
				return next(ApiError.badRequest('empty search field!'))
			}
			const foundUsers = await User.findAll({where: {userName : {[Op.iLike] : '%'+text+'%'}}})
			// console.log(foundUsers)
			return res.json(foundUsers)
		} catch (error) {
			return next(ApiError.internal(error))
		}
		
	}
	async getMultiple (req,res,next) {
		try {
			let {ids} = req.body
			// console.log(ids)
			ids = ids.map(Number)
			// console.log("ids:", ids);
			if (!ids) {
				ApiError.badRequest('wrong id data')
			}
			const users = await User.findAll({
				where: {
					id: ids
				},
				nest: true,
				include: [{model: UserInfo, attributes: ["status"]}]
			})
			users.forEach(u => {u.status = u.user_info.status; delete u.user_info})		
			return res.json(users)
		} catch (error) {
			return next(ApiError.internal(error))
		}
	}
	async checkPassword (req,res,next){
		try {
			const {inputPass, userId} = req.body
			const password = await UserInfo.findOne({where: {userId}, attributes: ['password']})
			return res.json(bcrypt.compareSync(inputPass, password.get('password')))
		} catch (error) {
			return next(ApiError.internal(error))
		}
	}
	async getUser (req, res, next){
		try {
			const userId = req.params.id
			if (!userId) {
				return next(ApiError.badRequest('specify user id'))
			}
			const user = await User.findOne({where: { id: userId }})
			return res.json(user)
		} catch (error) {
			return next(ApiError.internal(error))
		}
	}
	async changeOnlineStatus (req,res,next	){
		try {
			const {userId, isOnline} = req.params
			console.log("userId: ", userId, "isOnline: ", isOnline)
			await User.update({isOnline},{where: {id:userId}})
			if (res){
				return res.status(200).send('OK')
			}
		} catch (error) {
			console.log(error)
			return (error)
		}
	}
	async changePassword (req,res,next){
		try {
			const {newPassword, token} = req.body
			if (!newPassword || !token){
				return next(ApiError.badRequest('no password or token specified'))
			}
			const changingUser = await PasswordTokens.findOne({where: {token}})
			if (!changingUser){
				return next(ApiError.badRequest('no password recovery requested'))
			}
			else if (changingUser.expired){
				return next(ApiError.badRequest('password recovery expired'))
			}
			const hashPassword = await bcrypt.hash(newPassword, 10)
			await UserInfo.update({password: hashPassword}, {where: {email: changingUser.email}})
		} catch (error) {
			console.log(error)
			return next(ApiError.internal(error))
		}
	}
}

module.exports = new UserController()