const { DataTypes } = require('sequelize')
const sequelize = require('../db')

const UserInfo = sequelize.define('user_info', {
	email: {type:DataTypes.STRING, allowNull: false, unique: true},
	password: {type:DataTypes.STRING, allowNull: false},
	phoneNumber: {type:DataTypes.STRING, allowNull: true},
	postList: {type:DataTypes.ARRAY(DataTypes.INTEGER), defaultValue: []},
	groupList: {type:DataTypes.ARRAY(DataTypes.INTEGER), defaultValue: []},
	friendList: {type:DataTypes.ARRAY(DataTypes.INTEGER), defaultValue: []},
	mediaList: {type:DataTypes.ARRAY(DataTypes.INTEGER), defaultValue: []},
	birthYear: {type:DataTypes.INTEGER, allowNull: false},
	birthMonth: {type:DataTypes.INTEGER, allowNull: false},
	birthDay: {type:DataTypes.INTEGER, allowNull: false},
	status: {type:DataTypes.STRING, allowNull: true},	
	userId: {type:DataTypes.INTEGER, primaryKey: true, allowNull: false},
	chatList: {type:DataTypes.ARRAY(DataTypes.INTEGER), allowNull: true, defaultValue: []},
	tokenVersion: {type:DataTypes.INTEGER, allowNull:false, defaultValue:0},
	isPrivate: {type:DataTypes.BOOLEAN, allowNull: false, defaultValue: false},
	profileHeaderPicture: {type:DataTypes.STRING, allowNull: true, defaultValue: "defaultProfileHeader.png"}
})

const User = sequelize.define('user', {
	id: {type:DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
	userName: {type:DataTypes.STRING, allowNull: false, unique:true},
	lastOnline: {type:DataTypes.DATE},
	profilePicture: {type:DataTypes.STRING, defaultValue: 'nopfp.webp'},
	role: {type:DataTypes.STRING, defaultValue: 'USER'},
	isOnline: {type:DataTypes.BOOLEAN, defaultValue: true}
})

const Chat = sequelize.define('chat', {
	id: {type:DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
	userList: {type:DataTypes.ARRAY(DataTypes.INTEGER), defaultValue: []},
	mediaList: {type:DataTypes.ARRAY(DataTypes.STRING), defaultValue: []},
	adminList: {type:DataTypes.ARRAY(DataTypes.INTEGER), allowNull: false},
})

const Message = sequelize.define('message', {
	id: {type:DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
	sender: {type:DataTypes.INTEGER, allowNull: false},
	reciever: {type:DataTypes.INTEGER, allowNull: true},
	text: {type:DataTypes.STRING(20000)},
	media: {type:DataTypes.ARRAY(DataTypes.STRING), defaultValue: []},
	chatId: {type:DataTypes.INTEGER,allowNull: false},
	respondTo: {type:DataTypes.INTEGER,allowNull: true}
})



const Group = sequelize.define('group', {
	id: {type:DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
	memberList: {type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: []},
	name: {type: DataTypes.STRING, allowNull: false, unique: true},
	type: {type: DataTypes.STRING, allowNull: false, defaultValue: 'opened'}
})

const Post = sequelize.define('post', {
	id: {type:DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
	authorId: {type: DataTypes.INTEGER, allowNull: false },
	mediaList: {type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: []},
	text: {type: DataTypes.STRING(3000), defaultValue: ''},
	likedUsers: {type: DataTypes.ARRAY(DataTypes.INTEGER), defaultValue: []},
	repostedUsers: {type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: []}
})

const Comment = sequelize.define('comment', {
	id: {type:DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
	media: {type: DataTypes.STRING, allowNull: true, defaultValue: null},
	userId: {type: DataTypes.INTEGER, allowNull: false},
	replyingToCommentId: {type: DataTypes.INTEGER, allowNull: true, defaultValue: null},
	text: {type: DataTypes.STRING(5000), allowNull: true},
	postId: {type: DataTypes.INTEGER, allowNull: false},
	likedUsers: {type: DataTypes.ARRAY(DataTypes.INTEGER), defaultValue: []},
})

const PasswordTokens = sequelize.define('passwordToken', {
	id: {type:DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
	email: {type:DataTypes.STRING, allowNull: false, unique: true},
	token: {type:DataTypes.STRING, allowNull: false, unique: true},
	expired: {type:DataTypes.BOOLEAN, allowNull: false, defaultValue: true}
})

User.hasOne(UserInfo)
UserInfo.belongsTo(User)

User.hasMany(Post, {as : 'post'})
Post.belongsTo(User)

Post.hasMany(Comment, {as : 'comment'})
Comment.belongsTo(Post)

Group.hasMany(Post, {as : 'post'})
Post.belongsTo(Group)

Chat.hasMany(Message, {as : 'message'})
Message.belongsTo(Chat)

module.exports = {
	User,
	Post,
	Group,
	Message,
	Chat,
	Comment,
	UserInfo,
	PasswordTokens
}